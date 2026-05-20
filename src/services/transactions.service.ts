import { redis, KEYS } from '../lib/db';
import type { Transaction } from '../lib/types';

export interface TransactionsFilter {
  type?: Transaction['type'];
  categoryId?: string;
  accountId?: string;
  status?: Transaction['status'];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class TransactionsService {
  async getAll(filters?: TransactionsFilter): Promise<Transaction[]> {
    let txnIds: string[] = [];

    if (filters?.accountId) {
      txnIds = await redis.zrange(`${KEYS.TRANSACTIONS_BY_ACCOUNT}:${filters.accountId}`, 0, -1, { rev: true });
    } else if (filters?.categoryId) {
      txnIds = await redis.zrange(`${KEYS.TRANSACTIONS_BY_CATEGORY}:${filters.categoryId}`, 0, -1, { rev: true });
    } else {
      txnIds = await redis.zrange(`${KEYS.TRANSACTIONS_BY_DATE}:user-001`, 0, -1, { rev: true });
    }

    const transactions: Transaction[] = [];
    for (const id of txnIds) {
      const txn = await redis.hgetall<Transaction>(`${KEYS.TRANSACTION}:${id}`);
      if (txn && txn.id) {
        transactions.push(txn);
      }
    }

    let results = transactions;

    if (filters?.type) {
      results = results.filter(t => t.type === filters.type);
    }
    if (filters?.status) {
      results = results.filter(t => t.status === filters.status);
    }
    if (filters?.startDate) {
      results = results.filter(t => t.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      results = results.filter(t => t.date <= filters.endDate!);
    }

    if (filters?.offset) {
      results = results.slice(filters.offset);
    }
    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async getById(id: string): Promise<Transaction | null> {
    const txn = await redis.hgetall<Transaction>(`${KEYS.TRANSACTION}:${id}`);
    if (!txn || !txn.id) return null;
    return txn;
  }

  async getTotalIncome(): Promise<number> {
    const txns = await this.getAll({ type: 'income' });
    return txns.reduce((total, t) => total + t.amount, 0);
  }

  async getTotalExpenses(): Promise<number> {
    const txns = await this.getAll({ type: 'expense' });
    return txns.reduce((total, t) => total + Math.abs(t.amount), 0);
  }

  async getByType(type: Transaction['type']): Promise<Transaction[]> {
    return this.getAll({ type });
  }

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    return this.getAll({ categoryId });
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return this.getAll({ startDate, endDate });
  }
}

export const transactionsService = new TransactionsService();
