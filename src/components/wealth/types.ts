import type { StockBroker, StockAssetType } from "../../lib/constants";
import type { StockBrokerAccount, StockPosition } from "../../lib/types";

export type BrokerChipVariant = "contingency" | "investment" | "retirement";

export type AssetChipVariant =
  | "contingency"
  | "investment"
  | "emergency"
  | "retirement";

export interface SummaryMetrics {
  portfolioValue: number;
  investedCapital: number;
  unrealizedGain: number;
  performance: number;
  totalMonthlyContribution: number;
}

export interface AccountMetric extends StockBrokerAccount {
  positionsCount: number;
  investedCapital: number;
  marketValue: number;
  totalValue: number;
  unrealizedGain: number;
}

export interface HoldingWithContext extends StockPosition {
  accountName: string;
  broker: StockBroker;
  currentValue: number;
  costBasis: number;
  gain: number;
  weight: number;
}

export interface BrokerSummaryItem {
  broker: StockBroker;
  accounts: number;
  positions: number;
  investedCapital: number;
  marketValue: number;
  availableCash: number;
  gain: number;
}

export interface SectorSummaryItem {
  sector: string;
  value: number;
}

export interface AssetTypeSummaryItem {
  assetType: StockAssetType;
  label: string;
  value: number;
  percentage: number;
  color: AssetChipVariant;
}

export interface RepeatedTickerSummaryItem {
  symbol: string;
  name: string;
  accountsCount: number;
  brokers: StockBroker[];
  positionsCount: number;
  marketValue: number;
  percentage: number;
}
