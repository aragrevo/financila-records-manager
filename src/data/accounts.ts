export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  currency: string;
  institution: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'pending';
  category: 'emergency' | 'investment' | 'retirement' | 'contingency';
}

export const accountsData: Account[] = [
  {
    id: 'acc-001',
    name: 'Main Checking',
    type: 'checking',
    balance: 15420.50,
    currency: 'USD',
    institution: 'Chase Bank',
    lastUpdated: '2026-05-20',
    status: 'active',
    category: 'contingency',
  },
  {
    id: 'acc-002',
    name: 'High-Yield Savings',
    type: 'savings',
    balance: 45000.00,
    currency: 'USD',
    institution: 'Marcus by Goldman Sachs',
    lastUpdated: '2026-05-19',
    status: 'active',
    category: 'emergency',
  },
  {
    id: 'acc-003',
    name: 'Investment Portfolio',
    type: 'investment',
    balance: 156250.00,
    currency: 'USD',
    institution: 'Fidelity',
    lastUpdated: '2026-05-20',
    status: 'active',
    category: 'investment',
  },
  {
    id: 'acc-004',
    name: '401(k) Retirement',
    type: 'investment',
    balance: 62500.00,
    currency: 'USD',
    institution: 'Vanguard',
    lastUpdated: '2026-05-18',
    status: 'active',
    category: 'retirement',
  },
  {
    id: 'acc-005',
    name: 'Travel Fund',
    type: 'savings',
    balance: 3200.00,
    currency: 'USD',
    institution: 'Ally Bank',
    lastUpdated: '2026-05-15',
    status: 'active',
    category: 'contingency',
  },
  {
    id: 'acc-006',
    name: 'Business Credit Card',
    type: 'credit',
    balance: -2379.50,
    currency: 'USD',
    institution: 'American Express',
    lastUpdated: '2026-05-20',
    status: 'active',
    category: 'contingency',
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
