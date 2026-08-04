import {
  BILLING_SEED_VERSION,
  billingSeedBalanceSnapshots,
  billingSeedRecords,
  type BillingSeedBalanceSnapshot,
  type BillingSeedRecord,
} from "../data/project_billing";
import { redis, KEYS } from "../lib/db";
import type {
  BillingBalanceSnapshot,
  BillingBalanceSummaryRow,
  BillingRecord,
  BillingSummaryMetrics,
  MonthlyBillingTrendPoint,
} from "../lib/types";

type RawBillingImportRow = Record<string, string | null>;
type CreateBillingRecordInput = {
  project: string;
  monthKey: string;
  totalHours: number;
  paidHours: number;
  hourlyRate: number;
};
type UpdateBillingRecordInput = {
  paidHours: number;
};

const DEFAULT_USER_ID = "user-001";

const MONTH_MAP: Record<string, string> = {
  ene: "01",
  feb: "02",
  mar: "03",
  abr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  ago: "08",
  sept: "09",
  oct: "10",
  nov: "11",
  dic: "12",
};
const MONTH_LABEL_BY_NUMBER = Object.fromEntries(
  Object.entries(MONTH_MAP).map(([label, monthNumber]) => [monthNumber, label]),
);

const normalizeMonthLabel = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const formatMonthLabel = (value: string) => {
  const normalized = normalizeMonthLabel(value);
  const [month, year] = normalized.split(" ");
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
};

const monthLabelToKey = (value: string) => {
  const normalized = normalizeMonthLabel(value);
  const [month, shortYear] = normalized.split(" ");
  const monthNumber = MONTH_MAP[month];

  if (!monthNumber || !shortYear) {
    throw new Error(`Invalid billing month label: ${value}`);
  }

  return `20${shortYear}-${monthNumber}`;
};

const monthKeyToLabel = (value: string) => {
  const [year, monthNumber] = value.split("-");
  const monthLabel = MONTH_LABEL_BY_NUMBER[monthNumber ?? ""];

  if (!monthLabel || !year || year.length !== 4) {
    throw new Error(`Invalid billing month key: ${value}`);
  }

  return formatMonthLabel(`${monthLabel} ${year.slice(-2)}`);
};

const parseNumericCell = (value: string | null | undefined) => {
  if (!value) {
    return 0;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  const sanitized = trimmed.replace(/\$/g, "").replace(/\s/g, "");

  if (sanitized.includes(",")) {
    return Number.parseFloat(sanitized.replace(/\./g, "").replace(",", "."));
  }

  return Number.parseFloat(sanitized.replace(/\./g, ""));
};

const deserializeBillingRecord = (
  record: Partial<BillingRecord> | null,
): BillingRecord | null => {
  if (!record?.id) {
    return null;
  }

  return {
    id: String(record.id),
    userId: String(record.userId ?? DEFAULT_USER_ID),
    project: String(record.project ?? ""),
    monthLabel: String(record.monthLabel ?? ""),
    monthKey: String(record.monthKey ?? ""),
    totalHours: Number(record.totalHours ?? 0),
    paidHours: Number(record.paidHours ?? 0),
    remainingHours: Number(record.remainingHours ?? 0),
    hourlyRate: Number(record.hourlyRate ?? 0),
    amount: Number(record.amount ?? 0),
    balance: Number(record.balance ?? 0),
    createdAt: String(record.createdAt ?? new Date().toISOString()),
  };
};

const deserializeBillingBalanceSnapshot = (
  snapshot: Partial<BillingBalanceSnapshot> | null,
): BillingBalanceSnapshot | null => {
  if (!snapshot?.id) {
    return null;
  }

  return {
    id: String(snapshot.id),
    userId: String(snapshot.userId ?? DEFAULT_USER_ID),
    project: String(snapshot.project ?? ""),
    monthLabel: String(snapshot.monthLabel ?? ""),
    monthKey: String(snapshot.monthKey ?? ""),
    balance: Number(snapshot.balance ?? 0),
    createdAt: String(snapshot.createdAt ?? new Date().toISOString()),
  };
};

const aggregateBillingRecords = (records: BillingRecord[]): BillingRecord[] => {
  const grouped = new Map<string, BillingRecord>();

  for (const record of records) {
    const key = `${record.project}::${record.monthKey}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, { ...record });
      continue;
    }

    const totalHours = existing.totalHours + record.totalHours;
    const weightedRateSum =
      existing.hourlyRate * existing.totalHours +
      record.hourlyRate * record.totalHours;

    grouped.set(key, {
      ...existing,
      totalHours,
      paidHours: existing.paidHours + record.paidHours,
      remainingHours: existing.remainingHours + record.remainingHours,
      amount: existing.amount + record.amount,
      balance: existing.balance + record.balance,
      hourlyRate: totalHours > 0 ? Math.round(weightedRateSum / totalHours) : 0,
    });
  }

  return Array.from(grouped.values());
};

const aggregateSeedRecords = (
  records: BillingSeedRecord[],
): BillingSeedRecord[] => {
  const grouped = new Map<string, BillingSeedRecord>();

  for (const record of records) {
    const monthLabel = normalizeMonthLabel(record.monthLabel);
    const key = `${record.project}::${monthLabel}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, { ...record, monthLabel });
      continue;
    }

    const totalHours = existing.totalHours + record.totalHours;
    const weightedRateSum =
      existing.hourlyRate * existing.totalHours +
      record.hourlyRate * record.totalHours;

    grouped.set(key, {
      ...existing,
      monthLabel,
      totalHours,
      paidHours: existing.paidHours + record.paidHours,
      remainingHours: existing.remainingHours + record.remainingHours,
      amount: existing.amount + record.amount,
      balance: existing.balance + record.balance,
      hourlyRate: totalHours > 0 ? Math.round(weightedRateSum / totalHours) : 0,
    });
  }

  return Array.from(grouped.values());
};

