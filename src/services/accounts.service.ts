import { redis, KEYS } from '../lib/db';
import type { Account } from '../lib/types';

export interface AccountsFilter {
  type?: Account['type'];
  category?: Account['category'];
  status?: Account['status'];
}

export class AccountsService {
  async getAll(filters?: AccountsFilter): Promise<Account[]> {
    const accountIds = await redis.smembers(KEYS.ACCOUNTS_INDEX);
    const accounts: Account[] = [];

    for (const id of accountIds) {
      const account = await redis.hgetall<Account>(`${KEYS.ACCOUNT}:${id}`);
      if (account && account.id) {
        accounts.push(account);
      }
    }

    let results = accounts;

    if (filters?.type) {
      results = results.filter(a => a.type === filters.type);
    }
    if (filters?.category) {
      results = results.filter(a => a.category === filters.category);
    }
    if (filters?.status) {
      results = results.filter(a => a.status === filters.status);
    }

    return results;
  }

  async getById(id: string): Promise<Account | null> {
    const account = await redis.hgetall<Account>(`${KEYS.ACCOUNT}:${id}`);
    if (!account || !account.id) return null;
    return account;
  }

  async getTotalBalance(): Promise<number> {
    const accounts = await this.getAll();
    return accounts.reduce((total, a) => total + a.balance, 0);
  }

  async getByCategory(category: Account['category']): Promise<Account[]> {
    return this.getAll({ category });
  }

  async getByType(type: Account['type']): Promise<Account[]> {
    return this.getAll({ type });
  }
}

export const accountsService = new AccountsService();
