import type { APIRoute } from "astro";
import { stocksService } from "../../../../services/stocks.service";
import { jsonResponse } from "../../../../lib/http";

export const GET: APIRoute = async ({ url }) => {
  try {
    const accountId = url.searchParams.get("accountId") ?? undefined;
    const positions = await stocksService.getPositions(accountId);
    return jsonResponse(positions);
  } catch (error) {
    console.error("Error fetching stock positions:", error);
    return jsonResponse({ error: "Failed to fetch stock positions" }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const position = await stocksService.createPosition(body);
    return jsonResponse(position, 201);
  } catch (error) {
    console.error("Error creating stock position:", error);
    return jsonResponse({ error: "Failed to create stock position" }, 500);
  }
};
