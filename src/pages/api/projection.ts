import type { APIRoute } from "astro";
import { jsonResponse } from "../../lib/http";
import {
  projectionService,
  type ProjectionSettingsInput,
} from "../../services/projection.service";

const isValidMonth = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

const parseSettings = (body: Record<string, unknown>): ProjectionSettingsInput | string => {
  const settings = {
    currentAge: Number(body.currentAge),
    targetAge: Number(body.targetAge),
    startingCapital: Number(body.startingCapital),
    monthlyContribution: Number(body.monthlyContribution),
    annualReturn: Number(body.annualReturn),
    startDate: body.startDate,
    monthlyContributions: body.monthlyContributions,
  };

  if (
    !Number.isInteger(settings.currentAge) ||
    settings.currentAge < 1 ||
    settings.currentAge > 100 ||
    !Number.isInteger(settings.targetAge) ||
    settings.targetAge <= settings.currentAge ||
    settings.targetAge > 120
  ) {
    return "targetAge must be greater than currentAge and within valid range";
  }

  if (
    !Number.isFinite(settings.startingCapital) ||
    settings.startingCapital < 0 ||
    !Number.isFinite(settings.monthlyContribution) ||
    settings.monthlyContribution < 0 ||
    !Number.isFinite(settings.annualReturn) ||
    settings.annualReturn < 0 ||
    settings.annualReturn > 100
  ) {
    return "Capital, contribution, and return must be non-negative valid numbers";
  }

  if (!isValidMonth(settings.startDate)) {
    return "startDate must use YYYY-MM format";
  }

  if (
    typeof settings.monthlyContributions !== "object" ||
    settings.monthlyContributions === null ||
    Array.isArray(settings.monthlyContributions) ||
    Object.entries(settings.monthlyContributions).some(
      ([month, amount]) =>
        !isValidMonth(month) || !Number.isFinite(Number(amount)) || Number(amount) < 0,
    )
  ) {
    return "monthlyContributions must contain valid non-negative amounts by month";
  }

  settings.monthlyContributions = Object.fromEntries(
    Object.entries(settings.monthlyContributions).map(([month, amount]) => [month, Number(amount)]),
  );

  return settings as ProjectionSettingsInput;
};

export const GET: APIRoute = async () => {
  try {
    return jsonResponse({ settings: await projectionService.getSettings() });
  } catch (error) {
    console.error("Error fetching projection settings:", error);
    return jsonResponse({ error: "Failed to fetch projection settings" }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = parseSettings(body);
    if (typeof parsed === "string") return jsonResponse({ error: parsed }, 400);
    return jsonResponse({ settings: await projectionService.saveSettings(parsed) });
  } catch (error) {
    console.error("Error saving projection settings:", error);
    return jsonResponse({ error: "Failed to save projection settings" }, 500);
  }
};

export const DELETE: APIRoute = async () => {
  try {
    return jsonResponse({ settings: await projectionService.resetSettings() });
  } catch (error) {
    console.error("Error resetting projection settings:", error);
    return jsonResponse({ error: "Failed to reset projection settings" }, 500);
  }
};
