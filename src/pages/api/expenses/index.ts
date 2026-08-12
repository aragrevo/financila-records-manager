import type { APIRoute } from "astro";
import { jsonResponse } from "../../../lib/http";
import { expensesService } from "../../../services/expenses.service";

export const GET: APIRoute = async () => {
  try {
    return jsonResponse(await expensesService.getAll());
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return jsonResponse({ error: "No se pudieron cargar los gastos" }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const expense = await expensesService.create(await request.json());
    return jsonResponse({ expense }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el gasto";
    return jsonResponse({ error: message }, message.startsWith("La ") || message.startsWith("El ") ? 400 : 500);
  }
};
