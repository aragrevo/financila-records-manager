import type { APIRoute } from "astro";
import { stocksService } from "../../../../services/stocks.service";
import { jsonResponse } from "../../../../lib/http";

export const GET: APIRoute = async () => {
  try {
    const accounts = await stocksService.getAccounts();
    return jsonResponse(accounts);
  } catch (error) {
    console.error("Error fetching stock accounts:", error);
    return jsonResponse({ error: "Failed to fetch stock accounts" }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const account = await stocksService.createAccount(body);
    return jsonResponse(account, 201);
  } catch (error) {
    console.error("Error creating stock account:", error);
    return jsonResponse({ error: "Failed to create stock account" }, 500);
  }
};
