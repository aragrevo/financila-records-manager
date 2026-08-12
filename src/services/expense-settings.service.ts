import { redis, KEYS } from "../lib/db";
import type { ExpenseSettings } from "../lib/types";

const DEFAULTS: ExpenseSettings = {
  currency: "EUR",
  recipientEmail: "",
  notificationsEnabled: false,
  notifyOnCreate: true,
  notifyOnUpdate: true,
  notifyOnDelete: true,
};

export class ExpenseSettingsService {
  async get(): Promise<ExpenseSettings> {
    const stored = await redis.hgetall<Partial<ExpenseSettings>>(KEYS.EXPENSE_SETTINGS);
    if (!stored) return DEFAULTS;
    return {
      ...DEFAULTS,
      ...stored,
      notificationsEnabled: stored.notificationsEnabled === true || stored.notificationsEnabled === "true",
      notifyOnCreate: stored.notifyOnCreate !== false && stored.notifyOnCreate !== "false",
      notifyOnUpdate: stored.notifyOnUpdate !== false && stored.notifyOnUpdate !== "false",
      notifyOnDelete: stored.notifyOnDelete !== false && stored.notifyOnDelete !== "false",
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
    if (next.recipientEmail && !/^\S+@\S+\.\S+$/.test(next.recipientEmail)) throw new Error("El correo no es válido");
    await redis.hset(KEYS.EXPENSE_SETTINGS, next as unknown as Record<string, unknown>);
    return next;
  }
}

export const expenseSettingsService = new ExpenseSettingsService();
