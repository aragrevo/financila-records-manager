import type { APIRoute } from "astro";
import { jsonResponse } from "../../lib/http";
import { expenseSettingsService } from "../../services/expense-settings.service";

export const GET: APIRoute = async () => jsonResponse(await expenseSettingsService.get());

export const PUT: APIRoute = async ({ request }) => {
  try {
    return jsonResponse(await expenseSettingsService.update(await request.json()));
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "No se pudo guardar configuración" }, 400);
  }
};
