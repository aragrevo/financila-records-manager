import { redis, KEYS } from "./db";
import type {
  Account,
  Transaction,
  TransactionWithAccount,
  StockBrokerAccount,
  StockPosition,
} from "./types";

export const DEFAULT_USER_ID = "user-001";

export const TRANSACTIONS_DATE_KEY = `${KEYS.TRANSACTIONS_BY_DATE}:${DEFAULT_USER_ID}`;

const hasId = <T extends { id?: unknown }>(
  value: T | null | undefined,
): value is T & { id: string } => Boolean(value && value.id);

export async function hydrateAccounts(ids: string[]): Promise<Account[]> {
  if (ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.hgetall(`${KEYS.ACCOUNT}:${id}`);
  }

  const results = (await pipeline.exec()) as Array<Account | null>;
  return results.filter(hasId);
}

export async function fetchAllAccounts(): Promise<Account[]> {
  const ids = await redis.smembers(KEYS.ACCOUNTS_INDEX);
  return hydrateAccounts(ids);
}

export async function hydrateTransactions(
  ids: string[],
): Promise<Transaction[]> {
  if (ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.hgetall(`${KEYS.TRANSACTION}:${id}`);
  }

  const results = (await pipeline.exec()) as Array<Transaction | null>;
  return results.filter(hasId);
}

export async function withAccountNames(
  transactions: Transaction[],
): Promise<TransactionWithAccount[]> {
  if (transactions.length === 0) return [];

  const accountIds = [...new Set(transactions.map((t) => t.accountId))];
  const accounts = await hydrateAccounts(accountIds);
  const names = new Map(accounts.map((a) => [a.id, a.name]));

  return transactions.map((t) => ({
    ...t,
    accountName: names.get(t.accountId) || t.accountId,
  }));
}

export async function hydrateStockAccounts(
  ids: string[],
): Promise<StockBrokerAccount[]> {
  if (ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.hgetall(`${KEYS.STOCK_ACCOUNT}:${id}`);
  }

  const results = (await pipeline.exec()) as Array<StockBrokerAccount | null>;
  return results.filter(hasId);
}

export async function fetchAllStockAccounts(): Promise<StockBrokerAccount[]> {
  const ids = await redis.smembers(KEYS.STOCK_ACCOUNTS_INDEX);
  return hydrateStockAccounts(ids);
}

export async function hydrateStockPositions(
  ids: string[],
): Promise<StockPosition[]> {
  if (ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.hgetall(`${KEYS.STOCK_POSITION}:${id}`);
  }

  const results = (await pipeline.exec()) as Array<StockPosition | null>;
  return results.filter(hasId);
}

export async function fetchAllStockPositions(): Promise<StockPosition[]> {
  const ids = await redis.smembers(KEYS.STOCK_POSITIONS_INDEX);
  return hydrateStockPositions(ids);
}
