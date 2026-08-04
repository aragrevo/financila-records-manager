import { redis } from "../lib/db";
import type { Account, Transaction } from "../lib/types";
import type { SummaryData, CategoryData, MonthlyTrend } from "../data/summary";
import {
  TRANSACTIONS_DATE_KEY,
  fetchAllAccounts,
  hydrateTransactions,
} from "../lib/queries";

export class SummaryService {
  async getSummary(): Promise<SummaryData> {
    const [accounts, transactions] = await Promise.all([
      fetchAllAccounts(),
      this.getTransactions(),
    ]);

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
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

  private getCategoriesByAccount(accounts: Account[]): CategoryData[] {
    const total = accounts.reduce((sum, a) => sum + a.balance, 0);
    if (total === 0) return [];

    const categories = new Map<string, number>();
    accounts.forEach((a) => {
      categories.set(a.category, (categories.get(a.category) || 0) + a.balance);
    });

    return Array.from(categories.entries()).map(([name, amount]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount,
      percentage: (amount / total) * 100,
      color: name as CategoryData["color"],
      icon: "account_balance",
    }));
  }

  private calculateMonthlyTrend(transactions: Transaction[]): MonthlyTrend[] {
    const months = new Map<string, { income: number; expenses: number }>();
    transactions.forEach((t) => {
      const month = t.date.substring(0, 7);
      const existing = months.get(month) || { income: 0, expenses: 0 };
      if (t.type === "income") existing.income += t.amount;
      else if (t.type === "expense") existing.expenses += Math.abs(t.amount);
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

  private async getTransactions(): Promise<Transaction[]> {
    const txnIds = await redis.zrange<string[]>(TRANSACTIONS_DATE_KEY, 0, -1, {
      rev: true,
    });
    return hydrateTransactions(txnIds);
  }
}

export const summaryService = new SummaryService();
