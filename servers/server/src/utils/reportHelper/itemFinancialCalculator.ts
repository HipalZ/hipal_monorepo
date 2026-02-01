/**
 * Canonical Billing & Reporting Calculator
 *
 * Single source of truth for all item-level and bill-level financial math.
 * No report is allowed to do its own math outside this module.
 *
 * Rules:
 * - Gross item value = (portion.price ?? dish.price + Σ(extra.price×qty)) × quantity (NO discount, NO tax)
 * - Bill discount = payment.discount + claimedCoins + couponDiscount; complementary/NPC => billValue
 * - Proportional discount: itemDiscount = (grossItemValue / totalGross) × billDiscount; Σ(itemDiscount) === billDiscount
 * - Net item value = grossItemValue - itemDiscount
 * - GST = netItemValue × gst% / 100 (AFTER discount)
 * - Service charge allocated: (netItemValue / totalNet) × payment.serviceCharge
 * - Final item total = netItemValue + itemGST + itemServiceCharge
 * - Σ(finalItemTotal) ≈ payment.total (± round-off)
 */

const ROUND = (x: number): number => Number(x.toFixed(2));

// ----- Minimal shapes (structural typing; compatible with itemType.ts) -----

export interface DishLike {
  _id: string | { toString(): string };
  name?: string;
  price?: number;
  gst?: number;
  categoryIds?: string[];
  dishTypes?: string[];
}

export interface PortionLike {
  _id?: string | { toString(): string };
  name?: string;
  price?: number;
}

export interface ExtraLike {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
}

export interface BillItemLike {
  dish: DishLike;
  portion?: PortionLike | null;
  extras?: ExtraLike[];
  quantity: number;
  discount?: number;
}

export interface PaymentLike {
  billValue?: number;
  discount?: number;
  claimedCoins?: number;
  couponDiscount?: number;
  serviceCharge?: number;
  total?: number;
  mode?: string;
  splitModes?: Array<{ name?: string; amount?: number }>;
}

export interface ItemBreakdown {
  grossItemValue: number;
  itemDiscount: number;
  netItemValue: number;
  /** GST only (per-dish rate: 0%, 5%, 18%, etc.) */
  itemGST: number;
  /** Allocated service charge */
  itemServiceCharge: number;
  /** All taxes: GST + service charge (for "Total Tax" in reports) */
  totalTax: number;
  finalItemTotal: number;
  quantity: number;
  gstRate: number;
}

export interface PaymentItemTotalsResult {
  items: ItemBreakdown[];
  sumFinalItemTotal: number;
  paymentTotal: number;
  /** Absolute diff |sumFinalItemTotal - paymentTotal| */
  reconciliationDiff: number;
  /** True if diff is within round-off tolerance (e.g. 0.01 per item or 1.00 total) */
  reconciled: boolean;
}

const TOLERANCE = 1.01; // allow up to 1.01 total diff for round-off

// ---------------------------------------------------------------------------
// 1. Gross Item Value (NO discount, NO tax)
// ---------------------------------------------------------------------------

/**
 * grossItemValue =
 *   (portion.price ?? dish.price + Σ(extra.price × extra.quantity)) × quantity
 */
export function calculateGrossItem(item: BillItemLike): number {
  const dish = item.dish;
  const portion = item.portion;
  const extras = item.extras ?? [];
  const quantity = Math.max(0, Number(item.quantity) || 0);

  const unitPrice =
    portion != null && typeof portion.price === "number"
      ? portion.price
      : (dish?.price ?? 0);

  const extrasTotal = extras.reduce(
    (sum, e) => sum + (Number(e.price) || 0) * (Math.max(0, Number(e.quantity)) || 1),
    0,
  );

  return ROUND((unitPrice + extrasTotal) * quantity);
}

/**
 * Sum of gross item values for all items (used for proportional discount).
 */
export function calculateTotalGross(items: BillItemLike[]): number {
  return items.reduce((sum, it) => sum + calculateGrossItem(it), 0);
}

// ---------------------------------------------------------------------------
// 2. Bill-Level Discount (single source of truth)
// ---------------------------------------------------------------------------

/**
 * billDiscount = payment.discount + payment.claimedCoins + payment.couponDiscount
 * If complementary or NPC (mode or splitModes): billDiscount = payment.billValue
 */
export function resolveBillDiscount(payment: PaymentLike): number {
  const mode = (payment.mode ?? "").toLowerCase();
  const splitModes = payment.splitModes ?? [];

  const isComplementary =
    mode === "complementary" ||
    splitModes.some(
      (s) => (s?.name ?? "").toLowerCase() === "complementary",
    );
  const isNpc =
    mode === "npc" ||
    splitModes.some((s) => (s?.name ?? "").toLowerCase() === "npc");

  if (isComplementary || isNpc) {
    return Number(payment.billValue) || 0;
  }

  const discount = Number(payment.discount) || 0;
  const claimedCoins = Number(payment.claimedCoins) || 0;
  const couponDiscount = Number(payment.couponDiscount) || 0;
  return ROUND(discount + claimedCoins + couponDiscount);
}

// ---------------------------------------------------------------------------
// 3. Proportional Discount Allocation
// ---------------------------------------------------------------------------

/**
 * itemDiscount = (grossItemValue / totalGross) × billDiscount
 * Returns array of allocated discounts (one per item). Sum === billDiscount.
 */
