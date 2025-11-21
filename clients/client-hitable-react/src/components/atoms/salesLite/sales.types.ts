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
