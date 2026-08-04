import type { APIRoute } from "astro";
import { billingService } from "../../../services/billing.service";

export const GET: APIRoute = async () => {
  try {
    const data = await billingService.getPageData();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching billing summary:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch billing summary" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const rows = Array.isArray(body) ? body : body.rows;

    if (Array.isArray(rows)) {
      const result = await billingService.importFromRawRows(rows);

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    const record = await billingService.createRecord({
      project: String(body.project ?? ""),
      monthKey: String(body.monthKey ?? ""),
      totalHours: Number(body.totalHours ?? 0),
      paidHours: Number(body.paidHours ?? 0),
      hourlyRate: Number(body.hourlyRate ?? 0),
    });

    return new Response(JSON.stringify(record), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error importing billing summary:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create billing record";
    const status =
      error instanceof Error &&
      [
        "Project is required",
        "Month must use YYYY-MM format",
        "Hours and hourly rate must be valid numbers",
        "Hours and hourly rate cannot be negative",
        "Paid hours cannot exceed total hours",
      ].includes(error.message)
        ? 400
        : 500;

    return new Response(
      JSON.stringify({ error: message }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
