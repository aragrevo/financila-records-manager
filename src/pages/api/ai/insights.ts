import type { APIRoute } from "astro";
import { insightsService } from "../../../services/insights.service";
import { jsonResponse } from "../../../lib/http";

export const GET: APIRoute = async ({ url }) => {
  try {
    const forceRefresh = url.searchParams.get("refresh") === "1";
    const insights = await insightsService.getFundsInsights(forceRefresh);
    return jsonResponse(insights);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    const rawMessage = error instanceof Error ? error.message : "";
    const message =
      rawMessage.includes("GEMINI_API_KEY") || rawMessage === "No hay un análisis guardado"
        ? rawMessage
        : "Failed to load insights";
    const status = message === "No hay un análisis guardado" ? 404 : 500;
    return jsonResponse({ error: message }, status);
  }
};
