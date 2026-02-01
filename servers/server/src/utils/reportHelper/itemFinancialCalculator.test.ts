/**
 * Unit tests for canonical itemFinancialCalculator.
 * Run with: bun test itemFinancialCalculator.test.ts
 */

import { describe, expect, test } from "bun:test";
import {
  calculateGrossItem,
  calculateTotalGross,
  resolveBillDiscount,
  allocateDiscount,
  calculateNetItem,
  calculateGST,
  allocateServiceCharge,
  calculateFinalItemTotals,
  isItemReportEligiblePayment,
  filterPaymentsForItemReports,
  type BillItemLike,
  type PaymentLike,
} from "./itemFinancialCalculator";

describe("calculateGrossItem", () => {
  test("portion + base price", () => {
    const item: BillItemLike = {
      dish: { _id: "d1", price: 100, gst: 5 },
      portion: { _id: "p1", price: 120 },
      extras: [],
      quantity: 2,
    };
    expect(calculateGrossItem(item)).toBe(240); // 120 * 2
  });

  test("portion + extras", () => {
    const item: BillItemLike = {
      dish: { _id: "d1", price: 100, gst: 5 },
      portion: { _id: "p1", price: 100 },
      extras: [
        { id: "e1", price: 10, quantity: 1 },
        { id: "e2", price: 5, quantity: 2 },
      ],
      quantity: 1,
    };
    expect(calculateGrossItem(item)).toBe(120); // (100 + 10 + 10) * 1
  });

  test("no portion uses dish price", () => {
    const item: BillItemLike = {
      dish: { _id: "d1", price: 80, gst: 5 },
      portion: null,
      extras: [],
      quantity: 3,
    };
    expect(calculateGrossItem(item)).toBe(240);
  });
});

describe("resolveBillDiscount", () => {
  test("sum of discount + claimedCoins + couponDiscount", () => {
    const payment: PaymentLike = {
      billValue: 500,
      discount: 50,
      claimedCoins: 20,
      couponDiscount: 30,
    };
    expect(resolveBillDiscount(payment)).toBe(100);
  });

  test("complementary => billDiscount = billValue", () => {
    const payment: PaymentLike = {
      billValue: 500,
      discount: 50,
      mode: "complementary",
    };
    expect(resolveBillDiscount(payment)).toBe(500);
  });

  test("npc => billDiscount = billValue", () => {
    const payment: PaymentLike = {
      billValue: 300,
      mode: "npc",
    };
    expect(resolveBillDiscount(payment)).toBe(300);
  });

  test("splitModes with complementary", () => {
    const payment: PaymentLike = {
      billValue: 400,
      mode: "split",
      splitModes: [
        { name: "cash", amount: 200 },
        { name: "complementary", amount: 200 },
      ],
    };
    expect(resolveBillDiscount(payment)).toBe(400);
  });
});

describe("allocateDiscount", () => {
  test("proportional allocation sums to billDiscount", () => {
    const items: BillItemLike[] = [
      {
        dish: { _id: "d1", price: 100, gst: 5 },
        quantity: 1,
      },
      {
        dish: { _id: "d2", price: 100, gst: 5 },
        quantity: 2,
      },
    ];
    const totalGross = calculateTotalGross(items); // 100 + 200 = 300
    const billDiscount = 30;
    const allocated = allocateDiscount(items, billDiscount);
    const sum = allocated.reduce((s, a) => s + a, 0);
    expect(sum).toBe(billDiscount);
    expect(allocated.length).toBe(2);
  });

  test("zero billDiscount => all zeros", () => {
    const items: BillItemLike[] = [
      { dish: { _id: "d1", price: 100, gst: 5 }, quantity: 1 },
    ];
    expect(allocateDiscount(items, 0)).toEqual([0]);
  });
});

describe("calculateGST", () => {
  test("GST after discount", () => {
    expect(calculateGST(100, 5)).toBe(5);
    expect(calculateGST(200, 18)).toBe(36);
  });
});

describe("calculateFinalItemTotals", () => {
  test("sum finalItemTotal ≈ payment.total", () => {
    const items: BillItemLike[] = [
      { dish: { _id: "d1", price: 100, gst: 5 }, quantity: 1 },
      { dish: { _id: "d2", price: 100, gst: 5 }, quantity: 1 },
    ];
    const payment: PaymentLike = {
      billValue: 200,
      discount: 20,
      claimedCoins: 0,
      couponDiscount: 0,
      serviceCharge: 0,
      total: 189, // 200 - 20 + 9 (GST on 180)
    };
    const result = calculateFinalItemTotals(items, payment);
    expect(result.reconciled).toBe(true);
    expect(Math.abs(result.sumFinalItemTotal - result.paymentTotal)).toBeLessThanOrEqual(1.01);
  });

  test("complementary: item net and GST zero", () => {
    const items: BillItemLike[] = [
      { dish: { _id: "d1", price: 100, gst: 5 }, quantity: 1 },
    ];
    const payment: PaymentLike = {
      billValue: 100,
      total: 0,
      mode: "complementary",
    };
    const result = calculateFinalItemTotals(items, payment);
    expect(result.items[0].netItemValue).toBe(0);
    expect(result.items[0].itemGST).toBe(0);
    expect(result.items[0].finalItemTotal).toBe(0);
  });

  test("totalTax = itemGST + itemServiceCharge", () => {
    const items: BillItemLike[] = [
      { dish: { _id: "d1", price: 100, gst: 18 }, quantity: 1 },
      { dish: { _id: "d2", price: 100, gst: 5 }, quantity: 1 },
    ];
    const payment: PaymentLike = {
      billValue: 200,
      discount: 0,
      claimedCoins: 0,
      couponDiscount: 0,
      serviceCharge: 10,
      total: 223, // 200 + 18% on 100 + 5% on 100 + 10 = 200 + 18 + 5 + 10
    };
    const result = calculateFinalItemTotals(items, payment);
    expect(result.items[0].totalTax).toBe(
      result.items[0].itemGST + result.items[0].itemServiceCharge,
    );
    expect(result.items[1].totalTax).toBe(
      result.items[1].itemGST + result.items[1].itemServiceCharge,
    );
  });
});

describe("isItemReportEligiblePayment", () => {
  test("DUES_SETTLE excluded", () => {
    expect(
      isItemReportEligiblePayment({
        settleType: "DUES_SETTLE",
      } as PaymentLike & { settleType?: string }),
    ).toBe(false);
  });

  test("normal payment included", () => {
    expect(
      isItemReportEligiblePayment({} as PaymentLike & { settleType?: string }),
    ).toBe(true);
  });
});

describe("filterPaymentsForItemReports", () => {
  test("filters out DUES_SETTLE and empty billItems", () => {
    const payments = [
      { billItems: [{ dish: { _id: "d1", price: 100 }, quantity: 1 }], settleType: "NORMAL_SETTLE" },
      { billItems: [], settleType: "NORMAL_SETTLE" },
      { billItems: [{ dish: { _id: "d2", price: 50 }, quantity: 1 }], settleType: "DUES_SETTLE" },
    ] as (PaymentLike & { billItems?: unknown[]; settleType?: string })[];
    const filtered = filterPaymentsForItemReports(payments);
    expect(filtered.length).toBe(1);
    expect((filtered[0] as { settleType: string }).settleType).toBe("NORMAL_SETTLE");
  });
});
