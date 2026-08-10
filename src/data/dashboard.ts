export interface SummaryCard {
  title: string;
  value: number;
  subtitle: string;
  subtitleType: "positive" | "neutral" | "negative";
  icon: string;
  accentColor: "primary" | "emergency" | "investment" | "retirement";
}

export interface AccountCategory {
  key: string;
  label: string;
  amount: number;
  formattedAmount: string;
  color: string;
}

export interface AccountGroup {
  name: string;
  total: number;
  formattedTotal: string;
  pct: number;
  categories: AccountCategory[];
}

export type ChartEntity = AccountGroup;

export interface Movement {
  account: string;
  date: string;
  category: string;
  type: string;
  amount: string | number;
  description: string;
}

export interface FundStatus {
  name: string;
  term: string;
  expected: number;
  current: number;
  institution: string;
  color: "emergency" | "investment" | "contingency" | "retirement";
  difference: number;
  category: "emergency" | "investment" | "contingency" | "retirement";
  goalSource: "manual" | "formula";
  formulaTarget: number;
  formulaDescription: string;
}

export interface EntitySummary {
  name: string;
  contingency: number | null;
  emergency: number | null;
  investment: number | null;
  retirement: number | null;
  total: number;
}

export interface AccountCard {
  initial: string;
  name: string;
  description: string;
  balance: string;
  category: string;
  categoryColor: string;
  categoryId?: string;
  accountId?: string;
  fundDots?: string[];
  isActive?: boolean;
}

export interface RecentTransaction {
  icon: string;
  title: string;
  date: string;
  category: string;
  amount: string;
  amountColor?: string;
  status: string;
}
