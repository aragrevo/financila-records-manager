import type { APIRoute } from "astro";
import { jsonResponse } from "../../../lib/http";
import { expensesService } from "../../../services/expenses.service";

export const GET: APIRoute = async ({ params }) => {
  const expense = params.id ? await expensesService.getById(params.id) : null;
  return expense ? jsonResponse(expense) : jsonResponse({ error: "Gasto no encontrado" }, 404);
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    if (!params.id) return jsonResponse({ error: "Gasto no encontrado" }, 404);
    const expense = await expensesService.update(params.id, await request.json());
    if (!expense) return jsonResponse({ error: "Gasto no encontrado" }, 404);
    return jsonResponse(expense);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "No se pudo editar el gasto" }, 400);
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    if (!params.id) return jsonResponse({ error: "Gasto no encontrado" }, 404);
    const expense = await expensesService.delete(params.id);
    if (!expense) return jsonResponse({ error: "Gasto no encontrado" }, 404);
    return jsonResponse(expense);
  } catch (error) {
    return jsonResponse({ error: "No se pudo eliminar el gasto" }, 500);
  }
};
