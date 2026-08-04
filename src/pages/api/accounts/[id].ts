import type { APIRoute } from "astro";
import { accountsService } from "../../../services/accounts.service";
import { jsonResponse } from "../../../lib/http";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const account = id ? await accountsService.getById(id) : null;

    if (!account) {
      return jsonResponse({ error: "Account not found" }, 404);
    }

    return jsonResponse(account);
  } catch (error) {
    console.error("Error fetching account:", error);
    return jsonResponse({ error: "Failed to fetch account" }, 500);
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    if (!id) {
      return jsonResponse({ error: "Account not found" }, 404);
    }

    const body = await request.json();
    const updated = await accountsService.update(id, body);

    if (!updated) {
      return jsonResponse({ error: "Account not found" }, 404);
    }

    return jsonResponse(updated);
  } catch (error) {
    console.error("Error updating account:", error);
    return jsonResponse({ error: "Failed to update account" }, 500);
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const deleted = id ? await accountsService.delete(id) : false;

    if (!deleted) {
      return jsonResponse({ error: "Account not found" }, 404);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return jsonResponse({ error: "Failed to delete account" }, 500);
  }
};
