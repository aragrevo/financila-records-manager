export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  currency: string;
  institution: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'pending';
  category: 'emergency' | 'investment' | 'retirement' | 'contingency';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'investment';
  categoryId: string;
  accountId: string;
  status: 'completed' | 'pending' | 'cancelled';
  merchant?: string;
  createdAt: string;
}
