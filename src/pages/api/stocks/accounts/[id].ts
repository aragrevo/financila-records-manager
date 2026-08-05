import type { APIRoute } from "astro";
import { stocksService } from "../../../../services/stocks.service";
import { jsonResponse } from "../../../../lib/http";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const account = id ? await stocksService.getAccountById(id) : null;

    if (!account) {
      return jsonResponse({ error: "Stock account not found" }, 404);
    }

    return jsonResponse(account);
  } catch (error) {
    console.error("Error fetching stock account:", error);
    return jsonResponse({ error: "Failed to fetch stock account" }, 500);
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return jsonResponse({ error: "Stock account not found" }, 404);
    }

    const body = await request.json();
    const updated = await stocksService.updateAccount(id, body);

    if (!updated) {
      return jsonResponse({ error: "Stock account not found" }, 404);
    }

    return jsonResponse(updated);
  } catch (error) {
    console.error("Error updating stock account:", error);
    return jsonResponse({ error: "Failed to update stock account" }, 500);
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const deleted = id ? await stocksService.deleteAccount(id) : false;

    if (!deleted) {
      return jsonResponse({ error: "Stock account not found" }, 404);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Error deleting stock account:", error);
    return jsonResponse({ error: "Failed to delete stock account" }, 500);
  }
};
