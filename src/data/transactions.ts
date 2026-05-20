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

export const transactionsData: Transaction[] = [
  {
    id: 'txn-001',
    userId: 'user-001',
    date: '2026-05-20',
    description: 'Salary Deposit',
    amount: 12500.00,
    type: 'income',
    categoryId: 'cat-001', // Salary
    accountId: 'acc-001', // Main Checking
    status: 'completed',
    merchant: 'Employer Inc.',
    createdAt: '2026-05-20T09:00:00Z',
  },
  {
    id: 'txn-002',
    userId: 'user-001',
    date: '2026-05-19',
    description: 'Grocery Shopping',
    amount: -156.42,
    type: 'expense',
    categoryId: 'cat-004', // Food & Groceries
    accountId: 'acc-001', // Main Checking
    status: 'completed',
    merchant: 'Whole Foods Market',
    createdAt: '2026-05-19T14:30:00Z',
  },
  {
    id: 'txn-003',
    userId: 'user-001',
    date: '2026-05-18',
    description: 'Investment Dividend',
    amount: 342.18,
    type: 'income',
    categoryId: 'cat-003', // Investment Returns
    accountId: 'acc-003', // Investment Portfolio
    status: 'completed',
    createdAt: '2026-05-18T10:00:00Z',
  },
  {
    id: 'txn-004',
    userId: 'user-001',
    date: '2026-05-17',
    description: 'Electric Bill',
    amount: -89.50,
    type: 'expense',
    categoryId: 'cat-005', // Utilities
    accountId: 'acc-001', // Main Checking
    status: 'completed',
    merchant: 'City Power Co.',
    createdAt: '2026-05-17T16:00:00Z',
  },
  {
    id: 'txn-005',
    userId: 'user-001',
    date: '2026-05-16',
    description: 'Restaurant Dinner',
    amount: -78.90,
    type: 'expense',
    categoryId: 'cat-006', // Dining Out
    accountId: 'acc-006', // Business Credit Card
    status: 'completed',
    merchant: 'The Italian Place',
    createdAt: '2026-05-16T20:00:00Z',
  },
  {
    id: 'txn-006',
    userId: 'user-001',
    date: '2026-05-15',
    description: 'Freelance Payment',
    amount: 2500.00,
    type: 'income',
    categoryId: 'cat-002', // Freelance
    accountId: 'acc-001', // Main Checking
    status: 'completed',
    merchant: 'Client Corp',
    createdAt: '2026-05-15T11:00:00Z',
  },
  {
    id: 'txn-007',
    userId: 'user-001',
    date: '2026-05-14',
    description: 'Gas Station',
    amount: -45.20,
    type: 'expense',
    categoryId: 'cat-007', // Transportation
    accountId: 'acc-006', // Business Credit Card
    status: 'completed',
    merchant: 'Shell',
    createdAt: '2026-05-14T08:30:00Z',
  },
  {
    id: 'txn-008',
    userId: 'user-001',
    date: '2026-05-13',
    description: 'Online Subscription',
    amount: -14.99,
    type: 'expense',
    categoryId: 'cat-008', // Entertainment
    accountId: 'acc-001', // Main Checking
    status: 'completed',
    merchant: 'Netflix',
    createdAt: '2026-05-13T12:00:00Z',
  },
  {
    id: 'txn-009',
    userId: 'user-001',
    date: '2026-05-12',
    description: 'Transfer to Savings',
    amount: -1000.00,
    type: 'transfer',
    categoryId: 'cat-011', // Savings Transfer
    accountId: 'acc-001', // Main Checking
    status: 'completed',
    createdAt: '2026-05-12T10:00:00Z',
  },
  {
    id: 'txn-010',
    userId: 'user-001',
    date: '2026-05-11',
    description: 'Medical Checkup',
    amount: -250.00,
    type: 'expense',
    categoryId: 'cat-009', // Healthcare
    accountId: 'acc-001', // Main Checking
    status: 'completed',
    merchant: 'Health Clinic',
    createdAt: '2026-05-11T15:00:00Z',
  },
  {
    id: 'txn-011',
    userId: 'user-001',
    date: '2026-05-10',
    description: 'Stock Purchase',
    amount: -2000.00,
    type: 'investment',
    categoryId: 'cat-012', // Stock Investment
    accountId: 'acc-003', // Investment Portfolio
    status: 'completed',
    merchant: 'AAPL',
    createdAt: '2026-05-10T09:30:00Z',
  },
  {
    id: 'txn-012',
    userId: 'user-001',
    date: '2026-05-09',
    description: 'Rent Payment',
    amount: -1800.00,
    type: 'expense',
    categoryId: 'cat-010', // Housing
    accountId: 'acc-001', // Main Checking
    status: 'completed',
    merchant: 'Property Management',
    createdAt: '2026-05-09T10:00:00Z',
  },
];

export const getTransactionsByType = (type: Transaction['type']): Transaction[] => {
  return transactionsData.filter(txn => txn.type === type);
};

export const getTransactionsByCategory = (categoryId: string): Transaction[] => {
  return transactionsData.filter(txn => txn.categoryId === categoryId);
};

export const getTransactionsByAccount = (accountId: string): Transaction[] => {
  return transactionsData.filter(txn => txn.accountId === accountId);
};

export const getTransactionsByUser = (userId: string): Transaction[] => {
  return transactionsData.filter(txn => txn.userId === userId);
};

export const getTransactionsByDateRange = (startDate: string, endDate: string): Transaction[] => {
  return transactionsData.filter(txn => txn.date >= startDate && txn.date <= endDate);
};

export const getTotalIncome = (): number => {
  return transactionsData
    .filter(txn => txn.type === 'income')
    .reduce((total, txn) => total + txn.amount, 0);
};

export const getTotalExpenses = (): number => {
  return transactionsData
    .filter(txn => txn.type === 'expense')
    .reduce((total, txn) => total + Math.abs(txn.amount), 0);
};
