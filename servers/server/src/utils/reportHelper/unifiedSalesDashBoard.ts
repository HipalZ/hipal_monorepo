// utils/reportHelper/unifiedSalesDashboard.ts
import type { Document } from "mongoose";

export type PaymentDoc = Document & {
  mode: string; // "cash" | "online" | "npc" | "complementary" | "dues" | "split" | ...
  paymentMode?: string;
  settleType?: string | null; // "DUES_SETTLE" | undefined
  splitModes?: { name: string; amount: number }[];
  paxCount?: number;
  billValue?: number;
  tax?: number;
  serviceCharge?: number;
  tips?: number;
  discount?: number;
  claimedCoins?: number;
  couponDiscount?: number;
  billInvoice?: number;
  earnCoins?: number;
  total?: number;
};

export type SegmentDiscount = {
  manual: number; // payment.discount
  coinsUsed: number; // payment.claimedCoins
  coupon: number; // payment.couponDiscount
  npcAsDiscount: number; // NPC bucket
  compAsDiscount: number; // Complementary bucket
  total: number; // sum of all above
};

export type SegmentRewards = {
  coinsGiven: number; // earnCoins
};

export type SegmentCharges = {
  tax: number;
  serviceCharge: number;
  tip: number;
};

export type SegmentTotals = {
  ordersCount: number;
  paxCount: number;
  grossSubtotal: number; // sum of billValue
  realisedRevenue: number; // like old overAllAmount (no dues/npc/comp, excl tips)
  netAfterDiscountBeforeCharges: number; // grossSubtotal - discounts.total
  netAfterDiscountAndCharges: number; // above + tax + svc + tip
};

export type PaymentModeBreakdown = Record<string, number>;

export type SegmentAggregate = {
  discounts: SegmentDiscount;
  rewards: SegmentRewards;
  charges: SegmentCharges;
  totals: SegmentTotals;
  paymentModes: PaymentModeBreakdown;
};

export type UnifiedDashboardCore = {
  invoiceRange: { start: number; end: number };

  // Segments
  paidAll: SegmentAggregate; // paidNormal + duesSettlements (realised revenue)
  paidNormal: SegmentAggregate; // mode !== dues && settleType !== DUES_SETTLE
  duesSettlements: SegmentAggregate; // settleType === DUES_SETTLE
  duesPending: SegmentAggregate; // mode === dues && settleType !== DUES_SETTLE

  discountSummary: {
    onPaid: SegmentDiscount; // discounts on paidAll
    onDues: SegmentDiscount; // discounts on duesPending
    all: SegmentDiscount; // combined
  };

  rewardsSummary: {
    onPaid: SegmentRewards;
    onDues: SegmentRewards;
    all: SegmentRewards;
  };

  duesSummary: {
    duesGiven: number; // total dues given (total field)
    duesGetBack: number; // total recovered (DUES_SETTLE totals)
    duesOutstanding: number; // duesGiven - duesGetBack
    ordersPending: number; // count duesPending
  };

  taxesSummary: {
    onPaid: SegmentCharges;
    onDues: SegmentCharges;
    all: SegmentCharges;
  };
};

// ---------- BASE CONSTANTS ----------

const ZERO_DISCOUNT: SegmentDiscount = {
  manual: 0,
  coinsUsed: 0,
  coupon: 0,
  npcAsDiscount: 0,
  compAsDiscount: 0,
  total: 0,
};

const ZERO_REWARDS: SegmentRewards = {
  coinsGiven: 0,
};

const ZERO_CHARGES: SegmentCharges = {
  tax: 0,
  serviceCharge: 0,
  tip: 0,
};

const ZERO_TOTALS: SegmentTotals = {
  ordersCount: 0,
  paxCount: 0,
  grossSubtotal: 0,
  realisedRevenue: 0,
  netAfterDiscountBeforeCharges: 0,
  netAfterDiscountAndCharges: 0,
};

// ---------- SMALL HELPERS ----------

function addDiscount(a: SegmentDiscount, b: SegmentDiscount): SegmentDiscount {
  const result: SegmentDiscount = {
    manual: a.manual + b.manual,
    coinsUsed: a.coinsUsed + b.coinsUsed,
    coupon: a.coupon + b.coupon,
    npcAsDiscount: a.npcAsDiscount + b.npcAsDiscount,
    compAsDiscount: a.compAsDiscount + b.compAsDiscount,
    total: 0,
  };
  result.total =
    result.manual +
    result.coinsUsed +
    result.coupon +
    result.npcAsDiscount +
    result.compAsDiscount;
  return result;
}

