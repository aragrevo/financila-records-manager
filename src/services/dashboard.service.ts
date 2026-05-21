import { redis, KEYS } from "../lib/db";
import type {
  Account,
  Transaction,
  TransactionWithAccount,
} from "../lib/types";
import type {
  SummaryCard,
  ChartEntity,
  Movement,
  FundStatus,
  EntitySummary,
  AccountCard,
  RecentTransaction,
} from "../data/dashboard";
import { formatCurrencyCOP, formatDate } from "../utils/format";

export class DashboardService {
  async getSummaryCards(): Promise<SummaryCard[]> {
    const accounts = await this.getAccounts();
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const byCategory: Record<string, number> = {};
    for (const a of accounts) {
      byCategory[a.category] = (byCategory[a.category] || 0) + a.balance;
    }

    const emergencyTarget = 24000000;
    const emergencyCurrent = byCategory["emergency"] || 0;
    const emergencyPct = Math.round((emergencyCurrent / emergencyTarget) * 100);
    console.log(emergencyPct);

    return [
      {
        title: "Total Balance",
        value: totalBalance,
        subtitle: "+2.4% vs last month",
        subtitleType: "positive" as const,
        icon: "account_balance_wallet",
        accentColor: "primary" as const,
      },
      {
        title: "Emergency Fund",
        value: emergencyCurrent,
        subtitle: `Target: ${formatCurrencyCOP(emergencyTarget)} (${emergencyPct}%)`,
        subtitleType: "neutral" as const,
        icon: "emergency",
        accentColor: "emergency" as const,
      },
      {
        title: "Investment Portfolio",
        value: byCategory["investment"] || 0,
        subtitle: "High yield month",
        subtitleType: "positive" as const,
        icon: "show_chart",
        accentColor: "investment" as const,
      },
      {
        title: "Retirement",
        value: byCategory["retirement"] || 0,
        subtitle: "Long-term growth trajectory",
        subtitleType: "neutral" as const,
        icon: "savings",
        accentColor: "retirement" as const,
      },
    ];
  }

  async getChartEntities(): Promise<ChartEntity[]> {
    const accounts = await this.getAccounts();
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const byCategory = new Map<string, Map<string, number>>();
    for (const a of accounts) {
      if (!byCategory.has(a.category)) {
        byCategory.set(a.category, new Map());
      }
      const insts = byCategory.get(a.category)!;
      insts.set(a.name, (insts.get(a.name) || 0) + a.balance);
    }

    const categoryMeta: Record<string, { label: string; color: string }> = {
      retirement: { label: "Retirement", color: "#16a34a" },
      emergency: { label: "Emergency", color: "#dc2626" },
      investment: { label: "Investment", color: "#eab308" },
      contingency: { label: "Contingency", color: "#2563eb" },
    };

    const result: ChartEntity[] = [];
    for (const [key, insts] of byCategory) {
      const total = [...insts.values()].reduce((s, v) => s + v, 0);
      const meta = categoryMeta[key] || { label: key, color: "#9ca3af" };

      const institutions = [...insts.entries()]
        .map(([name, amount]) => ({
          name,
          amount,
          formattedAmount: formatCurrencyCOP(amount),
        }))
        .sort((a, b) => b.amount - a.amount);

      result.push({
        key,
        label: meta.label,
        total,
        formattedTotal: formatCurrencyCOP(total),
        pct: (total / totalBalance) * 100,
        color: meta.color,
        institutions,
      });
    }

    return result.sort((a, b) => b.total - a.total);
  }

  async getRecentMovements(): Promise<Movement[]> {
    const txns = await this.getTransactions();

    return txns.slice(0, 5).map((t) => ({
      account: t.accountName || t.accountId,
      date: formatDate(t.date),
      category: `${t.categoryId.charAt(0).toLocaleUpperCase()}${t.categoryId.slice(1)}`,
      type: t.type,
      amount: formatCurrencyCOP(t.amount),
    }));
  }