export function allocateDiscount(
  items: BillItemLike[],
  billDiscount: number,
): number[] {
  if (billDiscount <= 0) {
    return items.map(() => 0);
  }

  const totalGross = calculateTotalGross(items);
  if (totalGross <= 0) {
    return items.map(() => 0);
  }

  const ratios = items.map((it) => calculateGrossItem(it) / totalGross);
  const rawAllocations = ratios.map((r) => r * billDiscount);
  // Enforce sum === billDiscount by adjusting last element for rounding
  const sumRaw = rawAllocations.reduce((s, a) => s + a, 0);
  const diff = ROUND(billDiscount - sumRaw);
  const allocated = rawAllocations.map((a) => ROUND(a));
  if (allocated.length > 0 && Math.abs(diff) > 0.001) {
    allocated[allocated.length - 1] = ROUND(
      allocated[allocated.length - 1] + diff,
    );
  }
  return allocated;
}

// ---------------------------------------------------------------------------
// 4. Net Item Value (pre-tax)
// ---------------------------------------------------------------------------

export function calculateNetItem(
  item: BillItemLike,
  allocatedDiscount: number,
): number {
  const gross = calculateGrossItem(item);
  return ROUND(Math.max(0, gross - allocatedDiscount));
}

// ---------------------------------------------------------------------------
// 5. GST (AFTER discount)
// ---------------------------------------------------------------------------

export function calculateGST(netItemValue: number, gstRatePercent: number): number {
  const rate = Number(gstRatePercent) || 0;
  return ROUND((netItemValue * rate) / 100);
}

// ---------------------------------------------------------------------------
// 6. Service Charge Allocation
// ---------------------------------------------------------------------------

/**
 * itemServiceCharge = (netItemValue / totalNet) × payment.serviceCharge
 * netItemValues: array of net item values (same order as items).
 */
export function allocateServiceCharge(
  netItemValues: number[],
  totalServiceCharge: number,
): number[] {
  if (totalServiceCharge <= 0) {
    return netItemValues.map(() => 0);
  }

  const totalNet = netItemValues.reduce((s, n) => s + n, 0);
  if (totalNet <= 0) {
    return netItemValues.map(() => 0);
  }

  const ratios = netItemValues.map((n) => n / totalNet);
  const raw = ratios.map((r) => r * totalServiceCharge);
  const allocated = raw.map((a) => ROUND(a));
  const sumAlloc = allocated.reduce((s, a) => s + a, 0);
  const diff = ROUND(totalServiceCharge - sumAlloc);
  if (allocated.length > 0 && Math.abs(diff) > 0.001) {
    allocated[allocated.length - 1] = ROUND(allocated[allocated.length - 1] + diff);
  }
  return allocated;
}

// ---------------------------------------------------------------------------
// 7. Final Item Totals (full breakdown per item + reconciliation)
// ---------------------------------------------------------------------------

/**
 * For each item: gross, allocated discount, net, GST, service charge, final.
 * Guarantees Σ(finalItemTotal) ≈ payment.total (± round-off).
 */
export function calculateFinalItemTotals(
  items: BillItemLike[],
  payment: PaymentLike,
): PaymentItemTotalsResult {
  const paymentTotal = Number(payment.total) || 0;
  const serviceCharge = Number(payment.serviceCharge) || 0;
  const billDiscount = resolveBillDiscount(payment);

  const grosses = items.map((it) => calculateGrossItem(it));
  const discounts = allocateDiscount(items, billDiscount);
  const nets = items.map((it, i) => calculateNetItem(it, discounts[i]));

  const gstRates = items.map(
    (it) => Number(it.dish?.gst) || 0,
  );
  const gsts = nets.map((n, i) => calculateGST(n, gstRates[i]));

  const serviceCharges = allocateServiceCharge(nets, serviceCharge);

  const breakdowns: ItemBreakdown[] = items.map((it, i) => {
    const finalItemTotal = ROUND(
      nets[i] + gsts[i] + serviceCharges[i],
    );
    const totalTax = ROUND(gsts[i] + serviceCharges[i]);
    return {
      grossItemValue: grosses[i],
      itemDiscount: discounts[i],
      netItemValue: nets[i],
      itemGST: gsts[i],
      itemServiceCharge: serviceCharges[i],
      totalTax,
      finalItemTotal,
      quantity: Math.max(0, Number(it.quantity) || 0),
      gstRate: gstRates[i],
    };
  });

  const sumFinalItemTotal = ROUND(
    breakdowns.reduce((s, b) => s + b.finalItemTotal, 0),
  );
  const reconciliationDiff = Math.abs(sumFinalItemTotal - paymentTotal);
  const reconciled = reconciliationDiff <= TOLERANCE;

  return {
    items: breakdowns,
    sumFinalItemTotal,
    paymentTotal,
    reconciliationDiff,
    reconciled,
  };
}

// ---------------------------------------------------------------------------
// Helpers for reports: filter item-eligible payments (exclude DUES_SETTLE)
// ---------------------------------------------------------------------------

/**
 * Item reports (what was sold): INCLUDE cash/card/upi, dues, complementary, npc.
 * EXCLUDE dues_settle (already counted when the dues payment was created).
 */
export function isItemReportEligiblePayment(payment: PaymentLike): boolean {
  const settleType = (payment as { settleType?: string }).settleType;
  return settleType !== "DUES_SETTLE";
}

/**
 * Filter payments for item-based reports: has billItems and not DUES_SETTLE.
 */
export function filterPaymentsForItemReports<T extends PaymentLike & { billItems?: unknown[] }>(
  payments: T[],
): T[] {
  return payments.filter(
    (p) =>
      Array.isArray(p.billItems) &&
      p.billItems.length > 0 &&
      isItemReportEligiblePayment(p),
  );
}
