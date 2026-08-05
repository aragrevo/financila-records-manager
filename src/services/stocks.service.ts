import { redis, KEYS } from "../lib/db";
import type { StockBrokerAccount, StockPosition } from "../lib/types";
import {
  DEFAULT_USER_ID,
  fetchAllStockAccounts,
  fetchAllStockPositions,
  hydrateStockPositions,
} from "../lib/queries";

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const sanitizeRecord = (
  value: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== null && entryValue !== undefined),
  );

const normalizeStockAccount = (
  account: StockBrokerAccount,
): StockBrokerAccount => ({
  ...account,
  availableCash: toNumber(account.availableCash),
  monthlyContribution: toNumber(account.monthlyContribution),
});

const normalizeStockPosition = (
  position: StockPosition,
): StockPosition => ({
  ...position,
  status: position.status === "closed" ? "closed" : "active",
  shares: toNumber(position.shares),
  averageCost: toNumber(position.averageCost),
  currentPrice: toNumber(position.currentPrice),
  closedAt: position.closedAt || undefined,
});

export type CreateStockAccountInput = Pick<
  StockBrokerAccount,
  "broker" | "name" | "owner" | "currency" | "availableCash" | "monthlyContribution" | "status"
> &
  Partial<Pick<StockBrokerAccount, "strategy" | "notes">>;

export type CreateStockPositionInput = Pick<
  StockPosition,
  "accountId" | "symbol" | "name" | "assetType" | "shares" | "averageCost"
> &
  Partial<Pick<StockPosition, "currentPrice" | "sector" | "region" | "notes">>;

export class StocksService {
  async getAccounts(): Promise<StockBrokerAccount[]> {
    const accounts = (await fetchAllStockAccounts()).map(normalizeStockAccount);
    return accounts.sort((left, right) => left.name.localeCompare(right.name));
  }

  async getAccountById(id: string): Promise<StockBrokerAccount | null> {
    const account = await redis.hgetall<StockBrokerAccount & Record<string, unknown>>(
      `${KEYS.STOCK_ACCOUNT}:${id}`,
    );
    if (!account || !account.id) return null;
    return normalizeStockAccount(account);
  }

