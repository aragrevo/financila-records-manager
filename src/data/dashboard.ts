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
}

export interface FundStatus {
  name: string;
  term: string;
  expected: number;
  current: number;
  institution: string;
  color: "emergency" | "investment" | "contingency" | "retirement";
  difference: number;
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

export const dashboardData = {
  summaryCards: [
    {
      title: "Total Balance",
      value: 74875506,
      subtitle: "+2.4% vs last month",
      subtitleType: "positive" as const,
      icon: "account_balance_wallet",
      accentColor: "primary" as const,
    },
    {
      title: "Emergency Fund",
      value: 19836745,
      subtitle: "Target: 24000000 (82%)",
      subtitleType: "neutral" as const,
      icon: "emergency",
      accentColor: "emergency" as const,
    },
    {
      title: "Investment Portfolio",
      value: 12047315,
      subtitle: "High yield month",
      subtitleType: "positive" as const,
      icon: "show_chart",
      accentColor: "investment" as const,
    },
    {
      title: "Retirement",
      value: 42006005,
      subtitle: "Long-term growth trajectory",
      subtitleType: "neutral" as const,
      icon: "savings",
      accentColor: "retirement" as const,
    },
  ] as SummaryCard[],

  recentMovements: [
    {
      account: "XTB",
      date: "16/05/2026",
      category: "Investment",
      amount: 382100,
    },
    {
      account: "Tyba",
      date: "08/05/2026",
      category: "Retirement",
      amount: 200000,
    },
    {
      account: "NU",
      date: "08/05/2026",
      category: "Contingency",
      amount: 568611,
    },
    {
      account: "NU",
      date: "08/05/2026",
      category: "Emergency",
      amount: 1135858,
    },
    {
      account: "NU",
      date: "08/05/2026",
      category: "Retirement",
      amount: 1135858,
    },
  ] as Movement[],

  fundStatus: [
    {
      name: "Emergencia",
      term: "6 meses",
      expected: 23946942,
      current: 19836745,
      institution: "Uala - Global66 - NU",
      color: "emergency" as const,
      difference: -4110197,
    },
    {
      name: "Inversión",
      term: "10% Save",
      expected: 798231,
      current: 382100,
      institution: "Tyba - Investwe - xtb-plenti",
      color: "investment" as const,
      difference: -416131,
    },
    {
      name: "Imprevistos",
      term: "Vacaciones",
      expected: 568611,
      current: 568611,
      institution: "Rappi - NU",
      color: "contingency" as const,
      difference: 0,
    },
    {
      name: "Retiro",
      term: "Cesantias, Prima",
      expected: 2471715,
      current: 2471715,
      institution: "NU Cajitas",
      color: "retirement" as const,
      difference: 0,
    },
  ] as FundStatus[],

  entitySummary: [
    {
      name: "Global66",
      contingency: null,
      emergency: 12373439,
      investment: null,
      retirement: null,
      total: 12373439,
    },
    {
      name: "MejorCDT",
      contingency: null,
      emergency: null,
      investment: null,
      retirement: 15400000,
      total: 15400000,
    },
    {
      name: "NU",
      contingency: 723441,
      emergency: 6682672,
      investment: null,
      retirement: 3069046,
      total: 10475159,
    },
    {
      name: "Tyba",
      contingency: null,
      emergency: null,
      investment: 1207282,
      retirement: 23011959,
      total: 24219241,
    },
    {
      name: "XTB",
      contingency: null,
      emergency: null,
      investment: 3582865,
      retirement: null,
      total: 3582865,
    },
  ] as EntitySummary[],

  entitySummaryFooter: {
    label: "SUMA TOTAL",
    contingency: 985441,
    emergency: 19836745,
    investment: 12047315,
    retirement: 42006005,
    total: 74875506,
  },

  distributionFunds: [
    { label: "Retirement", color: "bg-retirement", amount: 42006005 },
    { label: "Emergency", color: "bg-emergency", amount: 19836745 },
    { label: "Investment", color: "bg-investment", amount: 12047315 },
  ],

  accountCards: [
    {
      initial: "G",
      name: "Global66",
      description: "Digital Wallet - High Liquidity",
      balance: 12373439,
      category: "EMERGENCY",
      categoryColor:
        "background-color: rgba(239, 68, 68, 0.1); color: #991b1b;",
      categoryId: "4829",
      isActive: true,
    },
    {
      initial: "M",
      name: "MejorCDT",
      description: "Fixed Income Certificate",
      balance: 15400000,
      category: "RETIREMENT",
      categoryColor:
        "background-color: rgba(16, 185, 129, 0.1); color: #065f46;",
      categoryId: "1042",
    },
    {
      initial: "N",
      name: "Nubank (NU)",
      description: "Savings & Cajitas System",
      balance: 10475159,
      category: "MULTI-FUND",
      categoryColor:
        "background-color: rgba(218, 226, 253, 1); color: #3f465c;",
      fundDots: ["bg-contingency", "bg-emergency", "bg-retirement"],
    },
    {
      initial: "T",
      name: "Tyba",
      description: "FIC & Retirement Funds",
      balance: 24219241,
      category: "INVESTMENT",
      categoryColor:
        "background-color: rgba(245, 158, 11, 0.1); color: #92400e;",
      categoryId: "8821",
    },
    {
      initial: "X",
      name: "XTB Broker",
      description: "Stock Market & ETFs",
      balance: 3582865,
      category: "INVESTMENT",
      categoryColor:
        "background-color: rgba(245, 158, 11, 0.1); color: #92400e;",
      categoryId: "5540",
    },
  ] as AccountCard[],

  recentTransactions: [
    {
      icon: "payments",
      title: "Transferencia Recibida - XTB",
      date: "16 MAY 2026",
      category: "INVERSIÓN",
      amount: 382100,
      amountColor: "text-retirement",
      status: "Completado",
    },
    {
      icon: "savings",
      title: "Ahorro Programado - NU",
      date: "08 MAY 2026",
      category: "CONTINGENCY",
      amount: 568611,
      status: "Completado",
    },
  ] as RecentTransaction[],

  movements: [
    { date: "16/05/2026", account: "XTB", type: "Investment", amount: 382100 },
    { date: "08/05/2026", account: "Tyba", type: "Retirement", amount: 200000 },
    { date: "08/05/2026", account: "NU", type: "Contingency", amount: 568611 },
    { date: "08/05/2026", account: "NU", type: "Emergency", amount: 1135858 },
    {
      date: "02/04/2026",
      account: "Otro",
      type: "Retirement",
      amount: -1000000,
    },
    {
      date: "11/03/2026",
      account: "MejorCDT",
      type: "Retirement",
      amount: 5000000,
    },
    { date: "11/03/2026", account: "NU", type: "Retirement", amount: -5000000 },
    {
      date: "23/12/2025",
      account: "NU",
      type: "Contingency",
      amount: -4256765,
    },
    {
      date: "05/12/2025",
      account: "Global66",
      type: "Emergency",
      amount: 315000,
    },
    { date: "10/04/2026", account: "Tyba", type: "Retirement", amount: 200000 },
    { date: "10/04/2026", account: "NU", type: "Contingency", amount: 574096 },
    { date: "10/04/2026", account: "NU", type: "Emergency", amount: 1146814 },
  ] as Movement[],

  movementAccounts: ["XTB", "Tyba", "NU", "MejorCDT", "Global66"],
  movementTypes: ["Investment", "Retirement", "Contingency", "Emergency"],
};