const aggregateBalanceSnapshots = (
  snapshots: BillingSeedBalanceSnapshot[],
): BillingSeedBalanceSnapshot[] => {
  const grouped = new Map<string, BillingSeedBalanceSnapshot>();

  for (const snapshot of snapshots) {
    const monthLabel = normalizeMonthLabel(snapshot.monthLabel);
    const key = `${snapshot.project}::${monthLabel}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, { ...snapshot, monthLabel });
      continue;
    }

    grouped.set(key, {
      ...existing,
      balance: existing.balance + snapshot.balance,
    });
  }

  return Array.from(grouped.values());
};

export class BillingService {
  async getPageData(): Promise<{
    records: BillingRecord[];
    balanceMonths: Array<{ key: string; label: string }>;
    balanceSummaryRows: BillingBalanceSummaryRow[];
    monthlyTrend: MonthlyBillingTrendPoint[];
    metrics: BillingSummaryMetrics;
  }> {
    const records = await this.getRecords();
    const { months, rows } = this.getBalanceSummary(records);

    return {
      records,
      balanceMonths: months,
      balanceSummaryRows: rows,
      monthlyTrend: this.getMonthlyTrend(records),
      metrics: this.getSummaryMetrics(records),
    };
  }

  async getRecords(): Promise<BillingRecord[]> {
    await this.ensureSeedData();

    const ids = await redis.smembers(KEYS.BILLING_RECORDS_INDEX);
    const records: BillingRecord[] = [];

    for (const id of ids) {
      const record = deserializeBillingRecord(
        (await redis.hgetall(
          `${KEYS.BILLING_RECORD}:${id}`,
        )) as Partial<BillingRecord> | null,
      );

      if (record) {
        records.push(record);
      }
    }

    return aggregateBillingRecords(records).sort((left, right) => {
      if (left.monthKey !== right.monthKey) {
        return right.monthKey.localeCompare(left.monthKey);
      }

      return left.project.localeCompare(right.project);
    });
  }

  getBalanceSummary(records: BillingRecord[]): {
    months: Array<{ key: string; label: string }>;
    rows: BillingBalanceSummaryRow[];
  } {
    const monthMap = new Map<string, string>();
    const rowsByProject = new Map<string, BillingBalanceSummaryRow>();

    for (const record of records) {
      if (record.balance <= 0) {
        continue;
      }

      monthMap.set(record.monthKey, record.monthLabel);

      if (!rowsByProject.has(record.project)) {
        rowsByProject.set(record.project, {
          project: record.project,
          monthValues: {},
          total: 0,
        });
      }

      const row = rowsByProject.get(record.project)!;
      row.monthValues[record.monthKey] =
        (row.monthValues[record.monthKey] ?? 0) + record.balance;
      row.total += record.balance;
    }

    const months = Array.from(monthMap.entries())
      .sort(([left], [right]) => right.localeCompare(left))
      .map(([key, label]) => ({
        key,
        label,
      }));

    const rows = Array.from(rowsByProject.values()).sort(
      (left, right) => right.total - left.total,
    );

    return { months, rows };
  }

  async importFromRawRows(rows: RawBillingImportRow[]) {
    const { records, snapshots } = this.parseRawRows(rows);
    await this.replaceAll(records, snapshots);

    return {
      recordsImported: records.length,
      snapshotsImported: snapshots.length,
    };
  }

  async createRecord(input: CreateBillingRecordInput): Promise<BillingRecord> {
    await this.ensureSeedData();

    const project = input.project.trim();
    const monthKey = input.monthKey.trim();
    const totalHours = Number(input.totalHours);
    const paidHours = Number(input.paidHours);
    const hourlyRate = Number(input.hourlyRate);

    if (!project) {
      throw new Error("Project is required");
    }

    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      throw new Error("Month must use YYYY-MM format");
    }

    if (
      !Number.isFinite(totalHours) ||
      !Number.isFinite(paidHours) ||
      !Number.isFinite(hourlyRate)
    ) {
      throw new Error("Hours and hourly rate must be valid numbers");
    }

    if (totalHours < 0 || paidHours < 0 || hourlyRate < 0) {
      throw new Error("Hours and hourly rate cannot be negative");
    }

    if (paidHours > totalHours) {
      throw new Error("Paid hours cannot exceed total hours");
    }

    const remainingHours = Number((totalHours - paidHours).toFixed(2));
    const amount = Math.round(totalHours * hourlyRate);
    const balance = Math.round(remainingHours * hourlyRate);
    const createdAt = new Date().toISOString();
    const id = `bill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const record: BillingRecord = {
      id,
      userId: DEFAULT_USER_ID,
      project,
      monthKey,
      monthLabel: monthKeyToLabel(monthKey),
      totalHours,
      paidHours,
      remainingHours,
      hourlyRate,
      amount,
      balance,
      createdAt,
    };

    await redis.hset(
      `${KEYS.BILLING_RECORD}:${id}`,
      record as unknown as Record<string, unknown>,
    );
    await redis.sadd(KEYS.BILLING_RECORDS_INDEX, id);

    return record;
  }

  async getRecordById(id: string): Promise<BillingRecord | null> {
    await this.ensureSeedData();

    return deserializeBillingRecord(
      (await redis.hgetall(
        `${KEYS.BILLING_RECORD}:${id}`,
      )) as Partial<BillingRecord> | null,
    );
  }

  async updateRecord(
    id: string,
    input: UpdateBillingRecordInput,
  ): Promise<BillingRecord> {
    await this.ensureSeedData();

    const existing = await this.getRecordById(id);

    if (!existing) {
      throw new Error("Billing record not found");
    }

    const paidHours = Number(input.paidHours);

    if (!Number.isFinite(paidHours)) {
      throw new Error("Paid hours must be a valid number");
    }

    if (paidHours < 0) {
      throw new Error("Paid hours cannot be negative");
    }

    if (paidHours > existing.totalHours) {
      throw new Error("Paid hours cannot exceed total hours");
    }

    const normalizedPaidHours = Number(paidHours.toFixed(2));
    const remainingHours = Number(
      (existing.totalHours - normalizedPaidHours).toFixed(2),
    );
    const updated: BillingRecord = {
      ...existing,
      paidHours: normalizedPaidHours,
      remainingHours,
      balance: Math.round(remainingHours * existing.hourlyRate),
    };

    await redis.hset(
      `${KEYS.BILLING_RECORD}:${id}`,
      updated as unknown as Record<string, unknown>,
    );

    return updated;
  }

  private async ensureSeedData() {
    const existingIds = await redis.smembers(KEYS.BILLING_RECORDS_INDEX);
    const existingSnapshotIds = await redis.smembers(
      KEYS.BILLING_BALANCE_SNAPSHOTS_INDEX,
    );
    const currentVersion = await redis.get<string>(KEYS.BILLING_SEED_VERSION);

    if (existingIds.length > 0 || existingSnapshotIds.length > 0) {
      await this.normalizeStoredData();
      return;
    }

    if (currentVersion === BILLING_SEED_VERSION) {
      return;
    }

    await this.replaceAll(billingSeedRecords, billingSeedBalanceSnapshots);
    await redis.set(KEYS.BILLING_SEED_VERSION, BILLING_SEED_VERSION);
  }

  private getSummaryMetrics(records: BillingRecord[]): BillingSummaryMetrics {
    const outstandingBalance = records.reduce(
      (sum, record) => sum + record.balance,
      0,
    );
    const pendingHours = records.reduce(
      (sum, record) => sum + record.remainingHours,
      0,
    );
    const totalBillableHours = records.reduce(
      (sum, record) => sum + record.totalHours,
      0,
    );
    const weightedRateSum = records.reduce(
      (sum, record) => sum + record.hourlyRate * record.totalHours,
      0,
    );
    const monthsWithHours = new Map<string, number>();

    for (const record of records) {
      monthsWithHours.set(
        record.monthKey,
        (monthsWithHours.get(record.monthKey) ?? 0) + record.totalHours,
      );
    }

    const totalMonthlyHours = Array.from(monthsWithHours.values()).reduce(
      (sum, hours) => sum + hours,
      0,
    );

    return {
      outstandingBalance,
      pendingHours,
      averageMonthlyHours:
        monthsWithHours.size > 0 ? totalMonthlyHours / monthsWithHours.size : 0,
      averageHourlyRate:
        totalBillableHours > 0
          ? Math.round(weightedRateSum / totalBillableHours)
          : 0,
    };
  }

  private getMonthlyTrend(
    records: BillingRecord[],
  ): MonthlyBillingTrendPoint[] {
    const byMonth = new Map<string, MonthlyBillingTrendPoint>();

    for (const record of records) {
      if (!byMonth.has(record.monthKey)) {
        byMonth.set(record.monthKey, {
          monthKey: record.monthKey,
          monthLabel: record.monthLabel,
          totalHours: 0,
          totalAmount: 0,
          totalBalance: 0,
        });
      }

      const monthEntry = byMonth.get(record.monthKey)!;
      monthEntry.totalHours += record.totalHours;
      monthEntry.totalAmount += record.amount;
      monthEntry.totalBalance += record.balance;
    }

    return Array.from(byMonth.values()).sort((left, right) =>
      right.monthKey.localeCompare(left.monthKey),
    );
  }

  private parseRawRows(rows: RawBillingImportRow[]) {
    const records: BillingSeedRecord[] = [];
    const snapshots: BillingSeedBalanceSnapshot[] = [];
    let snapshotMonthLabels: string[] = [];

    for (const row of rows) {
      const detailProject = row["Unnamed: 1"]?.trim();
      const detailMonth = row["Unnamed: 2"]?.trim();
      const detailHours = row["Unnamed: 3"]?.trim();

      if (
        detailProject &&
        detailProject !== "Project" &&
        detailMonth &&
        detailHours
      ) {
        records.push({
          project: detailProject,
          monthLabel: normalizeMonthLabel(detailMonth),
          totalHours: parseNumericCell(row["Unnamed: 3"]),
          paidHours: parseNumericCell(row["Unnamed: 4"]),
          remainingHours: parseNumericCell(row["Unnamed: 5"]),
          hourlyRate: parseNumericCell(row["Unnamed: 6"]),
          amount: parseNumericCell(row["Unnamed: 7"]),
          balance: parseNumericCell(row["Unnamed: 8"]),
        });
      }

      if (row["Unnamed: 10"]?.trim() === "Project") {
        snapshotMonthLabels = [
          normalizeMonthLabel(row["Unnamed: 11"] ?? ""),
          normalizeMonthLabel(row["Unnamed: 12"] ?? ""),
        ].filter(Boolean);
        continue;
      }

      const snapshotProject = row["Unnamed: 10"]?.trim();
      if (
        snapshotProject &&
        snapshotProject !== "Suma total" &&
        snapshotMonthLabels.length > 0
      ) {
        const firstMonthBalance = parseNumericCell(row["Unnamed: 11"]);
        const secondMonthBalance = parseNumericCell(row["Unnamed: 12"]);

        if (snapshotMonthLabels[0] && firstMonthBalance > 0) {
          snapshots.push({
            project: snapshotProject,
            monthLabel: snapshotMonthLabels[0],
            balance: firstMonthBalance,
          });
        }

        if (snapshotMonthLabels[1] && secondMonthBalance > 0) {
          snapshots.push({
            project: snapshotProject,
            monthLabel: snapshotMonthLabels[1],
            balance: secondMonthBalance,
          });
        }
      }
    }

    return { records, snapshots };
  }

  private async replaceAll(
    records: BillingSeedRecord[],
    snapshots: BillingSeedBalanceSnapshot[],
  ) {
    const normalizedRecords = aggregateSeedRecords(records);
    const normalizedSnapshots = aggregateBalanceSnapshots(snapshots);

    await this.clearCollection(KEYS.BILLING_RECORDS_INDEX, KEYS.BILLING_RECORD);
    await this.clearCollection(
      KEYS.BILLING_BALANCE_SNAPSHOTS_INDEX,
      KEYS.BILLING_BALANCE_SNAPSHOT,
    );

    const createdAt = new Date().toISOString();

    for (const [index, record] of normalizedRecords.entries()) {
      const id = `bill-${Date.now()}-${index}`;
      const payload: BillingRecord = {
        id,
        userId: DEFAULT_USER_ID,
        project: record.project,
        monthLabel: formatMonthLabel(record.monthLabel),
        monthKey: monthLabelToKey(record.monthLabel),
        totalHours: record.totalHours,
        paidHours: record.paidHours,
        remainingHours: record.remainingHours,
        hourlyRate: record.hourlyRate,
        amount: record.amount,
        balance: record.balance,
        createdAt,
      };

      await redis.hset(
        `${KEYS.BILLING_RECORD}:${id}`,
        payload as unknown as Record<string, unknown>,
      );
      await redis.sadd(KEYS.BILLING_RECORDS_INDEX, id);
    }

    for (const [index, snapshot] of normalizedSnapshots.entries()) {
      const id = `bill-snapshot-${Date.now()}-${index}`;
      const payload: BillingBalanceSnapshot = {
        id,
        userId: DEFAULT_USER_ID,
        project: snapshot.project,
        monthLabel: formatMonthLabel(snapshot.monthLabel),
        monthKey: monthLabelToKey(snapshot.monthLabel),
        balance: snapshot.balance,
        createdAt,
      };

      await redis.hset(
        `${KEYS.BILLING_BALANCE_SNAPSHOT}:${id}`,
        payload as unknown as Record<string, unknown>,
      );
      await redis.sadd(KEYS.BILLING_BALANCE_SNAPSHOTS_INDEX, id);
    }

    await redis.set(KEYS.BILLING_SEED_VERSION, BILLING_SEED_VERSION);
  }

  private async normalizeStoredData() {
    const rawRecords = await this.getStoredRecordsRaw();
    const rawSnapshots = await this.getStoredSnapshotsRaw();

    const normalizedRecords = aggregateSeedRecords(
      rawRecords.map((record) => ({
        project: record.project,
        monthLabel: normalizeMonthLabel(record.monthLabel),
        totalHours: record.totalHours,
        paidHours: record.paidHours,
        remainingHours: record.remainingHours,
        hourlyRate: record.hourlyRate,
        amount: record.amount,
        balance: record.balance,
      })),
    );

    const normalizedSnapshots = aggregateBalanceSnapshots(
      rawSnapshots.map((snapshot) => ({
        project: snapshot.project,
        monthLabel: normalizeMonthLabel(snapshot.monthLabel),
        balance: snapshot.balance,
      })),
    );

    if (
      normalizedRecords.length === rawRecords.length &&
      normalizedSnapshots.length === rawSnapshots.length
    ) {
      return;
    }

    await this.replaceAll(normalizedRecords, normalizedSnapshots);
  }

  private async getStoredRecordsRaw(): Promise<BillingRecord[]> {
    const ids = await redis.smembers(KEYS.BILLING_RECORDS_INDEX);
    const records: BillingRecord[] = [];

    for (const id of ids) {
      const record = deserializeBillingRecord(
        (await redis.hgetall(
          `${KEYS.BILLING_RECORD}:${id}`,
        )) as Partial<BillingRecord> | null,
      );

      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  private async getStoredSnapshotsRaw(): Promise<BillingBalanceSnapshot[]> {
    const ids = await redis.smembers(KEYS.BILLING_BALANCE_SNAPSHOTS_INDEX);
    const snapshots: BillingBalanceSnapshot[] = [];

    for (const id of ids) {
      const snapshot = deserializeBillingBalanceSnapshot(
        (await redis.hgetall(
          `${KEYS.BILLING_BALANCE_SNAPSHOT}:${id}`,
        )) as Partial<BillingBalanceSnapshot> | null,
      );

      if (snapshot) {
        snapshots.push(snapshot);
      }
    }

    return snapshots;
  }

  private async clearCollection(indexKey: string, itemKeyPrefix: string) {
    const ids = await redis.smembers(indexKey);

    for (const id of ids) {
      await redis.del(`${itemKeyPrefix}:${id}`);
    }

    await redis.del(indexKey);
  }
}

export const billingService = new BillingService();
