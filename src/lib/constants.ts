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
