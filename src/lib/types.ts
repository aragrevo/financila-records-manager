import type { AccountType, AccountCategory, TransactionType } from './constants';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institution: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'pending';
  category: AccountCategory;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  status: 'completed' | 'pending' | 'cancelled';
  merchant?: string;
  createdAt: string;
}
