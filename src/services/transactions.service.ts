import { redis, KEYS } from "../lib/db";
import type { Transaction } from "../lib/types";
import {
  DEFAULT_USER_ID,
  TRANSACTIONS_DATE_KEY,
  hydrateTransactions,
} from "../lib/queries";

export interface TransactionsFilter {
  type?: Transaction["type"];
  categoryId?: string;
  accountId?: string;
  status?: Transaction["status"];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export type CreateTransactionInput = Pick<
  Transaction,
  "description" | "amount" | "type" | "accountId" | "categoryId"
> &
  Partial<Pick<Transaction, "date" | "merchant" | "status">>;

const dateScore = (date: string) => new Date(date).getTime();

export class TransactionsService {
  async getAll(filters?: TransactionsFilter): Promise<Transaction[]> {
    const ids = await this.getIds(filters);
    const transactions = await hydrateTransactions(ids);

    let results = transactions;

    if (filters?.type) {
      results = results.filter((t) => t.type === filters.type);
    }
    if (filters?.status) {
      results = results.filter((t) => t.status === filters.status);
    }

    return results;
  }

  async getCount(
    filters?: Pick<
      TransactionsFilter,
      "accountId" | "categoryId" | "startDate" | "endDate"
    >,
  ): Promise<number> {
    const key = this.getIndexKey(filters?.accountId, filters?.categoryId);

    if (filters?.startDate || filters?.endDate) {
      const min = filters.startDate ? dateScore(filters.startDate) : "-inf";
      const max = filters.endDate ? dateScore(filters.endDate) : "+inf";
      return redis.zcount(key, min, max);
    }

    return redis.zcard(key);
  }

  async getById(id: string): Promise<Transaction | null> {
    const txn = await redis.hgetall<Transaction & Record<string, unknown>>(
      `${KEYS.TRANSACTION}:${id}`,
    );
    if (!txn || !txn.id) return null;
    return txn;
  }

  async getByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Transaction[]> {
    return this.getAll({ startDate, endDate });
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const id = `txn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const date = input.date || new Date().toISOString().split("T")[0];

    const transaction: Transaction = {
      id,
      userId: DEFAULT_USER_ID,
      createdAt: new Date().toISOString(),
      status: input.status ?? "completed",
      date,
      description: input.description,
      amount: input.amount,
      type: input.type,
      accountId: input.accountId,
      categoryId: input.categoryId,
      ...(input.merchant ? { merchant: input.merchant } : {}),
    };

    const score = dateScore(date);
    const accountKey = `${KEYS.ACCOUNT}:${transaction.accountId}`;
    const accountExists = await redis.exists(accountKey);

    const pipeline = redis.pipeline();
    pipeline.hset(
      `${KEYS.TRANSACTION}:${id}`,
      transaction as unknown as Record<string, unknown>,
    );
    pipeline.sadd(KEYS.TRANSACTIONS_INDEX, id);
    pipeline.zadd(`${KEYS.TRANSACTIONS_BY_ACCOUNT}:${transaction.accountId}`, {
      score,
      member: id,
    });
    pipeline.zadd(`${KEYS.TRANSACTIONS_BY_CATEGORY}:${transaction.categoryId}`, {
      score,
      member: id,
    });
    pipeline.zadd(TRANSACTIONS_DATE_KEY, { score, member: id });

    if (accountExists) {
      pipeline.hincrbyfloat(accountKey, "balance", transaction.amount);
      pipeline.hset(accountKey, { lastUpdated: date });
    }

    await pipeline.exec();

    return transaction;
  }

  async update(
    id: string,
    input: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>,
  ): Promise<Transaction | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated: Transaction = { ...existing, ...input, id };

    const pipeline = redis.pipeline();
    pipeline.hset(
      `${KEYS.TRANSACTION}:${id}`,
      updated as unknown as Record<string, unknown>,
    );

    const score = dateScore(updated.date);

    if (updated.accountId !== existing.accountId) {
      pipeline.zrem(
        `${KEYS.TRANSACTIONS_BY_ACCOUNT}:${existing.accountId}`,
        id,
      );
    }
    pipeline.zadd(`${KEYS.TRANSACTIONS_BY_ACCOUNT}:${updated.accountId}`, {
      score,
      member: id,
    });

    if (updated.categoryId !== existing.categoryId) {
      pipeline.zrem(
        `${KEYS.TRANSACTIONS_BY_CATEGORY}:${existing.categoryId}`,
        id,
      );
    }
    pipeline.zadd(`${KEYS.TRANSACTIONS_BY_CATEGORY}:${updated.categoryId}`, {
      score,
      member: id,
    });

    pipeline.zadd(TRANSACTIONS_DATE_KEY, { score, member: id });

    await pipeline.exec();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;

    const accountKey = `${KEYS.ACCOUNT}:${existing.accountId}`;
    const accountExists = await redis.exists(accountKey);

    const pipeline = redis.pipeline();
    pipeline.del(`${KEYS.TRANSACTION}:${id}`);
    pipeline.srem(KEYS.TRANSACTIONS_INDEX, id);
    pipeline.zrem(`${KEYS.TRANSACTIONS_BY_ACCOUNT}:${existing.accountId}`, id);
    pipeline.zrem(
      `${KEYS.TRANSACTIONS_BY_CATEGORY}:${existing.categoryId}`,
      id,
    );
    pipeline.zrem(TRANSACTIONS_DATE_KEY, id);

    if (accountExists) {
      pipeline.hincrbyfloat(accountKey, "balance", -existing.amount);
      pipeline.hset(accountKey, {
        lastUpdated: new Date().toISOString().split("T")[0],
      });
    }

    await pipeline.exec();

    return true;
  }

  private getIndexKey(accountId?: string, categoryId?: string): string {
    if (accountId) return `${KEYS.TRANSACTIONS_BY_ACCOUNT}:${accountId}`;
    if (categoryId) return `${KEYS.TRANSACTIONS_BY_CATEGORY}:${categoryId}`;
    return TRANSACTIONS_DATE_KEY;
  }

  private async getIds(filters?: TransactionsFilter): Promise<string[]> {
    const key = this.getIndexKey(filters?.accountId, filters?.categoryId);
    const needsFullScan = Boolean(filters?.type || filters?.status);

    if (filters?.startDate || filters?.endDate) {
      const min = filters.startDate ? dateScore(filters.startDate) : "-inf";
      const max = filters.endDate ? dateScore(filters.endDate) : "+inf";

      if (needsFullScan || !filters?.limit) {
        return redis.zrange<string[]>(key, max, min, { byScore: true, rev: true });
      }

      return redis.zrange<string[]>(key, max, min, {
        byScore: true,
        rev: true,
        offset: filters.offset ?? 0,
        count: filters.limit,
      });
    }

    if (needsFullScan) {
      return redis.zrange<string[]>(key, 0, -1, { rev: true });
    }

    const offset = filters?.offset ?? 0;
    const stop = filters?.limit ? offset + filters.limit - 1 : -1;
    return redis.zrange<string[]>(key, offset, stop, { rev: true });
  }
}

export const transactionsService = new TransactionsService();
