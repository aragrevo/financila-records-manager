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

    if (
      !body.name ||
      !body.type ||
      !body.institution ||
      !body.category ||
      !Number.isFinite(Number(body.balance))
    ) {
      return jsonResponse(
        { error: "name, type, institution, category and balance are required" },
        400,
      );
    }

    const account = await accountsService.create({
      name: String(body.name),
      type: body.type,
      institution: String(body.institution),
      category: body.category,
      balance: Number(body.balance),
      ...(body.currency ? { currency: body.currency } : {}),
      ...(body.status ? { status: body.status } : {}),
    });
    return jsonResponse(account, 201);
  } catch (error) {
    console.error("Error creating account:", error);
    return jsonResponse({ error: "Failed to create account" }, 500);
  }
};
