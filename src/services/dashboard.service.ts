import { redis } from "../lib/db";
import type { Account, TransactionWithAccount } from "../lib/types";
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
import {
  TRANSACTIONS_DATE_KEY,
  fetchAllAccounts,
  hydrateTransactions,
  withAccountNames,
} from "../lib/queries";
import { fundGoalsService, type FundGoal } from "./fund-goals.service";

const MOVEMENT_TYPES = ["income", "expense", "transfer", "investment"];

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  retirement: { label: "Retirement", color: "#16a34a" },
  emergency: { label: "Emergency", color: "#dc2626" },
  investment: { label: "Investment", color: "#eab308" },
  contingency: { label: "Contingency", color: "#2563eb" },
};

const CATEGORY_BG_CLASSES: Record<string, string> = {
  retirement: "bg-retirement",
  emergency: "bg-emergency",
  investment: "bg-investment",
  contingency: "bg-contingency",
};

const CATEGORY_CARD_STYLES: Record<string, string> = {
  emergency: "background-color: rgba(239, 68, 68, 0.1); color: #991b1b;",
  investment: "background-color: rgba(245, 158, 11, 0.1); color: #92400e;",
  retirement: "background-color: rgba(16, 185, 129, 0.1); color: #065f46;",
  contingency: "background-color: rgba(139, 92, 246, 0.1); color: #5b21b6;",
};

const capitalize = (value: string) =>
  `${value.charAt(0).toLocaleUpperCase()}${value.slice(1)}`;

const sumByCategory = (accounts: Account[]): Record<string, number> => {
  const byCategory: Record<string, number> = {};
  for (const a of accounts) {
    byCategory[a.category] = (byCategory[a.category] || 0) + a.balance;
  }
  return byCategory;
};

const groupByInstitution = (
  accounts: Account[],
): Map<string, Record<string, number>> => {
  const byInstitution = new Map<string, Record<string, number>>();
  for (const a of accounts) {
    if (!byInstitution.has(a.name)) {
      byInstitution.set(a.name, {});
    }
    const cats = byInstitution.get(a.name)!;
    cats[a.category] = (cats[a.category] || 0) + a.balance;
  }
  return byInstitution;
};

export class DashboardService {
  async getDashboardData(): Promise<{
    summaryCards: SummaryCard[];
    chartEntities: ChartEntity[];
    recentMovements: Movement[];
    fundStatus: FundStatus[];
  }> {
    const [accounts, transactions, goalOverrides] = await Promise.all([
      fetchAllAccounts(),
      this.getTransactions(),
      fundGoalsService.getOverrides(),
    ]);

    const goalsByCategory = new Map(
      fundGoalsService
        .computeGoals(accounts, transactions, goalOverrides)
        .map((g) => [g.category, g]),
    );

    return {
      summaryCards: this.buildSummaryCards(
        accounts,
        transactions,
        goalsByCategory,
      ),
      chartEntities: this.buildChartEntities(accounts),
      recentMovements: this.buildMovements(transactions.slice(0, 5)).map(
        (m) => ({
          ...m,
          date: formatDate(m.date),
          category: capitalize(m.category),
          amount: formatCurrencyCOP(m.amount as number),
        }),
      ),
      fundStatus: this.buildFundStatus(accounts, transactions, goalsByCategory),
    };
  }

  async getAccountsPageData(): Promise<{
    entitySummary: EntitySummary[];
    entitySummaryFooter: EntitySummary & { label: string };
    distributionFunds: Array<{ label: string; color: string; amount: number }>;
    accountCards: AccountCard[];
    recentTransactions: RecentTransaction[];
  }> {
    const [accounts, recentTxns] = await Promise.all([
      fetchAllAccounts(),
      this.getRecentTransactions(5),
    ]);

    return {
      entitySummary: this.buildEntitySummary(accounts),
      entitySummaryFooter: this.buildEntitySummaryFooter(accounts),
      distributionFunds: this.buildDistributionFunds(accounts),
      accountCards: this.buildAccountCards(accounts),
      recentTransactions: recentTxns.map((t) => ({
        icon: t.type === "income" ? "payments" : "shopping_cart",
        title: t.description,
        date: formatDate(t.date),
        category: t.accountName.toLocaleUpperCase(),
        amount: formatCurrencyCOP(t.amount),
        status: capitalize(t.categoryId),
      })),
    };
  }

  async getHistoryPageData(): Promise<{
    movements: Movement[];
    accounts: string[];
    types: string[];
  }> {
    const [transactions, accounts] = await Promise.all([
      this.getTransactions(),
      fetchAllAccounts(),
    ]);

    return {
      movements: this.buildMovements(transactions),
      accounts: accounts.map((a) => a.name),
      types: MOVEMENT_TYPES,
    };
  }

  private buildSummaryCards(
    accounts: Account[],
    transactions: TransactionWithAccount[],
    goalsByCategory: Map<string, FundGoal>,
  ): SummaryCard[] {
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const byCategory = sumByCategory(accounts);

    const emergencyCurrent = byCategory["emergency"] || 0;
    const emergencyTarget =
      goalsByCategory.get("emergency")?.target ?? emergencyCurrent;
    const emergencyPct =
      emergencyTarget > 0
        ? Math.round((emergencyCurrent / emergencyTarget) * 100)
        : 100;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyBalanceDelta = 0;

    for (const t of transactions) {
      const d = new Date(t.date);
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) {
        continue;
      }

      // Account balances are updated with the raw transaction amount, so the
      // month-over-month delta must use every movement that changed balances.
      monthlyBalanceDelta += t.amount;
    }