function addRewards(a: SegmentRewards, b: SegmentRewards): SegmentRewards {
  return {
    coinsGiven: a.coinsGiven + b.coinsGiven,
  };
}

function addCharges(a: SegmentCharges, b: SegmentCharges): SegmentCharges {
  return {
    tax: a.tax + b.tax,
    serviceCharge: a.serviceCharge + b.serviceCharge,
    tip: a.tip + b.tip,
  };
}

function getTotal(p: PaymentDoc): number {
  const anyDoc = p as any;
  if (typeof anyDoc.get === "function") {
    const val = anyDoc.get("total");
    if (typeof val === "number") return val;
  }
  return typeof p.total === "number" ? p.total : 0;
}

/**
 * overAllAmount-style revenue:
 * - Excludes dues, npc, complementary
 * - For split bills: excludes split parts that are dues/npc/complementary
 * - Excludes tips (tips stay in charges.tip)
 */
function calcRealisedRevenueForPayment(p: PaymentDoc): number {
  const mode = p.mode;
  const splitModes = p.splitModes ?? [];

  if (mode === "dues" || mode === "npc" || mode === "complementary") {
    return 0;
  }

  if (mode === "split" && Array.isArray(splitModes)) {
    let sum = 0;
    for (const split of splitModes) {
      const name = split.name;
      const amt = split.amount ?? 0;
      if (
        !name ||
        name === "dues" ||
        name === "npc" ||
        name === "complementary"
      ) {
        continue;
      }
      sum += amt;
    }
    return sum;
  }

  return getTotal(p);
}

/**
 * Payment mode breakdown (cash/card/upi/online/...) from a segment.
 * Excludes dues/npc/complementary channels.
 */
function buildPaymentModeBreakdown(
  payments: PaymentDoc[],
): PaymentModeBreakdown {
  const result: PaymentModeBreakdown = {};

  for (const p of payments) {
    const mode = p.mode;
    const splitModes = p.splitModes ?? [];

    if (mode === "split" && Array.isArray(splitModes)) {
      for (const split of splitModes) {
        const name = split.name;
        const amt = split.amount ?? 0;
        if (
          !name ||
          name === "dues" ||
          name === "npc" ||
          name === "complementary"
        ) {
          continue;
        }
        result[name] = (result[name] || 0) + amt;
      }
    } else {
      const key = p.paymentMode || mode || "unknown";

      if (
        key === "dues" ||
        key === "npc" ||
        key === "complementary" ||
        mode === "dues"
      ) {
        continue;
      }

      const realised = calcRealisedRevenueForPayment(p);
      result[key] = (result[key] || 0) + realised;
    }
  }

  return result;
}

/**
 * Aggregate one segment (paidNormal, duesSettlements, duesPending, etc.)
 * INTO:
 *   - discounts (manual / coins / coupon / npc / comp)
 *   - rewards (coinsGiven)
 *   - charges (tax / svc / tips)
 *   - totals  (grossSubtotal, realisedRevenue, net after discounts, etc.)
 *   - paymentModes (cash/card/upi/online etc.)
 */
