import { redis, KEYS } from '../lib/db';
import type { Account, Transaction } from '../lib/types';
import type { SummaryData, CategoryData, MonthlyTrend } from '../data/summary';

export class SummaryService {
  async getSummary(): Promise<SummaryData> {
    const accounts = await this.getAccounts();
    const transactions = await this.getTransactions();
    
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return {
      totalBalance,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate,
      categories: this.getCategoriesByAccount(accounts),
      monthlyTrend: this.calculateMonthlyTrend(transactions),
    };
  }

  async getCategories() {
    const accounts = await this.getAccounts();
    return this.getCategoriesByAccount(accounts);
  }

  async getMonthlyTrend() {
    const transactions = await this.getTransactions();
    return this.calculateMonthlyTrend(transactions);
  }

  private getCategoriesByAccount(accounts: Account[]): CategoryData[] {
    const total = accounts.reduce((sum, a) => sum + a.balance, 0);
    if (total === 0) return [];
    
    const categories = new Map<string, number>();
    accounts.forEach(a => {
      categories.set(a.category, (categories.get(a.category) || 0) + a.balance);
    });

    return Array.from(categories.entries()).map(([name, amount]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount,
      percentage: (amount / total) * 100,
      color: name as CategoryData['color'],
      icon: 'account_balance',
    }));
  }

  private calculateMonthlyTrend(transactions: Transaction[]): MonthlyTrend[] {
    const months = new Map<string, { income: number; expenses: number }>();
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      const existing = months.get(month) || { income: 0, expenses: 0 };
      if (t.type === 'income') existing.income += t.amount;
      else if (t.type === 'expense') existing.expenses += Math.abs(t.amount);
      months.set(month, existing);
    });

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: month.substring(5),
        income: data.income,
        expenses: data.expenses,
      }));
  }

  private async getAccounts(): Promise<Account[]> {
    const accountIds = await redis.smembers(KEYS.ACCOUNTS_INDEX);
    const accounts: Account[] = [];
    for (const id of accountIds) {
      const account = await redis.hgetall<Account>(`${KEYS.ACCOUNT}:${id}`);
      if (account && account.id) accounts.push(account);
    }
    return accounts;
  }

  private async getTransactions(): Promise<Transaction[]> {
    const txnIds = await redis.zrange(`${KEYS.TRANSACTIONS_BY_DATE}:user-001`, 0, -1, { rev: true });
    const transactions: Transaction[] = [];
    for (const id of txnIds) {
      const txn = await redis.hgetall<Transaction>(`${KEYS.TRANSACTION}:${id}`);
      if (txn && txn.id) transactions.push(txn);
    }
    return transactions;
  }
}

export const summaryService = new SummaryService();
