export interface SummaryData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  categories: CategoryData[];
  monthlyTrend: MonthlyTrend[];
}

export interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: 'emergency' | 'investment' | 'retirement' | 'contingency';
  icon: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export const summaryData: SummaryData = {
  totalBalance: 284750.00,
  monthlyIncome: 12500.00,
  monthlyExpenses: 8750.00,
  savingsRate: 30,
  categories: [
    {
      name: 'Emergency Fund',
      amount: 45000.00,
      percentage: 15.8,
      color: 'emergency',
      icon: 'shield',
    },
    {
      name: 'Investments',
      amount: 156250.00,
      percentage: 54.9,
      color: 'investment',
      icon: 'trending-up',
    },
    {
      name: 'Retirement',
      amount: 62500.00,
      percentage: 22.0,
      color: 'retirement',
      icon: 'calendar',
    },
    {
      name: 'Contingency',
      amount: 21000.00,
      percentage: 7.4,
      color: 'contingency',
      icon: 'umbrella',
    },
  ],
  monthlyTrend: [
    { month: 'Jan', income: 12000, expenses: 8500 },
    { month: 'Feb', income: 12200, expenses: 8200 },
    { month: 'Mar', income: 12500, expenses: 9100 },
    { month: 'Apr', income: 12300, expenses: 7800 },
    { month: 'May', income: 12500, expenses: 8750 },
    { month: 'Jun', income: 12800, expenses: 8400 },
  ],
};

/**
 * @deprecated Import from '../utils/format' instead
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * @deprecated Import from '../utils/format' instead
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
