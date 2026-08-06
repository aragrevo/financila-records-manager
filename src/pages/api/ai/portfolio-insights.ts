import type { APIRoute } from "astro";
import { insightsService } from "../../../services/insights.service";
import { jsonResponse } from "../../../lib/http";

export const GET: APIRoute = async ({ url }) => {
  try {
    const forceRefresh = url.searchParams.get("refresh") === "1";
    const insights = await insightsService.getPortfolioInsights(forceRefresh);
    return jsonResponse(insights);
  } catch (error) {
    console.error("Error generating AI portfolio insights:", error);
    const message =
      error instanceof Error && error.message.includes("GEMINI_API_KEY")
        ? error.message
        : "Failed to generate insights";
    return jsonResponse({ error: message }, 500);
  }
};
