export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account: string;
  status: 'completed' | 'pending' | 'cancelled';
  merchant?: string;
  tags?: string[];
}

export const transactionsData: Transaction[] = [
  {
    id: 'txn-001',
    date: '2026-05-20',
    description: 'Salary Deposit',
    amount: 12500.00,
    type: 'income',
    category: 'Salary',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Employer Inc.',
    tags: ['recurring', 'salary'],
  },
  {
    id: 'txn-002',
    date: '2026-05-19',
    description: 'Grocery Shopping',
    amount: -156.42,
    type: 'expense',
    category: 'Food & Groceries',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Whole Foods Market',
    tags: ['essentials'],
  },
  {
    id: 'txn-003',
    date: '2026-05-18',
    description: 'Investment Dividend',
    amount: 342.18,
    type: 'income',
    category: 'Investment Returns',
    account: 'Investment Portfolio',
    status: 'completed',
    tags: ['passive-income'],
  },
  {
    id: 'txn-004',
    date: '2026-05-17',
    description: 'Electric Bill',
    amount: -89.50,
    type: 'expense',
    category: 'Utilities',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'City Power Co.',
    tags: ['recurring', 'bills'],
  },
  {
    id: 'txn-005',
    date: '2026-05-16',
    description: 'Restaurant Dinner',
    amount: -78.90,
    type: 'expense',
    category: 'Dining Out',
    account: 'Business Credit Card',
    status: 'completed',
    merchant: 'The Italian Place',
    tags: ['dining'],
  },
  {
    id: 'txn-006',
    date: '2026-05-15',
    description: 'Freelance Payment',
    amount: 2500.00,
    type: 'income',
    category: 'Freelance',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Client Corp',
    tags: ['freelance', 'income'],
  },
  {
    id: 'txn-007',
    date: '2026-05-14',
    description: 'Gas Station',
    amount: -45.20,
    type: 'expense',
    category: 'Transportation',
    account: 'Business Credit Card',
    status: 'completed',
    merchant: 'Shell',
    tags: ['transportation'],
  },
  {
    id: 'txn-008',
    date: '2026-05-13',
    description: 'Online Subscription',
    amount: -14.99,
    type: 'expense',
    category: 'Entertainment',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Netflix',
    tags: ['recurring', 'entertainment'],
  },
  {
    id: 'txn-009',
    date: '2026-05-12',
    description: 'Transfer to Savings',
    amount: -1000.00,
    type: 'transfer',
    category: 'Savings Transfer',
    account: 'Main Checking',
    status: 'completed',
    tags: ['savings', 'transfer'],
  },
  {
    id: 'txn-010',
    date: '2026-05-11',
    description: 'Medical Checkup',
    amount: -250.00,
    type: 'expense',
    category: 'Healthcare',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Health Clinic',
    tags: ['healthcare'],
  },
  {
    id: 'txn-011',
    date: '2026-05-10',
    description: 'Stock Purchase',
    amount: -2000.00,
    type: 'investment',
    category: 'Stock Investment',
    account: 'Investment Portfolio',
    status: 'completed',
    merchant: 'AAPL',
    tags: ['investment', 'stocks'],
  },
  {
    id: 'txn-012',
    date: '2026-05-09',
    description: 'Rent Payment',
    amount: -1800.00,
    type: 'expense',
    category: 'Housing',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Property Management',
    tags: ['recurring', 'housing'],
  },
];

export const getTransactionsByType = (type: Transaction['type']): Transaction[] => {
  return transactionsData.filter(txn => txn.type === type);
};

export const getTransactionsByCategory = (category: string): Transaction[] => {
  return transactionsData.filter(txn => txn.category === category);
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
