export interface MonthlyTrend {
  id: string;
  userId: string;
  month: string; // Format: YYYY-MM-DD (first day of month)
  income: number;
  expenses: number;
}

export const monthlyTrendsData: MonthlyTrend[] = [
  {
    id: 'trend-001',
    userId: 'user-001',
    month: '2026-01-01',
    income: 12000,
    expenses: 8500,
  },
  {
    id: 'trend-002',
    userId: 'user-001',
    month: '2026-02-01',
    income: 12200,
    expenses: 8200,
  },
  {
    id: 'trend-003',
    userId: 'user-001',
    month: '2026-03-01',
    income: 12500,
    expenses: 9100,
  },
  {
    id: 'trend-004',
    userId: 'user-001',
    month: '2026-04-01',
    income: 12300,
    expenses: 7800,
  },
  {
    id: 'trend-005',
    userId: 'user-001',
    month: '2026-05-01',
    income: 12500,
    expenses: 8750,
  },
  {
    id: 'trend-006',
    userId: 'user-001',
    month: '2026-06-01',
    income: 12800,
    expenses: 8400,
  },
];

export const getMonthlyTrendById = (id: string): MonthlyTrend | undefined => {
  return monthlyTrendsData.find(trend => trend.id === id);
};

export const getMonthlyTrendsByUser = (userId: string): MonthlyTrend[] => {
  return monthlyTrendsData.filter(trend => trend.userId === userId);
};

export const getMonthlyTrendByMonth = (month: string): MonthlyTrend | undefined => {
  return monthlyTrendsData.find(trend => trend.month === month);
};

export const getTotalIncomeByUser = (userId: string): number => {
  return monthlyTrendsData
    .filter(trend => trend.userId === userId)
    .reduce((total, trend) => total + trend.income, 0);
};

export const getTotalExpensesByUser = (userId: string): number => {
  return monthlyTrendsData
    .filter(trend => trend.userId === userId)
    .reduce((total, trend) => total + trend.expenses, 0);
};
