import { accountsData, type Account } from '../data/accounts';

export interface AccountsFilter {
  type?: Account['type'];
  category?: Account['category'];
  status?: Account['status'];
}

export class AccountsService {
  async getAll(filters?: AccountsFilter): Promise<Account[]> {
    let results = [...accountsData];

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
    return accountsData.find(a => a.id === id) ?? null;
  }

  async getTotalBalance(): Promise<number> {
    return accountsData.reduce((total, a) => total + a.balance, 0);
  }

  async getByCategory(category: Account['category']): Promise<Account[]> {
    return accountsData.filter(a => a.category === category);
  }

  async getByType(type: Account['type']): Promise<Account[]> {
    return accountsData.filter(a => a.type === type);
  }
}

export const accountsService = new AccountsService();
