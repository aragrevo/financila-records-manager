import type { ProjectionSettings } from "./types";

export interface ProjectionRow {
  month: number;
  date: Date;
  monthKey: string;
  opening: number;
  contribution: number;
  interest: number;
  closing: number;
  deposited: number;
}

export interface ProjectionResult {
  years: number;
  months: number;
  monthlyRate: number;
  rows: ProjectionRow[];
  futureValue: number;
  deposited: number;
  interest: number;
}

export const getCurrentPeriods = (settings: ProjectionSettings, months: number) => {
  const start = new Date(`${settings.startDate}-01T00:00:00`);
  const now = new Date();
  const elapsed = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 +
      now.getMonth() -
      start.getMonth() +
      1,
  );
  return Math.min(months, elapsed);
};

export const calculateProjection = (
  settings: ProjectionSettings,
): ProjectionResult => {
  const years = Math.max(0, settings.targetAge - settings.currentAge);
  const months = years * 12;
  const monthlyRate = Math.pow(1 + settings.annualReturn / 100, 1 / 12) - 1;
  const start = new Date(`${settings.startDate}-01T00:00:00`);
  let balance = settings.startingCapital;
  let deposited = settings.startingCapital;
  const rows: ProjectionRow[] = [];

  for (let month = 1; month <= months; month += 1) {
    const opening = balance;
    const date = new Date(start.getFullYear(), start.getMonth() + month - 1, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const contribution =
      settings.monthlyContributions[monthKey] ?? settings.monthlyContribution;
    const interest = opening * monthlyRate;
    balance = opening + interest + contribution;
    deposited += contribution;
    rows.push({ month, date, monthKey, opening, contribution, interest, closing: balance, deposited });
  }

  return {
    years,
    months,
    monthlyRate,
    rows,
    futureValue: balance,
    deposited,
    interest: balance - deposited,
  };
};