function aggregateSegment(payments: PaymentDoc[]): SegmentAggregate {
  const discounts: SegmentDiscount = { ...ZERO_DISCOUNT };
  const rewards: SegmentRewards = { ...ZERO_REWARDS };
  const charges: SegmentCharges = { ...ZERO_CHARGES };
  const totals: SegmentTotals = { ...ZERO_TOTALS };

  let npcAmount = 0;
  let compAmount = 0;

  for (const p of payments) {
    const billValue = p.billValue ?? 0;
    const pax = p.paxCount ?? 0;
    const tax = p.tax ?? 0;
    const svc = p.serviceCharge ?? 0;
    const tips = p.tips ?? 0;
    const claimedCoins = p.claimedCoins ?? 0;
    const discount = p.discount ?? 0;
    const couponDiscount = p.couponDiscount ?? 0;
    const earnCoins = p.earnCoins ?? 0;

    totals.ordersCount += 1;
    totals.paxCount += pax;
    totals.grossSubtotal += billValue;

    charges.tax += tax;
    charges.serviceCharge += svc;
    charges.tip += tips;

    discounts.manual += discount;
    discounts.coinsUsed += claimedCoins;
    discounts.coupon += couponDiscount;

    rewards.coinsGiven += earnCoins;

    // ---------- NPC & COMPLEMENTARY AS DISCOUNT BUCKETS ----------
    // To avoid double counting:
    // - If whole bill is NPC/Complimentary → use billValue
    // - ELSE (normal bill) → only use splitModes named npc/complementary
    if (p.mode === "npc") {
      npcAmount += billValue;
    } else if (Array.isArray(p.splitModes)) {
      for (const split of p.splitModes) {
        if (split.name === "npc") {
          npcAmount += split.amount ?? 0;
        }
      }
    }

    if (p.mode === "complementary") {
      compAmount += billValue;
    } else if (Array.isArray(p.splitModes)) {
      for (const split of p.splitModes) {
        if (split.name === "complementary") {
          compAmount += split.amount ?? 0;
        }
      }
    }

    // ---------- REALISED REVENUE (like overAllAmount) ----------
    totals.realisedRevenue += calcRealisedRevenueForPayment(p);
  }

  discounts.npcAsDiscount = npcAmount;
  discounts.compAsDiscount = compAmount;
  discounts.total =
    discounts.manual +
    discounts.coinsUsed +
    discounts.coupon +
    discounts.npcAsDiscount +
    discounts.compAsDiscount;

  totals.netAfterDiscountBeforeCharges = totals.grossSubtotal - discounts.total;

  totals.netAfterDiscountAndCharges =
    totals.netAfterDiscountBeforeCharges +
    charges.tax +
    charges.serviceCharge +
    charges.tip;

  const paymentModes = buildPaymentModeBreakdown(payments);

  return {
    discounts,
    rewards,
    charges,
    totals,
    paymentModes,
  };
}

// ---------- MAIN UNIFIED CORE ----------

export function buildUnifiedDashboardCore(
  payments: PaymentDoc[],
): UnifiedDashboardCore {
  const sorted = [...payments].sort(
    (a, b) => (a.billInvoice ?? 0) - (b.billInvoice ?? 0),
  );

  const startInvoice = sorted[0]?.billInvoice ?? 0;
  const endInvoice = sorted[sorted.length - 1]?.billInvoice ?? 0;

  // 1) Segment the data clearly
  const paidNormal = payments.filter(
    (p) => p.mode !== "dues" && p.settleType !== "DUES_SETTLE",
  );

  const duesSettlements = payments.filter(
    (p) => p.settleType === "DUES_SETTLE",
  );

  const duesPending = payments.filter(
    (p) => p.mode === "dues" && p.settleType !== "DUES_SETTLE",
  );

  const paidAll = [...paidNormal, ...duesSettlements];

  // 2) Aggregate each segment
  const aggPaidNormal = aggregateSegment(paidNormal);
  const aggDuesSettlements = aggregateSegment(duesSettlements);
  const aggDuesPending = aggregateSegment(duesPending);
  const aggPaidAll = aggregateSegment(paidAll);

  // 3) Discount summary (Paid vs Dues vs All)
  const discountPaid = { ...aggPaidAll.discounts };
  const discountDues = { ...aggDuesPending.discounts };
  const discountAll = addDiscount(discountPaid, discountDues);

  // 4) Rewards summary
  const rewardsPaid = { ...aggPaidAll.rewards };
  const rewardsDues = { ...aggDuesPending.rewards };
  const rewardsAll = addRewards(rewardsPaid, rewardsDues);

  // 5) Taxes summary
  const chargesPaid = { ...aggPaidAll.charges };
  const chargesDues = addCharges(
    aggDuesSettlements.charges,
    aggDuesPending.charges,
  );
  const chargesAll = addCharges(chargesPaid, chargesDues);

  // 6) Dues summary (total given / recovered / outstanding)
  const duesGiven = duesPending.reduce((sum, p) => sum + getTotal(p), 0);
  const duesGetBack = duesSettlements.reduce((sum, p) => sum + getTotal(p), 0);
  const duesOutstanding = duesGiven - duesGetBack;

  return {
    invoiceRange: { start: startInvoice, end: endInvoice },
    paidAll: aggPaidAll,
    paidNormal: aggPaidNormal,
    duesSettlements: aggDuesSettlements,
    duesPending: aggDuesPending,
    discountSummary: {
      onPaid: discountPaid,
      onDues: discountDues,
      all: discountAll,
    },
    rewardsSummary: {
      onPaid: rewardsPaid,
      onDues: rewardsDues,
      all: rewardsAll,
    },
    duesSummary: {
      duesGiven,
      duesGetBack,
      duesOutstanding,
      ordersPending: aggDuesPending.totals.ordersCount,
    },
    taxesSummary: {
      onPaid: chargesPaid,
      onDues: chargesDues,
      all: chargesAll,
    },
  };
}
