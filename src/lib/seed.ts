import { redis, KEYS, generateId } from './db';
import type { Account, Transaction } from './types';

const accountsData: Omit<Account, 'id'>[] = [
  {
    userId: 'user-001',
    name: 'Main Checking',
    type: 'checking',
    balance: 15420.50,
    currency: 'USD',
    institution: 'Chase Bank',
    lastUpdated: '2026-05-20',
    status: 'active',
    category: 'contingency',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    userId: 'user-001',
    name: 'High-Yield Savings',
    type: 'savings',
    balance: 45000.00,
    currency: 'USD',
    institution: 'Marcus by Goldman Sachs',
    lastUpdated: '2026-05-19',
    status: 'active',
    category: 'emergency',
    createdAt: '2025-02-01T09:00:00Z',
  },
  {
    userId: 'user-001',
    name: 'Investment Portfolio',
    type: 'investment',
    balance: 156250.00,
    currency: 'USD',
    institution: 'Fidelity',
    lastUpdated: '2026-05-20',
    status: 'active',
    category: 'investment',
    createdAt: '2025-03-10T14:00:00Z',
  },
  {
    userId: 'user-001',
    name: '401(k) Retirement',
    type: 'investment',
    balance: 62500.00,
    currency: 'USD',
    institution: 'Vanguard',
    lastUpdated: '2026-05-18',
    status: 'active',
    category: 'retirement',
    createdAt: '2025-01-20T11:00:00Z',
  },
  {
    userId: 'user-001',
    name: 'Travel Fund',
    type: 'savings',
    balance: 3200.00,
    currency: 'USD',
    institution: 'Ally Bank',
    lastUpdated: '2026-05-15',
    status: 'active',
    category: 'contingency',
    createdAt: '2025-06-01T08:00:00Z',
  },
  {
    userId: 'user-001',
    name: 'Business Credit Card',
    type: 'credit',
    balance: -2379.50,
    currency: 'USD',
    institution: 'American Express',
    lastUpdated: '2026-05-20',
    status: 'active',
    category: 'contingency',
    createdAt: '2025-04-15T16:00:00Z',
  },
];

const transactionsData: Omit<Transaction, 'id'>[] = [
  {
    userId: 'user-001',
    date: '2026-05-20',
    description: 'Salary Deposit',
    amount: 12500.00,
    type: 'income',
    categoryId: 'cat-001',
    accountId: 'acc-001',
    status: 'completed',
    merchant: 'Employer Inc.',
    createdAt: '2026-05-20T09:00:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-19',
    description: 'Grocery Shopping',
    amount: -156.42,
    type: 'expense',
    categoryId: 'cat-004',
    accountId: 'acc-001',
    status: 'completed',
    merchant: 'Whole Foods Market',
    createdAt: '2026-05-19T14:30:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-18',
    description: 'Investment Dividend',
    amount: 342.18,
    type: 'income',
    categoryId: 'cat-003',
    accountId: 'acc-003',
    status: 'completed',
    createdAt: '2026-05-18T10:00:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-17',
    description: 'Electric Bill',
    amount: -89.50,
    type: 'expense',
    categoryId: 'cat-005',
    accountId: 'acc-001',
    status: 'completed',
    merchant: 'City Power Co.',
    createdAt: '2026-05-17T16:00:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-16',
    description: 'Restaurant Dinner',
    amount: -78.90,
    type: 'expense',
    categoryId: 'cat-006',
    accountId: 'acc-006',
    status: 'completed',
    merchant: 'The Italian Place',
    createdAt: '2026-05-16T20:00:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-15',
    description: 'Freelance Payment',
    amount: 2500.00,
    type: 'income',
    categoryId: 'cat-002',
    accountId: 'acc-001',
    status: 'completed',
    merchant: 'Client Corp',
    createdAt: '2026-05-15T11:00:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-14',
    description: 'Gas Station',
    amount: -45.20,
    type: 'expense',
    categoryId: 'cat-007',
    accountId: 'acc-006',
    status: 'completed',
    merchant: 'Shell',
    createdAt: '2026-05-14T08:30:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-13',
    description: 'Online Subscription',
    amount: -14.99,
    type: 'expense',
    categoryId: 'cat-008',
    accountId: 'acc-001',
    status: 'completed',
    merchant: 'Netflix',
    createdAt: '2026-05-13T12:00:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-12',
    description: 'Transfer to Savings',
    amount: -1000.00,
    type: 'transfer',
    categoryId: 'cat-011',
    accountId: 'acc-001',
    status: 'completed',
    createdAt: '2026-05-12T10:00:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-11',
    description: 'Medical Checkup',
    amount: -250.00,
    type: 'expense',
    categoryId: 'cat-009',
    accountId: 'acc-001',
    status: 'completed',
    merchant: 'Health Clinic',
    createdAt: '2026-05-11T15:00:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-10',
    description: 'Stock Purchase',
    amount: -2000.00,
    type: 'investment',
    categoryId: 'cat-012',
    accountId: 'acc-003',
    status: 'completed',
    merchant: 'AAPL',
    createdAt: '2026-05-10T09:30:00Z',
  },
  {
    userId: 'user-001',
    date: '2026-05-09',
    description: 'Rent Payment',
    amount: -1800.00,
    type: 'expense',
    categoryId: 'cat-010',
    accountId: 'acc-001',
    status: 'completed',
    merchant: 'Property Management',
    createdAt: '2026-05-09T10:00:00Z',
  },
];

