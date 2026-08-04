import type { APIRoute } from "astro";
import { transactionsService } from "../../../services/transactions.service";
import { jsonResponse } from "../../../lib/http";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const transaction = id ? await transactionsService.getById(id) : null;

    if (!transaction) {
      return jsonResponse({ error: "Transaction not found" }, 404);
    }

    return jsonResponse(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return jsonResponse({ error: "Failed to fetch transaction" }, 500);
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    if (!id) {
      return jsonResponse({ error: "Transaction not found" }, 404);
    }

    const body = await request.json();
    const updated = await transactionsService.update(id, body);

    if (!updated) {
      return jsonResponse({ error: "Transaction not found" }, 404);
    }

    return jsonResponse(updated);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return jsonResponse({ error: "Failed to update transaction" }, 500);
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const deleted = id ? await transactionsService.delete(id) : false;

    if (!deleted) {
      return jsonResponse({ error: "Transaction not found" }, 404);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return jsonResponse({ error: "Failed to delete transaction" }, 500);
  }
};
