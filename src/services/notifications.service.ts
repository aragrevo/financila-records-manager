import { redis, KEYS } from "../lib/db";
import type { Expense } from "../lib/types";
import { expenseSettingsService } from "./expense-settings.service";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] ?? char);

export class NotificationsService {
  async sendExpenseReport(expenses: Expense[]): Promise<{ sent: boolean; reason?: string }> {
    const settings = await expenseSettingsService.get();
    const apiKey = import.meta.env?.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
    const from = import.meta.env?.NOTIFICATION_FROM_EMAIL ?? process.env.NOTIFICATION_FROM_EMAIL;
    if (!settings.recipientEmail) return { sent: false, reason: "missing-recipient" };
    if (!apiKey || !from) return { sent: false, reason: "missing-email-environment" };

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = expenses.filter((expense) => expense.date.startsWith(currentMonth));
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const formatMoney = (amount: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: settings.currency }).format(amount);
    const periodLabel = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(`${currentMonth}-01T00:00:00Z`));
    const detail = currentMonthExpenses.length
      ? currentMonthExpenses.map((expense) => `<tr><td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#374151">${escapeHtml(expense.date)}</td><td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#374151">${escapeHtml(expense.description || "Sin descripción")}</td><td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#374151">${escapeHtml(expense.category)}</td><td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;color:${expense.amount < 0 ? "#b91c1c" : "#047857"};font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${escapeHtml(formatMoney(expense.amount))}</td></tr>`).join("")
      : `<tr><td colspan="4" style="padding:12px;color:#6b7280">No hay movimientos en el mes actual.</td></tr>`;
    const subject = `Resumen de gastos - ${currentMonth}`;
    const html = `
      <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center" style="background-color:#f4f4f5;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:16px;line-height:155%;padding:24px 0">
        <tbody><tr><td align="center">
          <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:8px">
            <tbody><tr><td style="padding:32px">
              <h1 style="margin:0;font-size:36px;line-height:1.2;font-weight:600;color:#111827">Resumen de gastos</h1>
              <p style="margin:12px 0 24px;color:#4b5563">Hola, aquí tienes tu resumen de gastos correspondiente a <strong>${escapeHtml(periodLabel)}</strong>.</p>
              <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr>
                <td width="50%" style="padding-right:8px;vertical-align:top"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f9fafb;border-radius:8px"><tbody><tr><td style="padding:20px"><p style="margin:0 0 8px;color:#6b7280;font-size:12px">Total general</p><h2 style="margin:0;font-size:29px;font-weight:600;color:#111827">${escapeHtml(formatMoney(total))}</h2></td></tr></tbody></table></td>
                <td width="50%" style="padding-left:8px;vertical-align:top"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f9fafb;border-radius:8px"><tbody><tr><td style="padding:20px"><p style="margin:0 0 8px;color:#6b7280;font-size:12px">Total del mes</p><h2 style="margin:0;font-size:29px;font-weight:600;color:#111827">${escapeHtml(formatMoney(monthTotal))}</h2></td></tr></tbody></table></td>
              </tr></tbody></table>
              <h3 style="margin:28px 0 12px;font-size:22px;line-height:1.2;font-weight:600;color:#111827">Detalle de gastos</h3>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse"><thead><tr><th align="left" style="padding:10px;border-bottom:2px solid #d1d5db;color:#6b7280;font-size:12px">Fecha</th><th align="left" style="padding:10px;border-bottom:2px solid #d1d5db;color:#6b7280;font-size:12px">Descripción</th><th align="left" style="padding:10px;border-bottom:2px solid #d1d5db;color:#6b7280;font-size:12px">Categoría</th><th align="right" style="padding:10px;border-bottom:2px solid #d1d5db;color:#6b7280;font-size:12px">Importe</th></tr></thead><tbody>${detail}</tbody></table>
            </td></tr></tbody>
          </table>
        </td></tr></tbody>
      </table>`;
    try {
      await this.send(settings.recipientEmail, from, subject, html, apiKey);
      await this.log("report", "all", "sent");
      return { sent: true };
    } catch (error) {
      await this.log("report", "all", "failed", error instanceof Error ? error.message : "Unknown error");
      console.error("Expense report email failed:", error);
      return { sent: false, reason: "send-failed" };
    }
  }

  private async send(to: string, from: string, subject: string, html: string, apiKey: string) {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, html }) });
    if (!response.ok) throw new Error(`Resend returned ${response.status}`);
  }

  private async log(event: "report", expenseId: string, status: "sent" | "failed", error?: string) {
    const id = `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await redis.hset(`${KEYS.NOTIFICATION_LOG}:${id}`, { id, event, expenseId, channel: "email", status, error: error ?? "", createdAt: new Date().toISOString() });
  }
}

export const notificationsService = new NotificationsService();
