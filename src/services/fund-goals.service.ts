import { redis } from "../lib/db";
import type { Account, TransactionWithAccount } from "../lib/types";

const FUND_GOALS_KEY = "fund-goals";

export type FundCategory = "emergency" | "investment" | "contingency" | "retirement";

export const FUND_CATEGORIES: FundCategory[] = [
  "emergency",
  "investment",
  "contingency",
  "retirement",
];

export type FundGoalOverrides = Partial<Record<FundCategory, number>>;

export interface FundGoal {
  category: FundCategory;
  target: number;
  source: "manual" | "formula";
  formulaTarget: number;
  formulaDescription: string;
}

const EMERGENCY_MONTHS = 6;
const CONTINGENCY_MONTHS = 1;
const INVESTMENT_ALLOCATION_PCT = 0.3;
const RETIREMENT_ALLOCATION_PCT = 0.4;
const FALLBACK_EMERGENCY_TARGET = 24000000;
const EXPENSES_WINDOW_DAYS = 90;

const round = (value: number) => Math.round(value);

export class FundGoalsService {
  async getOverrides(): Promise<FundGoalOverrides> {
    return (await redis.get<FundGoalOverrides>(FUND_GOALS_KEY)) ?? {};
  }

  async setOverride(
    category: FundCategory,
    target: number | null,
  ): Promise<FundGoalOverrides> {
    const overrides = await this.getOverrides();
    if (target === null) {
      delete overrides[category];
    } else {
      overrides[category] = target;
    }
    await redis.set(FUND_GOALS_KEY, overrides);
    return overrides;
  }

  computeGoals(
    accounts: Account[],
    transactions: TransactionWithAccount[],
    overrides: FundGoalOverrides,
  ): FundGoal[] {
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const monthlyExpenses = this.getAverageMonthlyExpenses(transactions);
    // Fallback when there are no recent expenses: derive 1 month of expenses
    // from the legacy emergency target (24M / 6 months).
    const effectiveMonthlyExpenses =
      monthlyExpenses > 0
        ? monthlyExpenses
        : FALLBACK_EMERGENCY_TARGET / EMERGENCY_MONTHS;

    const formulas: Record<
      FundCategory,
      { target: number; description: string }
    > = {
      emergency: {
        target: round(effectiveMonthlyExpenses * EMERGENCY_MONTHS),
        description: `${EMERGENCY_MONTHS} meses de gastos`,
      },
      investment: {
        target: round(totalBalance * INVESTMENT_ALLOCATION_PCT),
        description: `${INVESTMENT_ALLOCATION_PCT * 100}% del patrimonio`,
      },
      contingency: {
        target: round(effectiveMonthlyExpenses * CONTINGENCY_MONTHS),
        description: `${CONTINGENCY_MONTHS} mes de gastos`,
      },
      retirement: {
        target: round(totalBalance * RETIREMENT_ALLOCATION_PCT),
        description: `${RETIREMENT_ALLOCATION_PCT * 100}% del patrimonio`,
      },
    };

    return FUND_CATEGORIES.map((category) => {
      const override = overrides[category];
      const formula = formulas[category];
      return {
        category,
        target: override ?? formula.target,
        source: override !== undefined ? "manual" : "formula",
        formulaTarget: formula.target,
        formulaDescription: formula.description,
      };
    });
  }

  private getAverageMonthlyExpenses(
    transactions: TransactionWithAccount[],
  ): number {
    const cutoff = Date.now() - EXPENSES_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    let total = 0;
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      if (new Date(t.date).getTime() < cutoff) continue;
      total += Math.abs(t.amount);
    }
    return total / (EXPENSES_WINDOW_DAYS / 30);
  }
}

export const fundGoalsService = new FundGoalsService();
