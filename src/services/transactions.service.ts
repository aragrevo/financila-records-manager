import { transactionsData, type Transaction } from '../data/transactions';

export interface TransactionsFilter {
  type?: Transaction['type'];
  category?: string;
  account?: string;
  status?: Transaction['status'];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class TransactionsService {
  async getAll(filters?: TransactionsFilter): Promise<Transaction[]> {
    let results = [...transactionsData];

    if (filters?.type) {
      results = results.filter(t => t.type === filters.type);
    }
    if (filters?.category) {
      results = results.filter(t => t.category === filters.category);
    }
    if (filters?.account) {
      results = results.filter(t => t.account === filters.account);
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

    const total = results.length;

    if (filters?.offset) {
      results = results.slice(filters.offset);
    }
    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async getById(id: string): Promise<Transaction | null> {
    return transactionsData.find(t => t.id === id) ?? null;
  }

  async getTotalIncome(): Promise<number> {
    return transactionsData
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
  }

  async getTotalExpenses(): Promise<number> {
    return transactionsData
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + Math.abs(t.amount), 0);
  }

  async getByType(type: Transaction['type']): Promise<Transaction[]> {
    return transactionsData.filter(t => t.type === type);
  }

  async getByCategory(category: string): Promise<Transaction[]> {
    return transactionsData.filter(t => t.category === category);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return transactionsData.filter(t => t.date >= startDate && t.date <= endDate);
  }
}

export const transactionsService = new TransactionsService();
