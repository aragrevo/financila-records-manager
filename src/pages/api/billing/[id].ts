import type { APIRoute } from "astro";
import { billingService } from "../../../services/billing.service";

const BAD_REQUEST_MESSAGES = [
  "Paid hours must be a valid number",
  "Paid hours cannot be negative",
  "Paid hours cannot exceed total hours",
];

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: "Billing record id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const record = await billingService.updateRecord(id, {
      paidHours: Number(body.paidHours),
    });

    return new Response(JSON.stringify(record), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating billing record:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update billing record";
    const status =
      message === "Billing record not found"
        ? 404
        : BAD_REQUEST_MESSAGES.includes(message)
          ? 400
          : 500;

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