    const previousMonthBalance = totalBalance - monthlyBalanceDelta;

    let changePercent = 0;
    if (previousMonthBalance > 0) {
      changePercent = (monthlyBalanceDelta / previousMonthBalance) * 100;
    }

    const sign = changePercent >= 0 ? "+" : "";
    const subtitle = `${sign}${changePercent.toFixed(1)}% vs last month`;
    const subtitleType = changePercent >= 0 ? "positive" : "negative";

    return [
      {
        title: "Total Balance",
        value: totalBalance,
        subtitle,
        subtitleType: subtitleType,
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

  private buildChartEntities(accounts: Account[]): ChartEntity[] {
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const byInstitution = groupByInstitution(accounts);

    const result: ChartEntity[] = [];
    for (const [name, cats] of byInstitution) {
      const total = Object.values(cats).reduce((s, v) => s + v, 0);

      const categories = Object.entries(cats)
        .map(([key, amount]) => {
          const meta = CATEGORY_META[key] || { label: key, color: "#9ca3af" };
          return {
            key,
            label: meta.label,
            amount,
            formattedAmount: formatCurrencyCOP(amount),
            color: meta.color,
          };
        })
        .sort((a, b) => b.amount - a.amount);

      result.push({
        name,
        total,
        formattedTotal: formatCurrencyCOP(total),
        pct: totalBalance > 0 ? (total / totalBalance) * 100 : 0,
        categories,
      });
    }

    return result.sort((a, b) => b.pct - a.pct);
  }

  private buildMovements(transactions: TransactionWithAccount[]): Movement[] {
    return transactions.map((t) => ({
      account: t.accountName || t.accountId,
      accountId: t.accountId,
      date: t.date,
      category: t.categoryId,
      type: t.type,
      amount: t.amount,
      description: t.description || "N/A",
      merchant: t.merchant,
    }));
  }

  private buildFundStatus(
    accounts: Account[],
    transactions: TransactionWithAccount[],
    goalsByCategory: Map<string, FundGoal>,
  ): FundStatus[] {
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

    const institutions = (category: string) =>
      Array.from(byCategory[category].institutions).join(" - ") || "N/A";

    const goal = (category: string): FundGoal =>
      goalsByCategory.get(category) ?? {
        category: category as FundGoal["category"],
        target: byCategory[category].current,
        source: "formula",
        formulaTarget: byCategory[category].current,
        formulaDescription: "",
      };

    const fund = (
      category: "emergency" | "investment" | "contingency" | "retirement",
      name: string,
      term: string,
    ): FundStatus => {
      const g = goal(category);
      return {
        name,
        term,
        expected: g.target,
        current: byCategory[category].current,
        institution: institutions(category),
        color: category,
        difference: byCategory[category].current - g.target,
        category,
        goalSource: g.source,
        formulaTarget: g.formulaTarget,
        formulaDescription: g.formulaDescription,
      };
    };

    return [
      fund("emergency", "Emergencia", "6 meses"),
      fund("investment", "Inversión", "10% Save"),
      fund("contingency", "Imprevistos", "Vacaciones"),
      fund("retirement", "Retiro", "Cesantias, Prima"),
    ];
  }

  private buildEntitySummary(accounts: Account[]): EntitySummary[] {
    const byInstitution = groupByInstitution(accounts);

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
      result.push({ name, contingency, emergency, investment, retirement, total });
    }

    return result.sort((a, b) => b.total - a.total);
  }

  private buildEntitySummaryFooter(
    accounts: Account[],
  ): EntitySummary & { label: string } {
    const byCategory = sumByCategory(accounts);
    const contingency = byCategory["contingency"] || 0;
    const emergency = byCategory["emergency"] || 0;
    const investment = byCategory["investment"] || 0;
    const retirement = byCategory["retirement"] || 0;

    return {
      name: "SUMA TOTAL",
      label: "SUMA TOTAL",
      contingency,
      emergency,
      investment,
      retirement,
      total: contingency + emergency + investment + retirement,
    };
  }

  private buildDistributionFunds(accounts: Account[]) {
    const byCategory = sumByCategory(accounts);

    return Object.entries(byCategory)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        label: CATEGORY_META[category]?.label || category,
        color: CATEGORY_BG_CLASSES[category] || "bg-gray-400",
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private buildAccountCards(accounts: Account[]): AccountCard[] {
    return accounts.map((a) => ({
      initial: a.name.charAt(0),
      name: a.name,
      description: `${a.institution} - ${a.type}`,
      balance: formatCurrencyCOP(a.balance),
      category: a.category.toUpperCase(),
      categoryColor:
        CATEGORY_CARD_STYLES[a.category] ||
        "background-color: rgba(218, 226, 253, 1); color: #3f465c;",
      accountId: a.id,
      isActive: a.status === "active",
    }));
  }

  private async getTransactions(): Promise<TransactionWithAccount[]> {
    const txnIds = await redis.zrange<string[]>(TRANSACTIONS_DATE_KEY, 0, -1, {
      rev: true,
    });
    const transactions = await hydrateTransactions(txnIds);
    return withAccountNames(transactions);
  }

  private async getRecentTransactions(
    limit: number,
  ): Promise<TransactionWithAccount[]> {
    const txnIds = await redis.zrange<string[]>(TRANSACTIONS_DATE_KEY, 0, limit - 1, {
      rev: true,
    });
    const transactions = await hydrateTransactions(txnIds);
    return withAccountNames(transactions);
  }
}

export const dashboardService = new DashboardService();
