export const ACCOUNT_TYPES = {
  checking: 'Corriente',
  savings: 'Ahorros',
  investment: 'Inversión',
  credit: 'Crédito',
} as const;

export type AccountType = keyof typeof ACCOUNT_TYPES;

export const ACCOUNT_CATEGORIES = {
  emergency: 'Emergencia',
  investment: 'Inversión',
  retirement: 'Retiro',
  contingency: 'Contingencia',
} as const;

export type AccountCategory = keyof typeof ACCOUNT_CATEGORIES;

export const TRANSACTION_TYPES = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
  investment: 'Inversión',
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPES;

export const STOCK_BROKERS = {
  xtb: 'XTB',
  hapi: 'Hapi',
  tyba: 'Tyba',
} as const;

export type StockBroker = keyof typeof STOCK_BROKERS;

export const STOCK_ACCOUNT_STATUSES = {
  active: 'Activa',
  paused: 'Pausada',
} as const;

export type StockAccountStatus = keyof typeof STOCK_ACCOUNT_STATUSES;

export const STOCK_ASSET_TYPES = {
  stock: 'Acción',
  etf: 'ETF',
  reit: 'REIT',
  adr: 'ADR',
} as const;

export type StockAssetType = keyof typeof STOCK_ASSET_TYPES;

export const STOCK_POSITION_STATUSES = {
  active: 'Activa',
  closed: 'Cerrada',
} as const;

export type StockPositionStatus = keyof typeof STOCK_POSITION_STATUSES;
