import type { APIRoute } from "astro";
import { stocksService } from "../../../../services/stocks.service";
import { jsonResponse } from "../../../../lib/http";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const position = id ? await stocksService.getPositionById(id) : null;

    if (!position) {
      return jsonResponse({ error: "Stock position not found" }, 404);
    }

    return jsonResponse(position);
  } catch (error) {
    console.error("Error fetching stock position:", error);
    return jsonResponse({ error: "Failed to fetch stock position" }, 500);
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return jsonResponse({ error: "Stock position not found" }, 404);
    }

    const body = await request.json();
    const updated =
      body.closeShares === undefined
        ? await stocksService.updatePosition(id, body)
        : await stocksService.closePosition(id, body.closeShares);

    if (!updated) {
      return jsonResponse({ error: "Stock position not found" }, 404);
    }

    return jsonResponse(updated);
  } catch (error) {
    console.error("Error updating stock position:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Failed to update stock position" },
      400,
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const closed = id ? await stocksService.closePosition(id) : null;

    if (!closed) {
      return jsonResponse({ error: "Stock position not found" }, 404);
    }

    return jsonResponse(closed);
  } catch (error) {
    console.error("Error closing stock position:", error);
    return jsonResponse({ error: "Failed to close stock position" }, 500);
  }
};
