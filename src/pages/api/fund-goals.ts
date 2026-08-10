import type { APIRoute } from "astro";
import {
  FUND_CATEGORIES,
  fundGoalsService,
  type FundCategory,
} from "../../services/fund-goals.service";
import {
  TRANSACTIONS_DATE_KEY,
  fetchAllAccounts,
  hydrateTransactions,
  withAccountNames,
} from "../../lib/queries";
import { redis } from "../../lib/db";
import { jsonResponse } from "../../lib/http";

export const GET: APIRoute = async () => {
  try {
    const [accounts, txnIds, overrides] = await Promise.all([
      fetchAllAccounts(),
      redis.zrange<string[]>(TRANSACTIONS_DATE_KEY, 0, -1, { rev: true }),
      fundGoalsService.getOverrides(),
    ]);
    const transactions = await withAccountNames(await hydrateTransactions(txnIds));

    return jsonResponse({
      overrides,
      goals: fundGoalsService.computeGoals(accounts, transactions, overrides),
    });
  } catch (error) {
    console.error("Error fetching fund goals:", error);
    return jsonResponse({ error: "Failed to fetch fund goals" }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const category = String(body.category);

    if (!FUND_CATEGORIES.includes(category as FundCategory)) {
      return jsonResponse(
        { error: `category must be one of: ${FUND_CATEGORIES.join(", ")}` },
        400,
      );
    }

    const target = body.target === null ? null : Number(body.target);
    if (target !== null && (!Number.isFinite(target) || target < 0)) {
      return jsonResponse({ error: "target must be a non-negative number or null" }, 400);
    }

    const overrides = await fundGoalsService.setOverride(
      category as FundCategory,
      target,
    );
    return jsonResponse({ overrides });
  } catch (error) {
    console.error("Error updating fund goal:", error);
    return jsonResponse({ error: "Failed to update fund goal" }, 500);
  }
};