  async getFundStatus(): Promise<FundStatus[]> {
    const accounts = await this.getAccounts();
    const txns = await this.getTransactions();

    const byCategory: Record<
      string,
      { current: number; institutions: Set<string> }
    > = {
      emergency: { current: 0, institutions: new Set() },
      investment: { current: 0, institutions: new Set() },
      contingency: { current: 0, institutions: new Set() },
      retirement: { current: 0, institutions: new Set() },
    };

    for (const a of accounts) {
      if (byCategory[a.category]) {
        byCategory[a.category].current += a.balance;
        byCategory[a.category].institutions.add(a.institution);
      }
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let monthlyIncome = 0;
    for (const t of txns) {
      const d = new Date(t.date);
      if (
        t.type === "income" &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      ) {
        monthlyIncome += t.amount;
      }
    }

    const emergencyTarget = 24000000;
    const investmentExpected = Math.round(monthlyIncome * 0.1);
    const contingencyExpected = 568611;
    const retirementExpected = byCategory["retirement"].current;

    return [
      {
        name: "Emergencia",
        term: "6 meses",
        expected: emergencyTarget,
        current: byCategory["emergency"].current,
        institution:
          Array.from(byCategory["emergency"].institutions).join(" - ") || "N/A",
        color: "emergency",
        difference: byCategory["emergency"].current - emergencyTarget,
      },
      {
        name: "Inversión",
        term: "10% Save",
        expected: investmentExpected || 798231,
        current: byCategory["investment"].current,
        institution:
          Array.from(byCategory["investment"].institutions).join(" - ") ||
          "N/A",
        color: "investment",
        difference:
          byCategory["investment"].current - (investmentExpected || 798231),
      },
      {
        name: "Imprevistos",
        term: "Vacaciones",
        expected: contingencyExpected,
        current: byCategory["contingency"].current,
        institution:
          Array.from(byCategory["contingency"].institutions).join(" - ") ||
          "N/A",
        color: "contingency",
        difference: byCategory["contingency"].current - contingencyExpected,
      },
      {
        name: "Retiro",
        term: "Cesantias, Prima",
        expected: retirementExpected,
        current: byCategory["retirement"].current,
        institution:
          Array.from(byCategory["retirement"].institutions).join(" - ") ||
          "N/A",
        color: "retirement",
        difference: 0,
      },
    ];
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
    const accounts = await this.getAccounts();
    const byCategory: Record<string, number> = {};

    for (const a of accounts) {
      byCategory[a.category] = (byCategory[a.category] || 0) + a.balance;
    }

    const totalBalance = Object.values(byCategory).reduce((s, v) => s + v, 0);
    const categoryColors: Record<string, string> = {
      retirement: "bg-retirement",
      emergency: "bg-emergency",
      investment: "bg-investment",
      contingency: "bg-contingency",
    };

    const categoryLabels: Record<string, string> = {
      retirement: "Retirement",
      emergency: "Emergency",
      investment: "Investment",
      contingency: "Contingency",
    };

    return Object.entries(byCategory)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        label: categoryLabels[category] || category,
        color: categoryColors[category] || "bg-gray-400",
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
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
      description: `${a.institution} - ${a.type}`,
      balance: formatCurrencyCOP(a.balance),
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
      date: formatDate(t.date),
      category: t.accountName.toLocaleUpperCase(),
      amount: formatCurrencyCOP(t.amount),
      status: `${t.categoryId.charAt(0).toLocaleUpperCase()}${t.categoryId.slice(1)}`,
    }));
  }

  async getMovements(): Promise<Movement[]> {
    const txns = await this.getTransactions();

    return txns.map((t) => ({
      account: t.accountName || t.accountId,
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
    const pipeline = redis.pipeline();
    for (const id of accountIds) {
      pipeline.hgetall(`${KEYS.ACCOUNT}:${id}`);
    }
    const results = (await pipeline.exec()) as Array<Account | null>;
    return results.filter((acc): acc is Account => acc !== null && "id" in acc);
  }

  private async getTransactions(): Promise<TransactionWithAccount[]> {
    const txnIds = await redis.zrange(
      `${KEYS.TRANSACTIONS_BY_DATE}:user-001`,
      0,
      -1,
      { rev: true },
    );

    const pipeline = redis.pipeline();
    for (const id of txnIds) {
      pipeline.hgetall(`${KEYS.TRANSACTION}:${id}`);
    }
    const txnResults: Array<Transaction | null> = await pipeline.exec();
    const transactions = txnResults.filter(
      (txn): txn is Transaction => txn !== null && "id" in txn,
    );

    const accountIds = [...new Set(transactions.map((t) => t.accountId))];
    const accountPipeline = redis.pipeline();
    for (const id of accountIds) {
      accountPipeline.hgetall(`${KEYS.ACCOUNT}:${id}`);
    }
    const accountResults: Array<Account | null> = await accountPipeline.exec();
    const accounts = accountResults.filter(
      (acc): acc is Account => acc !== null && "id" in acc,
    );

    const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

    return transactions.map((txn) => ({
      ...txn,
      accountName: accountMap.get(txn.accountId) || txn.accountId,
    }));
  }
}

export const dashboardService = new DashboardService();
