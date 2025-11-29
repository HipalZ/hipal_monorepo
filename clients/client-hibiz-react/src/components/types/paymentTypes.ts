export interface SalesData {
  overAllAmount: number;
  onlineSale: Record<string, number>;
  offlineSale: Record<string, number>;
  totalOrders: number;
  totalActiveTableValue: number;
  subTotal: number;
  startInvoiceNumber: number;
  endInvoiceNumber: number;
  totalPaxCount: number;
}

export interface OtherAndWarningData {
  otherSale: {
    totalTax: number;
    totalTip: number;
    totalServiceCharge: number;
  };
  warningSale: {
    totalForceSettle: number;
    totalFreeSettle: number;
  };
}

export interface SalesExceptionData {
  exceptionSale: {
    totalDuesReceived: number;
    totalDuesGiven: number;
    totalNpc: number;
    totalComplementary: number;
    totalDiscount: number;
  };
  rewardSale: {
    totalCoinsGiven: number;
    totalCoinUsed: number;
    totalCouponUsed: number;
    totalCouponDiscount: number;
    totalCoinsUsed: number;
  };
}

export interface TableData {
  active: string;
  businessId: string;
  createdAt: string;
  currentTableAmount: number;
  capacity?: number;
  displayForCaptains: boolean;
  isDeleted: boolean;
  name: string;
  rank: string;
  staffIds: string[];
  isTransfer?: boolean;
  status: string;
  tableId: string;
  updatedAt: string;
  tableItemCount: number;
  userIds: string[];
  zoneId: string;
  hiCode?: string;
  _id: string;
}

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
