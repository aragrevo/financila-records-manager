import { redis, KEYS } from "../lib/db";
import type { ExpenseSettings } from "../lib/types";

const DEFAULTS: ExpenseSettings = {
  currency: "EUR",
  recipientEmail: "",
};

export class ExpenseSettingsService {
  async get(): Promise<ExpenseSettings> {
    const stored = await redis.hgetall<Partial<ExpenseSettings>>(KEYS.EXPENSE_SETTINGS);
    if (!stored) return DEFAULTS;
    return {
      ...DEFAULTS,
      ...stored,
    };
  }

  async update(input: Partial<ExpenseSettings>): Promise<ExpenseSettings> {
    const current = await this.get();
    const next = {
      ...current,
      ...input,
      currency: String(input.currency ?? current.currency).trim().toUpperCase(),
      recipientEmail: String(input.recipientEmail ?? current.recipientEmail).trim(),
    };
    if (!/^[A-Z]{3}$/.test(next.currency)) throw new Error("La moneda debe usar tres letras, por ejemplo EUR");
    const recipients = next.recipientEmail.split(",").map((email) => email.trim()).filter(Boolean);
    if (recipients.some((email) => !/^\S+@\S+\.\S+$/.test(email))) throw new Error("Uno de los correos no es válido");
    await redis.hset(KEYS.EXPENSE_SETTINGS, next as unknown as Record<string, unknown>);
    return next;
  }
}

export const expenseSettingsService = new ExpenseSettingsService();
