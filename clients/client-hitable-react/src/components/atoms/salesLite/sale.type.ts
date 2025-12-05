// types/paymentUnifiedTypes.ts
export type SegmentDiscount = {
  manual: number;
  coinsUsed: number;
  coupon: number;
  npcAsDiscount: number;
  compAsDiscount: number;
  total: number;
};

export type SegmentRewards = {
  coinsGiven: number;
};

export type SegmentCharges = {
  tax: number;
  serviceCharge: number;
  tip: number;
};

export type SegmentTotals = {
  ordersCount: number;
  paxCount: number;
  grossSubtotal: number;
  realisedRevenue: number;
  netAfterDiscountBeforeCharges: number;
  netAfterDiscountAndCharges: number;
};

export type PaymentModeBreakdown = Record<string, number>;

export type SegmentAggregate = {
  discounts: SegmentDiscount;
  rewards: SegmentRewards;
  charges: SegmentCharges;
  totals: SegmentTotals;
  roundOff: {
    type: string;
    value: number;
  };
  paymentModes: PaymentModeBreakdown;
};

export type UnifiedDashboardCore = {
  invoiceRange: { start: number; end: number };

  paidAll: SegmentAggregate;
  paidNormal: SegmentAggregate;
  duesSettlements: SegmentAggregate;
  duesPending: SegmentAggregate;

  discountSummary: {
    onPaid: SegmentDiscount;
    onDues: SegmentDiscount;
    all: SegmentDiscount;
  };

  rewardsSummary: {
    onPaid: SegmentRewards;
    onDues: SegmentRewards;
    all: SegmentRewards;
  };

  duesSummary: {
    duesGiven: number;
    duesGetBack: number;
    duesOutstanding: number;
    ordersPending: number;
  };

  taxesSummary: {
    onPaid: SegmentCharges;
    onDues: SegmentCharges;
    all: SegmentCharges;
  };

  runningTables: {
    totalActiveTableValue: number;
    tables: {
      id: string;
      name: string;
      amount: number;
    }[];
  };
};
