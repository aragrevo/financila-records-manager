import { redis, KEYS } from "../lib/db";
import type { Account } from "../lib/types";
import { DEFAULT_USER_ID, fetchAllAccounts } from "../lib/queries";

export interface AccountsFilter {
  type?: Account["type"];
  category?: Account["category"];
  status?: Account["status"];
}

export type CreateAccountInput = Pick<
  Account,
  "name" | "type" | "balance" | "institution" | "category"
> &
  Partial<Pick<Account, "currency" | "status">>;

export class AccountsService {
  async getAll(filters?: AccountsFilter): Promise<Account[]> {
    let results = await fetchAllAccounts();

    if (filters?.type) {
      results = results.filter((a) => a.type === filters.type);
    }
    if (filters?.category) {
      results = results.filter((a) => a.category === filters.category);
    }
    if (filters?.status) {
      results = results.filter((a) => a.status === filters.status);
    }

    return results;
  }

  async getById(id: string): Promise<Account | null> {
    const account = await redis.hgetall<Account & Record<string, unknown>>(
      `${KEYS.ACCOUNT}:${id}`,
    );
    if (!account || !account.id) return null;
    return account;
  }

  async create(input: CreateAccountInput): Promise<Account> {
    const id = `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const account: Account = {
      id,
      userId: DEFAULT_USER_ID,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString().split("T")[0],
      currency: "USD",
      status: "active",
      ...input,
    };

    const pipeline = redis.pipeline();
    pipeline.hset(
      `${KEYS.ACCOUNT}:${id}`,
      account as unknown as Record<string, unknown>,
    );
    pipeline.sadd(KEYS.ACCOUNTS_INDEX, id);
    await pipeline.exec();

    return account;
  }

  async update(
    id: string,
    input: Partial<Omit<Account, "id" | "userId" | "createdAt">>,
  ): Promise<Account | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated: Account = {
      ...existing,
      ...input,
      id,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    await redis.hset(
      `${KEYS.ACCOUNT}:${id}`,
      updated as unknown as Record<string, unknown>,
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;

    const pipeline = redis.pipeline();
    pipeline.del(`${KEYS.ACCOUNT}:${id}`);
    pipeline.srem(KEYS.ACCOUNTS_INDEX, id);
    await pipeline.exec();

    return true;
  }
}

export const accountsService = new AccountsService();
