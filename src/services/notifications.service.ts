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
    const detail = currentMonthExpenses.length
      ? currentMonthExpenses.map((expense) => `<tr><td>${escapeHtml(expense.date)}</td><td>${escapeHtml(expense.category)}</td><td>${escapeHtml(expense.description || "Sin descripción")}</td><td style="text-align:right">${escapeHtml(formatMoney(expense.amount))}</td></tr>`).join("")
      : `<tr><td colspan="4">No hay movimientos en el mes actual.</td></tr>`;
    const subject = `Resumen de gastos - ${currentMonth}`;
    const html = `<h2>Resumen de gastos</h2><p><strong>Total general:</strong> ${escapeHtml(formatMoney(total))}</p><p><strong>Total mes actual (${escapeHtml(currentMonth)}):</strong> ${escapeHtml(formatMoney(monthTotal))}</p><h3>Detalle del mes actual</h3><table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse"><thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Importe</th></tr></thead><tbody>${detail}</tbody></table>`;
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
