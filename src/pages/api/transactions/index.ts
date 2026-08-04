import type { APIRoute } from "astro";
import {
  transactionsService,
  type TransactionsFilter,
} from "../../../services/transactions.service";
import { jsonResponse } from "../../../lib/http";

const parseIntParam = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const accountId = url.searchParams.get("accountId") ?? undefined;
    const categoryId = url.searchParams.get("categoryId") ?? undefined;
    const type = url.searchParams.get("type") as
      | TransactionsFilter["type"]
      | null;
    const startDate = url.searchParams.get("dateStart") ?? undefined;
    const endDate = url.searchParams.get("dateEnd") ?? undefined;
    const limit = parseIntParam(url.searchParams.get("limit"), 100);
    const offset = parseIntParam(url.searchParams.get("offset"), 0);

    const filters: TransactionsFilter = {
      accountId,
      categoryId,
      type: type ?? undefined,
      startDate,
      endDate,
    };

    let transactions;
    let total;

    if (filters.type) {
      const all = await transactionsService.getAll(filters);
      total = all.length;
      transactions = all.slice(offset, offset + limit);
    } else {
      [transactions, total] = await Promise.all([
        transactionsService.getAll({ ...filters, limit, offset }),
        transactionsService.getCount(filters),
      ]);
    }

    return jsonResponse({ transactions, total });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return jsonResponse({ error: "Failed to fetch transactions" }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (
      !body.accountId ||
      !body.categoryId ||
      !body.type ||
      !Number.isFinite(Number(body.amount))
    ) {
      return jsonResponse(
        { error: "accountId, categoryId, type and amount are required" },
        400,
      );
    }

    const transaction = await transactionsService.create({
      description: String(body.description ?? ""),
      amount: Number(body.amount),
      type: body.type,
      accountId: String(body.accountId),
      categoryId: String(body.categoryId),
      date: body.date,
      merchant: body.merchant,
      status: body.status,
    });

    return jsonResponse(transaction, 201);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return jsonResponse({ error: "Failed to create transaction" }, 500);
  }
};
