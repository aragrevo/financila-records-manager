import { redis, KEYS } from "../lib/db";
import type { Account, Transaction } from "../lib/types";
import type {
  SummaryCard,
  ChartEntity,
  Movement,
  FundStatus,
  EntitySummary,
  AccountCard,
  RecentTransaction,
} from "../data/dashboard";

export class DashboardService {
  async getSummaryCards(): Promise<SummaryCard[]> {
    const accounts = await this.getAccounts();
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    return [
      {
        title: "Total Balance",
        value: totalBalance,
        subtitle: "",
        subtitleType: "neutral",
        icon: "account_balance_wallet",
        accentColor: "primary",
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
    const accounts = await this.getAccounts();
    const byInstitution = new Map<string, Record<string, number>>();

    for (const a of accounts) {
      if (!byInstitution.has(a.name)) {
        byInstitution.set(a.name, {});
      }
      const cats = byInstitution.get(a.name)!;
      cats[a.category] = (cats[a.category] || 0) + a.balance;
    }

    const result: EntitySummary[] = [];
    for (const [name, cats] of byInstitution) {
      const contingency = cats["contingency"] || null;
      const emergency = cats["emergency"] || null;
      const investment = cats["investment"] || null;
      const retirement = cats["retirement"] || null;
      const total =
        (contingency || 0) +
        (emergency || 0) +
        (investment || 0) +
        (retirement || 0);
      result.push({
        name,
        contingency,
        emergency,
        investment,
        retirement,
        total,
      });
    }

    return result.sort((a, b) => b.total - a.total);
  }

  async getEntitySummaryFooter() {
    const accounts = await this.getAccounts();
    let contingency = 0,
      emergency = 0,
      investment = 0,
      retirement = 0;

    for (const a of accounts) {
      if (a.category === "contingency") contingency += a.balance;
      else if (a.category === "emergency") emergency += a.balance;
      else if (a.category === "investment") investment += a.balance;
      else if (a.category === "retirement") retirement += a.balance;
    }

    return {
      label: "SUMA TOTAL",
      contingency,
      emergency,
      investment,
      retirement,
      total: contingency + emergency + investment + retirement,
    };
  }

  async getDistributionFunds() {
    return [];
  }

  async getAccountCards(): Promise<AccountCard[]> {
    const accounts = await this.getAccounts();
    const categoryColors: Record<string, string> = {
      emergency: "background-color: rgba(239, 68, 68, 0.1); color: #991b1b;",
      investment: "background-color: rgba(245, 158, 11, 0.1); color: #92400e;",
      retirement: "background-color: rgba(16, 185, 129, 0.1); color: #065f46;",
      contingency: "background-color: rgba(139, 92, 246, 0.1); color: #5b21b6;",
    };

    return accounts.map((a) => ({
      initial: a.name.charAt(0),
      name: a.name,
      description: `${a.type} - ${a.institution}`,
      balance: a.balance,
      category: a.category.toUpperCase(),
      categoryColor:
        categoryColors[a.category] ||
        "background-color: rgba(218, 226, 253, 1); color: #3f465c;",
      accountId: a.id,
      isActive: a.status === "active",
    }));
  }

  async getRecentTransactions(): Promise<RecentTransaction[]> {
    const txns = await this.getTransactions();
    return txns.slice(0, 5).map((t) => ({
      icon: t.type === "income" ? "payments" : "shopping_cart",
      title: t.description,
      date: t.date,
      category: t.type.toUpperCase(),
      amount: t.amount,
      status: t.status === "completed" ? "Completado" : "Pendiente",
    }));
  }

  async getMovements(): Promise<Movement[]> {
    const txns = await this.getTransactions();
    const accounts = await this.getAccounts();
    const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

    return txns.map((t) => ({
      account: accountMap.get(t.accountId) || t.accountId,
      date: t.date,
      category: t.categoryId,
      type: t.type,
      amount: t.amount,
    }));
  }

  async getMovementAccounts(): Promise<string[]> {
    const accounts = await this.getAccounts();
    return accounts.map((a) => a.name);
  }

  async getMovementAccountsData(): Promise<{ id: string; name: string }[]> {
    const accounts = await this.getAccounts();
    return accounts.map((a) => ({ id: a.id, name: a.name }));
  }

  async getMovementTypes(): Promise<string[]> {
    return ["income", "expense", "transfer", "investment"];
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
    const txnIds = await redis.zrange(
      `${KEYS.TRANSACTIONS_BY_DATE}:user-001`,
      0,
      -1,
      { rev: true },
    );
    const transactions: Transaction[] = [];
    for (const id of txnIds) {
      const txn = await redis.hgetall<Transaction>(`${KEYS.TRANSACTION}:${id}`);
      if (txn && txn.id) transactions.push(txn);
    }
    return transactions;
  }
}

export const dashboardService = new DashboardService();
