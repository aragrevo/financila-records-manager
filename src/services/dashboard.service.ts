import { redis, KEYS } from '../lib/db';
import type { Account, Transaction } from '../lib/types';
import type { SummaryCard, ChartEntity, Movement, FundStatus, EntitySummary, AccountCard, RecentTransaction } from '../data/dashboard';

export class DashboardService {
  async getSummaryCards(): Promise<SummaryCard[]> {
    const accounts = await this.getAccounts();
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    return [
      {
        title: 'Total Balance',
        value: totalBalance,
        subtitle: '',
        subtitleType: 'neutral',
        icon: 'account_balance_wallet',
        accentColor: 'primary',
      },
    ];
  }

  async getChartEntities(): Promise<ChartEntity[]> {
    return [];
  }

  async getRecentMovements(): Promise<Movement[]> {
    return [];
  }

  async getFundStatus(): Promise<FundStatus[]> {
    return [];
  }

  async getEntitySummary(): Promise<EntitySummary[]> {
    return [];
  }

  async getEntitySummaryFooter() {
    return {
      label: 'SUMA TOTAL',
      contingency: 0,
      emergency: 0,
      investment: 0,
      retirement: 0,
      total: 0,
    };
  }

  async getDistributionFunds() {
    return [];
  }

  async getAccountCards(): Promise<AccountCard[]> {
    const accounts = await this.getAccounts();
    return accounts.map(a => ({
      initial: a.name.charAt(0),
      name: a.name,
      description: `${a.type} - ${a.institution}`,
      balance: a.balance,
      category: a.category.toUpperCase(),
      categoryColor: 'background-color: rgba(218, 226, 253, 1); color: #3f465c;',
      isActive: a.status === 'active',
    }));
  }

  async getRecentTransactions(): Promise<RecentTransaction[]> {
    const txns = await this.getTransactions();
    return txns.slice(0, 5).map(t => ({
      icon: t.type === 'income' ? 'payments' : 'shopping_cart',
      title: t.description,
      date: t.date,
      category: t.type.toUpperCase(),
      amount: t.amount,
      status: t.status === 'completed' ? 'Completado' : 'Pendiente',
    }));
  }

  async getMovements(): Promise<Movement[]> {
    const txns = await this.getTransactions();
    return txns.map(t => ({
      account: t.accountId,
      date: t.date,
      category: t.type,
      amount: t.amount,
    }));
  }

  async getMovementAccounts(): Promise<string[]> {
    const accounts = await this.getAccounts();
    return accounts.map(a => a.name);
  }

  async getMovementTypes(): Promise<string[]> {
    return ['income', 'expense', 'transfer', 'investment'];
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

export const dashboardService = new DashboardService();
