import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: import.meta.env?.UPSTASH_REDIS_REST_URL ?? process.env.UPSTASH_REDIS_REST_URL!,
  token: import.meta.env?.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Key prefixes for organizing data
export const KEYS = {
  ACCOUNT: 'account',
  ACCOUNTS_INDEX: 'accounts:index',
  TRANSACTION: 'transaction',
  TRANSACTIONS_INDEX: 'transactions:index',
  TRANSACTIONS_BY_ACCOUNT: 'transactions:by-account',
  TRANSACTIONS_BY_CATEGORY: 'transactions:by-category',
  TRANSACTIONS_BY_DATE: 'transactions:by-date',
  STOCK_ACCOUNT: 'stock-account',
  STOCK_ACCOUNTS_INDEX: 'stock-accounts:index',
  STOCK_POSITION: 'stock-position',
  STOCK_POSITIONS_INDEX: 'stock-positions:index',
  STOCK_POSITIONS_BY_ACCOUNT: 'stock-positions:by-account',
  BILLING_RECORD: 'billing-record',
  BILLING_RECORDS_INDEX: 'billing-records:index',
  BILLING_BALANCE_SNAPSHOT: 'billing-balance-snapshot',
  BILLING_BALANCE_SNAPSHOTS_INDEX: 'billing-balance-snapshots:index',
  BILLING_SEED_VERSION: 'billing:seed-version',
  EXPENSE: 'expense',
  EXPENSES_INDEX: 'expenses:index',
  EXPENSES_BY_DATE: 'expenses:by-date',
  EXPENSE_SETTINGS: 'expenses:settings',
  NOTIFICATION_LOG: 'notification-log',
} as const;
