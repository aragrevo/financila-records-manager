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