export async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  const existingAccounts = await redis.smembers(KEYS.ACCOUNTS_INDEX);
  const existingTransactions = await redis.smembers(KEYS.TRANSACTIONS_INDEX);

  if (existingAccounts.length > 0) {
    const accountKeys = existingAccounts.map((id) => `${KEYS.ACCOUNT}:${id}`);
    await redis.del(...accountKeys, KEYS.ACCOUNTS_INDEX);
  }

  if (existingTransactions.length > 0) {
    const txnKeys = existingTransactions.map((id) => `${KEYS.TRANSACTION}:${id}`);
    await redis.del(...txnKeys, KEYS.TRANSACTIONS_INDEX);
  }

  // Seed accounts
  const accountIds: string[] = [];
  for (const data of accountsData) {
    const id = generateId('acc');
    const account: Account = { id, ...data };
    await redis.hset(`${KEYS.ACCOUNT}:${id}`, account);
    await redis.sadd(KEYS.ACCOUNTS_INDEX, id);
    accountIds.push(id);
    console.log(`  Created account: ${account.name} (${id})`);
  }

  // Map old account IDs to new ones
  const accountIdMap: Record<string, string> = {
    'acc-001': accountIds[0],
    'acc-002': accountIds[1],
    'acc-003': accountIds[2],
    'acc-004': accountIds[3],
    'acc-005': accountIds[4],
    'acc-006': accountIds[5],
  };

  // Seed transactions
  for (const data of transactionsData) {
    const id = generateId('txn');
    const txn: Transaction = {
      id,
      ...data,
      accountId: accountIdMap[data.accountId] || data.accountId,
    };
    await redis.hset(`${KEYS.TRANSACTION}:${id}`, txn);
    await redis.sadd(KEYS.TRANSACTIONS_INDEX, id);
    await redis.zadd(`${KEYS.TRANSACTIONS_BY_ACCOUNT}:${txn.accountId}`, {
      score: new Date(txn.date).getTime(),
      member: id,
    });
    await redis.zadd(`${KEYS.TRANSACTIONS_BY_CATEGORY}:${txn.categoryId}`, {
      score: new Date(txn.date).getTime(),
      member: id,
    });
    await redis.zadd(`${KEYS.TRANSACTIONS_BY_DATE}:user-001`, {
      score: new Date(txn.date).getTime(),
      member: id,
    });
    console.log(`  Created transaction: ${txn.description} (${id})`);
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
