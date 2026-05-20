export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer' | 'investment';
  color: string | null;
  icon: string | null;
}

export const categoriesData: Category[] = [
  // Income categories
  {
    id: 'cat-001',
    name: 'Salary',
    type: 'income',
    color: '#10b981',
    icon: 'payments',
  },
  {
    id: 'cat-002',
    name: 'Freelance',
    type: 'income',
    color: '#3b82f6',
    icon: 'work',
  },
  {
    id: 'cat-003',
    name: 'Investment Returns',
    type: 'income',
    color: '#8b5cf6',
    icon: 'trending_up',
  },

  // Expense categories
  {
    id: 'cat-004',
    name: 'Food & Groceries',
    type: 'expense',
    color: '#f59e0b',
    icon: 'shopping_cart',
  },
  {
    id: 'cat-005',
    name: 'Utilities',
    type: 'expense',
    color: '#6366f1',
    icon: 'bolt',
  },
  {
    id: 'cat-006',
    name: 'Dining Out',
    type: 'expense',
    color: '#ec4899',
    icon: 'restaurant',
  },
  {
    id: 'cat-007',
    name: 'Transportation',
    type: 'expense',
    color: '#14b8a6',
    icon: 'directions_car',
  },
  {
    id: 'cat-008',
    name: 'Entertainment',
    type: 'expense',
    color: '#f97316',
    icon: 'movie',
  },
  {
    id: 'cat-009',
    name: 'Healthcare',
    type: 'expense',
    color: '#ef4444',
    icon: 'local_hospital',
  },
  {
    id: 'cat-010',
    name: 'Housing',
    type: 'expense',
    color: '#84cc16',
    icon: 'home',
  },

  // Transfer categories
  {
    id: 'cat-011',
    name: 'Savings Transfer',
    type: 'transfer',
    color: '#06b6d4',
    icon: 'swap_horiz',
  },

  // Investment categories
  {
    id: 'cat-012',
    name: 'Stock Investment',
    type: 'investment',
    color: '#a855f7',
    icon: 'show_chart',
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categoriesData.find(category => category.id === id);
};

export const getCategoriesByType = (type: Category['type']): Category[] => {
  return categoriesData.filter(category => category.type === type);
};
