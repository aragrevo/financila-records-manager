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
  BILLING_RECORD: 'billing-record',
  BILLING_RECORDS_INDEX: 'billing-records:index',
  BILLING_BALANCE_SNAPSHOT: 'billing-balance-snapshot',
  BILLING_BALANCE_SNAPSHOTS_INDEX: 'billing-balance-snapshots:index',
  BILLING_SEED_VERSION: 'billing:seed-version',
} as const;
