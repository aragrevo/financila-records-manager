import { redis, KEYS } from "../lib/db";
import { DEFAULT_USER_ID } from "../lib/queries";
import type { Expense } from "../lib/types";

export type ExpenseInput = Pick<Expense, "date" | "amount" | "currency" | "description" | "category">;

const DATE_KEY = `${KEYS.EXPENSES_BY_DATE}:${DEFAULT_USER_ID}`;
const idFor = () => `expense-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const scoreFor = (date: string) => new Date(`${date}T00:00:00Z`).getTime();

const normalize = (input: Partial<ExpenseInput>): ExpenseInput => {
  const date = String(input.date ?? "");
  const amount = Number(input.amount);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(scoreFor(date))) {
    throw new Error("La fecha no es válida");
  }
  if (!Number.isFinite(amount) || amount === 0) throw new Error("El importe no puede ser cero");
  if (!String(input.currency ?? "").trim()) throw new Error("La moneda es obligatoria");
  return {
    date,
    amount,
    currency: String(input.currency).trim().toUpperCase(),
    description: String(input.description ?? "").trim(),
    category: String(input.category ?? "General").trim() || "General",
  };
};

export class ExpensesService {
  private normalizeStored(record: Expense): Expense {
    return { ...record, amount: Number(record.amount) };
  }

  async getAll(): Promise<Expense[]> {
    const ids = await redis.zrange<string[]>(DATE_KEY, 0, -1, { rev: true });
    if (!ids.length) return [];
    const pipeline = redis.pipeline();
    ids.forEach((id) => pipeline.hgetall(`${KEYS.EXPENSE}:${id}`));
    const records = (await pipeline.exec()) as Array<Expense | null>;
    return records
      .filter((record): record is Expense => Boolean(record?.id && record.status !== "deleted"))
      .map((record) => this.normalizeStored(record));
  }

  async getById(id: string): Promise<Expense | null> {
    const record = await redis.hgetall<Expense>(`${KEYS.EXPENSE}:${id}`);
    return record?.id && record.status !== "deleted" ? this.normalizeStored(record) : null;
  }

  async create(input: Partial<ExpenseInput>): Promise<Expense> {
    const values = normalize(input);
    const now = new Date().toISOString();
    const expense: Expense = {
      ...values,
      id: idFor(),
      userId: DEFAULT_USER_ID,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    const pipeline = redis.pipeline();
    pipeline.hset(`${KEYS.EXPENSE}:${expense.id}`, expense as unknown as Record<string, unknown>);
    pipeline.sadd(KEYS.EXPENSES_INDEX, expense.id);
    pipeline.zadd(DATE_KEY, { score: scoreFor(expense.date), member: expense.id });
    await pipeline.exec();
    return expense;
  }

  async update(id: string, input: Partial<ExpenseInput>): Promise<Expense | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const updated: Expense = { ...existing, ...normalize({ ...existing, ...input }), updatedAt: new Date().toISOString() };
    const pipeline = redis.pipeline();
    pipeline.hset(`${KEYS.EXPENSE}:${id}`, updated as unknown as Record<string, unknown>);
    pipeline.zadd(DATE_KEY, { score: scoreFor(updated.date), member: id });
    await pipeline.exec();
    return updated;
  }

  async delete(id: string): Promise<Expense | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const pipeline = redis.pipeline();
    pipeline.del(`${KEYS.EXPENSE}:${id}`);
    pipeline.srem(KEYS.EXPENSES_INDEX, id);
    pipeline.zrem(DATE_KEY, id);
    await pipeline.exec();
    return existing;
  }
}

export const expensesService = new ExpensesService();
