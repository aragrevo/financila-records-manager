import type { APIRoute } from "astro";
import { accountsService } from "../../../services/accounts.service";
import { jsonResponse } from "../../../lib/http";

export const GET: APIRoute = async () => {
  try {
    const accounts = await accountsService.getAll();
    return jsonResponse(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return jsonResponse({ error: "Failed to fetch accounts" }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const account = await accountsService.create(body);
    return jsonResponse(account, 201);
  } catch (error) {
    console.error("Error creating account:", error);
    return jsonResponse({ error: "Failed to create account" }, 500);
  }
};