  async createAccount(input: CreateStockAccountInput): Promise<StockBrokerAccount> {
    const id = `stk-acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const account: StockBrokerAccount = {
      id,
      userId: DEFAULT_USER_ID,
      strategy: "",
      notes: "",
      ...input,
      availableCash: toNumber(input.availableCash),
      monthlyContribution: toNumber(input.monthlyContribution),
      createdAt: now,
      updatedAt: now,
    };

    const pipeline = redis.pipeline();
    pipeline.hset(
      `${KEYS.STOCK_ACCOUNT}:${id}`,
      sanitizeRecord(account as unknown as Record<string, unknown>),
    );
    pipeline.sadd(KEYS.STOCK_ACCOUNTS_INDEX, id);
    await pipeline.exec();

    return normalizeStockAccount(account);
  }

  async updateAccount(
    id: string,
    input: Partial<Omit<StockBrokerAccount, "id" | "userId" | "createdAt">>,
  ): Promise<StockBrokerAccount | null> {
    const existing = await this.getAccountById(id);
    if (!existing) return null;

    const updated: StockBrokerAccount = {
      ...existing,
      ...input,
      id,
      availableCash: toNumber(input.availableCash ?? existing.availableCash),
      monthlyContribution: toNumber(
        input.monthlyContribution ?? existing.monthlyContribution,
      ),
      updatedAt: new Date().toISOString(),
    };

    await redis.hset(
      `${KEYS.STOCK_ACCOUNT}:${id}`,
      sanitizeRecord(updated as unknown as Record<string, unknown>),
    );

    return normalizeStockAccount(updated);
  }

  async deleteAccount(id: string): Promise<boolean> {
    const existing = await this.getAccountById(id);
    if (!existing) return false;

    const positionIds = await redis.zrange<string[]>(
      `${KEYS.STOCK_POSITIONS_BY_ACCOUNT}:${id}`,
      0,
      -1,
    );

    const pipeline = redis.pipeline();
    pipeline.del(`${KEYS.STOCK_ACCOUNT}:${id}`);
    pipeline.srem(KEYS.STOCK_ACCOUNTS_INDEX, id);
    pipeline.del(`${KEYS.STOCK_POSITIONS_BY_ACCOUNT}:${id}`);

    for (const positionId of positionIds) {
      pipeline.del(`${KEYS.STOCK_POSITION}:${positionId}`);
      pipeline.srem(KEYS.STOCK_POSITIONS_INDEX, positionId);
    }

    await pipeline.exec();
    return true;
  }

  async getPositions(accountId?: string): Promise<StockPosition[]> {
    if (!accountId) {
      const positions = (await fetchAllStockPositions()).map(normalizeStockPosition);
      return positions.sort((left, right) => right.currentPrice * right.shares - left.currentPrice * left.shares);
    }

    const ids = await redis.zrange<string[]>(
      `${KEYS.STOCK_POSITIONS_BY_ACCOUNT}:${accountId}`,
      0,
      -1,
      { rev: true },
    );
    const positions = (await hydrateStockPositions(ids)).map(normalizeStockPosition);
    return positions.sort((left, right) => right.currentPrice * right.shares - left.currentPrice * left.shares);
  }

  async getPositionById(id: string): Promise<StockPosition | null> {
    const position = await redis.hgetall<StockPosition & Record<string, unknown>>(
      `${KEYS.STOCK_POSITION}:${id}`,
    );
    if (!position || !position.id) return null;
    return normalizeStockPosition(position);
  }

  async createPosition(input: CreateStockPositionInput): Promise<StockPosition> {
    const account = await this.getAccountById(input.accountId);
    if (!account) {
      throw new Error("Stock account not found");
    }

    const id = `stk-pos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const averageCost = toNumber(input.averageCost);
    const currentPriceInput = input.currentPrice;
    const currentPrice =
      currentPriceInput === null ||
      currentPriceInput === undefined ||
      currentPriceInput === ""
        ? averageCost
        : toNumber(currentPriceInput);

    const position: StockPosition = {
      id,
      userId: DEFAULT_USER_ID,
      status: "active",
      sector: "",
      region: "",
      notes: "",
      ...input,
      symbol: input.symbol.toUpperCase(),
      shares: toNumber(input.shares),
      averageCost,
      currentPrice,
      closedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    const score = new Date(now).getTime();
    const pipeline = redis.pipeline();
    pipeline.hset(
      `${KEYS.STOCK_POSITION}:${id}`,
      sanitizeRecord(position as unknown as Record<string, unknown>),
    );
    pipeline.sadd(KEYS.STOCK_POSITIONS_INDEX, id);
    pipeline.zadd(`${KEYS.STOCK_POSITIONS_BY_ACCOUNT}:${position.accountId}`, {
      score,
      member: id,
    });
    await pipeline.exec();

    return normalizeStockPosition(position);
  }

  async updatePosition(
    id: string,
    input: Partial<Omit<StockPosition, "id" | "userId" | "createdAt">>,
  ): Promise<StockPosition | null> {
    const existing = await this.getPositionById(id);
    if (!existing) return null;

    const updated: StockPosition = {
      ...existing,
      ...input,
      id,
      symbol: (input.symbol ?? existing.symbol).toUpperCase(),
      status: input.status === "closed" ? "closed" : input.status === "active" ? "active" : existing.status,
      shares: toNumber(input.shares ?? existing.shares),
      averageCost: toNumber(input.averageCost ?? existing.averageCost),
      currentPrice: toNumber(input.currentPrice ?? existing.currentPrice),
      closedAt:
        input.status === "closed"
          ? input.closedAt ?? existing.closedAt ?? new Date().toISOString()
          : input.status === "active"
            ? undefined
            : input.closedAt ?? existing.closedAt,
      updatedAt: new Date().toISOString(),
    };

    const pipeline = redis.pipeline();
    pipeline.hset(
      `${KEYS.STOCK_POSITION}:${id}`,
      sanitizeRecord(updated as unknown as Record<string, unknown>),
    );

    if (updated.accountId !== existing.accountId) {
      pipeline.zrem(`${KEYS.STOCK_POSITIONS_BY_ACCOUNT}:${existing.accountId}`, id);
      pipeline.zadd(`${KEYS.STOCK_POSITIONS_BY_ACCOUNT}:${updated.accountId}`, {
        score: new Date(updated.updatedAt).getTime(),
        member: id,
      });
    }

    await pipeline.exec();
    return normalizeStockPosition(updated);
  }

  async closePosition(id: string): Promise<StockPosition | null> {
    return this.updatePosition(id, {
      status: "closed",
      closedAt: new Date().toISOString(),
    });
  }

  async deletePosition(id: string): Promise<boolean> {
    const existing = await this.getPositionById(id);
    if (!existing) return false;

    const pipeline = redis.pipeline();
    pipeline.del(`${KEYS.STOCK_POSITION}:${id}`);
    pipeline.srem(KEYS.STOCK_POSITIONS_INDEX, id);
    pipeline.zrem(`${KEYS.STOCK_POSITIONS_BY_ACCOUNT}:${existing.accountId}`, id);
    await pipeline.exec();

    return true;
  }
}

export const stocksService = new StocksService();
