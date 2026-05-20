export interface TransactionTag {
  transactionId: string;
  tagId: string;
}

export const transactionTagsData: TransactionTag[] = [
  // txn-001: Salary Deposit - tags: ['recurring', 'salary']
  { transactionId: 'txn-001', tagId: 'tag-001' }, // recurring
  { transactionId: 'txn-001', tagId: 'tag-002' }, // salary

  // txn-002: Grocery Shopping - tags: ['essentials']
  { transactionId: 'txn-002', tagId: 'tag-003' }, // essentials

  // txn-003: Investment Dividend - tags: ['passive-income']
  { transactionId: 'txn-003', tagId: 'tag-004' }, // passive-income

  // txn-004: Electric Bill - tags: ['recurring', 'bills']
  { transactionId: 'txn-004', tagId: 'tag-001' }, // recurring
  { transactionId: 'txn-004', tagId: 'tag-005' }, // bills

  // txn-005: Restaurant Dinner - tags: ['dining']
  { transactionId: 'txn-005', tagId: 'tag-006' }, // dining

  // txn-006: Freelance Payment - tags: ['freelance', 'income']
  { transactionId: 'txn-006', tagId: 'tag-007' }, // freelance
  { transactionId: 'txn-006', tagId: 'tag-008' }, // income

  // txn-007: Gas Station - tags: ['transportation']
  { transactionId: 'txn-007', tagId: 'tag-009' }, // transportation

  // txn-008: Online Subscription - tags: ['recurring', 'entertainment']
  { transactionId: 'txn-008', tagId: 'tag-001' }, // recurring
  { transactionId: 'txn-008', tagId: 'tag-010' }, // entertainment

  // txn-009: Transfer to Savings - tags: ['savings', 'transfer']
  { transactionId: 'txn-009', tagId: 'tag-011' }, // savings
  { transactionId: 'txn-009', tagId: 'tag-012' }, // transfer

  // txn-010: Medical Checkup - tags: ['healthcare']
  { transactionId: 'txn-010', tagId: 'tag-013' }, // healthcare

  // txn-011: Stock Purchase - tags: ['investment', 'stocks']
  { transactionId: 'txn-011', tagId: 'tag-014' }, // investment
  { transactionId: 'txn-011', tagId: 'tag-015' }, // stocks

  // txn-012: Rent Payment - tags: ['recurring', 'housing']
  { transactionId: 'txn-012', tagId: 'tag-001' }, // recurring
  { transactionId: 'txn-012', tagId: 'tag-016' }, // housing
];

export const getTransactionTags = (transactionId: string): TransactionTag[] => {
  return transactionTagsData.filter(tt => tt.transactionId === transactionId);
};

export const getTagTransactions = (tagId: string): TransactionTag[] => {
  return transactionTagsData.filter(tt => tt.tagId === tagId);
};
