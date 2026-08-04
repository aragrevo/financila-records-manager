export interface BillingSeedRecord {
  project: string;
  monthLabel: string;
  totalHours: number;
  paidHours: number;
  remainingHours: number;
  hourlyRate: number;
  amount: number;
  balance: number;
}

export interface BillingSeedBalanceSnapshot {
  project: string;
  monthLabel: string;
  balance: number;
}

export const billingSeedRecords: BillingSeedRecord[] = [
  { project: "Dinissan", monthLabel: "jul 26", totalHours: 14, paidHours: 0, remainingHours: 14, hourlyRate: 103574, amount: 1450036, balance: 1450036 },
  { project: "Milpa", monthLabel: "jul 26", totalHours: 2.5, paidHours: 0, remainingHours: 2.5, hourlyRate: 103749, amount: 259373, balance: 259373 },
  { project: "BU", monthLabel: "jul 26", totalHours: 81.5, paidHours: 0, remainingHours: 81.5, hourlyRate: 111111, amount: 9055547, balance: 9055547 },
  { project: "Expreso Viajes", monthLabel: "jul 26", totalHours: 5, paidHours: 0, remainingHours: 5, hourlyRate: 105930, amount: 529650, balance: 529650 },
  { project: "Dinissan", monthLabel: "jun 26", totalHours: 15, paidHours: 15, remainingHours: 0, hourlyRate: 103574, amount: 1553610, balance: 0 },
  { project: "Expreso Viajes", monthLabel: "jun 26", totalHours: 2, paidHours: 2, remainingHours: 0, hourlyRate: 105930, amount: 211860, balance: 0 },
  { project: "BU", monthLabel: "jun 26", totalHours: 72, paidHours: 72, remainingHours: 0, hourlyRate: 111111, amount: 7999992, balance: 0 },
  { project: "Milpa", monthLabel: "jun 26", totalHours: 18.5, paidHours: 18.5, remainingHours: 0, hourlyRate: 103749, amount: 1919357, balance: 0 },
  { project: "BU", monthLabel: "may 26", totalHours: 38.5, paidHours: 38.5, remainingHours: 0, hourlyRate: 111111, amount: 4277774, balance: 0 },
  { project: "Dinissan", monthLabel: "may 26", totalHours: 10, paidHours: 10, remainingHours: 0, hourlyRate: 103574, amount: 1035740, balance: 0 },
  { project: "Expreso Viajes", monthLabel: "may 26", totalHours: 1.5, paidHours: 1.5, remainingHours: 0, hourlyRate: 105930, amount: 158895, balance: 0 },
  { project: "Merpes", monthLabel: "may 26", totalHours: 9, paidHours: 9, remainingHours: 0, hourlyRate: 93177, amount: 838593, balance: 0 },
  { project: "BU", monthLabel: "abr 26", totalHours: 35.5, paidHours: 35.5, remainingHours: 0, hourlyRate: 111111, amount: 3944441, balance: 0 },
  { project: "Milpa", monthLabel: "abr 26", totalHours: 3.5, paidHours: 3.5, remainingHours: 0, hourlyRate: 103749, amount: 363122, balance: 0 },
  { project: "Expreso Viajes", monthLabel: "abr 26", totalHours: 35, paidHours: 35, remainingHours: 0, hourlyRate: 105930, amount: 3707550, balance: 0 },
  { project: "Dinissan", monthLabel: "abr 26", totalHours: 58, paidHours: 58, remainingHours: 0, hourlyRate: 103574, amount: 6007292, balance: 0 },
  { project: "Merpes", monthLabel: "abr 26", totalHours: 2.5, paidHours: 2.5, remainingHours: 0, hourlyRate: 93177, amount: 232943, balance: 0 },
  { project: "BU", monthLabel: "mar 26", totalHours: 78.5, paidHours: 78.5, remainingHours: 0, hourlyRate: 111111, amount: 8722214, balance: 0 },
  { project: "Milpa", monthLabel: "mar 26", totalHours: 2.5, paidHours: 2.5, remainingHours: 0, hourlyRate: 103749, amount: 259373, balance: 0 },
  { project: "Expreso Viajes", monthLabel: "mar 26", totalHours: 50, paidHours: 50, remainingHours: 0, hourlyRate: 105930, amount: 5296500, balance: 0 },
  { project: "BU", monthLabel: "feb 26", totalHours: 122, paidHours: 122, remainingHours: 0, hourlyRate: 111111, amount: 13555542, balance: 0 },
  { project: "Merpes", monthLabel: "feb 26", totalHours: 42, paidHours: 42, remainingHours: 0, hourlyRate: 93177, amount: 3913434, balance: 0 },
  { project: "Dinissan", monthLabel: "feb 26", totalHours: 30, paidHours: 30, remainingHours: 0, hourlyRate: 103574, amount: 3107220, balance: 0 },
  { project: "BU", monthLabel: "ene 26", totalHours: 47.5, paidHours: 47.5, remainingHours: 0, hourlyRate: 111111, amount: 5277773, balance: 0 },
  { project: "Merpes", monthLabel: "ene 26", totalHours: 27, paidHours: 27, remainingHours: 0, hourlyRate: 93177, amount: 2515779, balance: 0 },
  { project: "Milpa", monthLabel: "ene 26", totalHours: 4, paidHours: 4, remainingHours: 0, hourlyRate: 103749, amount: 414996, balance: 0 },
  { project: "Pristine", monthLabel: "ene 26", totalHours: 2, paidHours: 2, remainingHours: 0, hourlyRate: 175104, amount: 350208, balance: 0 },
  { project: "BU", monthLabel: "dic 25", totalHours: 74.6, paidHours: 74.6, remainingHours: 0, hourlyRate: 105930, amount: 7902378, balance: 0 },
  { project: "Merpes", monthLabel: "dic 25", totalHours: 19.1, paidHours: 19.1, remainingHours: 0, hourlyRate: 93177, amount: 1779681, balance: 0 },
  { project: "Milpa", monthLabel: "dic 25", totalHours: 4, paidHours: 4, remainingHours: 0, hourlyRate: 94318, amount: 377272, balance: 0 },
  { project: "BU", monthLabel: "nov 25", totalHours: 94.2, paidHours: 94.2, remainingHours: 0, hourlyRate: 105930, amount: 9978606, balance: 0 },
  { project: "Pristine", monthLabel: "nov 25", totalHours: 0.4, paidHours: 0.4, remainingHours: 0, hourlyRate: 175104, amount: 70042, balance: 0 },
  { project: "Milpa", monthLabel: "nov 25", totalHours: 6.5, paidHours: 6.5, remainingHours: 0, hourlyRate: 98173, amount: 638125, balance: 0 },
  { project: "Merpes", monthLabel: "nov 25", totalHours: 7, paidHours: 7, remainingHours: 0, hourlyRate: 93177, amount: 652239, balance: 0 },
  { project: "BU", monthLabel: "oct 25", totalHours: 130.5, paidHours: 130.5, remainingHours: 0, hourlyRate: 105930, amount: 13823865, balance: 0 },
  { project: "Dinissan", monthLabel: "oct 25", totalHours: 30, paidHours: 30, remainingHours: 0, hourlyRate: 94158, amount: 2824740, balance: 0 },
  { project: "BU", monthLabel: "sept 25", totalHours: 97.5, paidHours: 97.5, remainingHours: 0, hourlyRate: 105930, amount: 10328175, balance: 0 },
  { project: "Milpa", monthLabel: "sept 25", totalHours: 0.5, paidHours: 0.5, remainingHours: 0, hourlyRate: 98173, amount: 49087, balance: 0 },
  { project: "Merpes", monthLabel: "sept 25", totalHours: 12, paidHours: 12, remainingHours: 0, hourlyRate: 93177, amount: 1118124, balance: 0 },
  { project: "BU", monthLabel: "ago 25", totalHours: 63.5, paidHours: 63.5, remainingHours: 0, hourlyRate: 105930, amount: 6726555, balance: 0 },
  { project: "Merpes", monthLabel: "ago 25", totalHours: 47.6, paidHours: 47.6, remainingHours: 0, hourlyRate: 93177, amount: 4435225, balance: 0 },
  { project: "BU", monthLabel: "jul 25", totalHours: 172, paidHours: 172, remainingHours: 0, hourlyRate: 105930, amount: 18219960, balance: 0 },
  { project: "Merpes", monthLabel: "jul 25", totalHours: 30.1, paidHours: 30.1, remainingHours: 0, hourlyRate: 93177, amount: 2804628, balance: 0 },
  { project: "BU", monthLabel: "jun 25", totalHours: 32, paidHours: 32, remainingHours: 0, hourlyRate: 105930, amount: 3389760, balance: 0 },
  { project: "Milpa", monthLabel: "jun 25", totalHours: 13.1, paidHours: 13.1, remainingHours: 0, hourlyRate: 98173, amount: 1286066, balance: 0 },
  { project: "Merpes", monthLabel: "jun 25", totalHours: 67.8, paidHours: 67.8, remainingHours: 0, hourlyRate: 93177, amount: 6317401, balance: 0 },
  { project: "BU", monthLabel: "may 25", totalHours: 116, paidHours: 116, remainingHours: 0, hourlyRate: 105930, amount: 12287880, balance: 0 },
  { project: "Milpa", monthLabel: "may 25", totalHours: 3.5, paidHours: 3.5, remainingHours: 0, hourlyRate: 98173, amount: 343606, balance: 0 },
  { project: "Milpa", monthLabel: "may 25", totalHours: 1, paidHours: 1, remainingHours: 0, hourlyRate: 85901, amount: 85901, balance: 0 },
  { project: "Merpes", monthLabel: "may 25", totalHours: 58.5, paidHours: 58.5, remainingHours: 0, hourlyRate: 93177, amount: 5450855, balance: 0 },
  { project: "BU", monthLabel: "abr 25", totalHours: 16.5, paidHours: 16.5, remainingHours: 0, hourlyRate: 105930, amount: 1747845, balance: 0 },
  { project: "Milpa", monthLabel: "abr 25", totalHours: 37.5, paidHours: 37.5, remainingHours: 0, hourlyRate: 98173, amount: 3681488, balance: 0 },
  { project: "Merpes", monthLabel: "abr 25", totalHours: 85.5, paidHours: 85.5, remainingHours: 0, hourlyRate: 93177, amount: 7966634, balance: 0 },
  { project: "BU", monthLabel: "mar 25", totalHours: 55, paidHours: 55, remainingHours: 0, hourlyRate: 105930, amount: 5826150, balance: 0 },
  { project: "Milpa", monthLabel: "mar 25", totalHours: 39, paidHours: 39, remainingHours: 0, hourlyRate: 98173, amount: 3828747, balance: 0 },
  { project: "BU", monthLabel: "feb 25", totalHours: 39, paidHours: 39, remainingHours: 0, hourlyRate: 105930, amount: 4131270, balance: 0 },
  { project: "Milpa", monthLabel: "feb 25", totalHours: 4, paidHours: 4, remainingHours: 0, hourlyRate: 98173, amount: 392692, balance: 0 },
  { project: "Merpes", monthLabel: "feb 25", totalHours: 6.5, paidHours: 6.5, remainingHours: 0, hourlyRate: 93177, amount: 605651, balance: 0 },
  { project: "BU", monthLabel: "ene 25", totalHours: 20.5, paidHours: 20.5, remainingHours: 0, hourlyRate: 105930, amount: 2171565, balance: 0 },
  { project: "Merpes", monthLabel: "ene 25", totalHours: 6.5, paidHours: 6.5, remainingHours: 0, hourlyRate: 85069, amount: 552949, balance: 0 },
  { project: "Milpa", monthLabel: "ene 25", totalHours: 9.8, paidHours: 9.8, remainingHours: 0, hourlyRate: 89656, amount: 878629, balance: 0 },
  { project: "Pristine", monthLabel: "ene 25", totalHours: 9.5, paidHours: 9.5, remainingHours: 0, hourlyRate: 76000, amount: 722000, balance: 0 },
  { project: "BU", monthLabel: "dic 24", totalHours: 29, paidHours: 29, remainingHours: 0, hourlyRate: 99000, amount: 2871000, balance: 0 },
  { project: "Merpes", monthLabel: "dic 24", totalHours: 20, paidHours: 20, remainingHours: 0, hourlyRate: 85069, amount: 1701380, balance: 0 },
  { project: "BU", monthLabel: "nov 24", totalHours: 69.5, paidHours: 69.5, remainingHours: 0, hourlyRate: 99000, amount: 6880500, balance: 0 },
  { project: "Expreso Viajes", monthLabel: "nov 24", totalHours: 0.9, paidHours: 0.9, remainingHours: 0, hourlyRate: 99000, amount: 89100, balance: 0 },
  { project: "Merpes", monthLabel: "nov 24", totalHours: 30, paidHours: 30, remainingHours: 0, hourlyRate: 85069, amount: 2552070, balance: 0 },
  { project: "Pristine", monthLabel: "nov 24", totalHours: 2, paidHours: 2, remainingHours: 0, hourlyRate: 76000, amount: 152000, balance: 0 },
  { project: "BU", monthLabel: "oct 24", totalHours: 125.7, paidHours: 125.7, remainingHours: 0, hourlyRate: 99000, amount: 12444300, balance: 0 },
  { project: "Expreso Viajes", monthLabel: "oct 24", totalHours: 0.8, paidHours: 0.8, remainingHours: 0, hourlyRate: 99000, amount: 79200, balance: 0 },
  { project: "Milpa", monthLabel: "oct 24", totalHours: 3, paidHours: 3, remainingHours: 0, hourlyRate: 89656, amount: 268968, balance: 0 },
  { project: "Merpes", monthLabel: "oct 24", totalHours: 11, paidHours: 11, remainingHours: 0, hourlyRate: 85069, amount: 935759, balance: 0 },
  { project: "Pristine", monthLabel: "sept 24", totalHours: 0.9, paidHours: 0.9, remainingHours: 0, hourlyRate: 76000, amount: 68400, balance: 0 },
  { project: "Milpa", monthLabel: "sept 24", totalHours: 0.8, paidHours: 0.8, remainingHours: 0, hourlyRate: 56430, amount: 45144, balance: 0 },
  { project: "BU", monthLabel: "sept 24", totalHours: 70.8, paidHours: 70.8, remainingHours: 0, hourlyRate: 99000, amount: 7009200, balance: 0 },
  { project: "BU", monthLabel: "ago 24", totalHours: 104.1, paidHours: 104.1, remainingHours: 0, hourlyRate: 99000, amount: 10305900, balance: 0 },
  { project: "Merpes", monthLabel: "ago 24", totalHours: 19.2, paidHours: 19.2, remainingHours: 0, hourlyRate: 85069, amount: 1633325, balance: 0 },
  { project: "BU", monthLabel: "jul 24", totalHours: 96.3, paidHours: 96.3, remainingHours: 0, hourlyRate: 99000, amount: 9533700, balance: 0 },
  { project: "Pristine App", monthLabel: "jun 24", totalHours: 147, paidHours: 80.85, remainingHours: 66.15, hourlyRate: 143896, amount: 21152744, balance: 9518735 },
];

export const billingSeedBalanceSnapshots: BillingSeedBalanceSnapshot[] = [
  { project: "BU", monthLabel: "jul 26", balance: 9055547 },
  { project: "Dinissan", monthLabel: "jul 26", balance: 1450036 },
  { project: "Expreso Viajes", monthLabel: "jul 26", balance: 529650 },
  { project: "Milpa", monthLabel: "jul 26", balance: 259373 },
  { project: "Pristine App", monthLabel: "jun 24", balance: 9518735 },
];

export const BILLING_SEED_VERSION = "2026-08-04-v3";
