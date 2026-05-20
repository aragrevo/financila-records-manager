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

export const accountsData: Account[] = [
  {
    id: 'acc-001',
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
    id: 'acc-002',
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
    id: 'acc-003',
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
    id: 'acc-004',
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
    id: 'acc-005',
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
    id: 'acc-006',
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

export const getAccountsByCategory = (category: Account['category']): Account[] => {
  return accountsData.filter(account => account.category === category);
};

export const getTotalBalance = (): number => {
  return accountsData.reduce((total, account) => total + account.balance, 0);
};

export const getAccountsByType = (type: Account['type']): Account[] => {
  return accountsData.filter(account => account.type === type);
};
