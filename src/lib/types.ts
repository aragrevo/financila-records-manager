import type {
  AccountType,
  AccountCategory,
  TransactionType,
  StockBroker,
  StockAccountStatus,
  StockAssetType,
  StockPositionStatus,
} from "./constants";

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institution: string;
  lastUpdated: string;
  status: "active" | "inactive" | "pending";
  category: AccountCategory;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  status: "completed" | "pending" | "cancelled";
  merchant?: string;
  createdAt: string;
}

export interface TransactionWithAccount extends Transaction {
  accountName: string;
}

export interface BillingRecord {
  id: string;
  userId: string;
  project: string;
  monthLabel: string;
  monthKey: string;
  totalHours: number;
  paidHours: number;
  remainingHours: number;
  hourlyRate: number;
  amount: number;
  balance: number;
  createdAt: string;
}

export interface BillingBalanceSnapshot {
  id: string;
  userId: string;
  project: string;
  monthLabel: string;
  monthKey: string;
  balance: number;
  createdAt: string;
}

export interface BillingSummaryMetrics {
  outstandingBalance: number;
  pendingHours: number;
  averageMonthlyHours: number;
  averageHourlyRate: number;
}

export interface BillingBalanceSummaryRow {
  project: string;
  monthValues: Record<string, number>;
  total: number;
}

export interface MonthlyBillingTrendPoint {
  monthLabel: string;
  monthKey: string;
  totalHours: number;
  totalAmount: number;
  totalBalance: number;
}

export interface StockBrokerAccount {
  id: string;
  userId: string;
  broker: StockBroker;
  name: string;
  owner: string;
  currency: string;
  strategy?: string;
  availableCash: number;
  monthlyContribution: number;
  status: StockAccountStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockPosition {
  id: string;
  userId: string;
  accountId: string;
  symbol: string;
  name: string;
  assetType: StockAssetType;
  status: StockPositionStatus;
  shares: number;
  averageCost: number;
  currentPrice: number;
  sector?: string;
  region?: string;
  notes?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}
