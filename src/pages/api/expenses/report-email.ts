import type { APIRoute } from "astro";
import { jsonResponse } from "../../../lib/http";
import { expensesService } from "../../../services/expenses.service";
import { notificationsService } from "../../../services/notifications.service";

export const POST: APIRoute = async () => {
  const result = await notificationsService.sendExpenseReport(await expensesService.getAll());
  if (!result.sent) {
    const message = result.reason === "missing-recipient"
      ? "Configura correo destinatario primero"
      : result.reason === "missing-email-environment"
        ? "Falta configurar RESEND_API_KEY o NOTIFICATION_FROM_EMAIL"
        : "No se pudo enviar el correo";
    return jsonResponse({ error: message }, 400);
  }
  return jsonResponse(result);
};
