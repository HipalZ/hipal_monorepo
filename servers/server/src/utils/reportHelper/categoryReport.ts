// utils/reportHelper/categoryReport.ts
import type { Workbook } from "exceljs";
import { Category } from "@hi/db-models";
import type { Payment as PaymentType } from "./itemType";
import { type AggregatedItem, aggregateBillItems } from "./itemReport";
import type { BaseContext } from "./types";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";
import { filterPaymentsForItemReports } from "./itemFinancialCalculator";

export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  categoryCount: number;
  itemCount: number;
  totalAmount: number;
  totalDiscount: number;
  gst: number;
  serviceCharge: number;
  totalTax: number; // GST + service charge
  totalSales: number;
}

type CatGroup = {
  categoryCount: number;
  totalAmount: number;
  totalDiscount: number;
  gst: number;
  serviceCharge: number;
  totalTax: number;
  itemCount: number;
  totalSales: number;
};

export async function buildCategoryReport(
  payments: PaymentType[],
): Promise<CategoryReport[]> {
  const items: AggregatedItem[] = aggregateBillItems(payments);

  const catMap = items.reduce<Record<string, CatGroup>>((acc, it) => {
    const catId = it.categoryId ?? "uncategorized";
    if (!acc[catId]) {
      acc[catId] = {
        categoryCount: 0,
        itemCount: 0,
        totalAmount: 0,
        totalDiscount: 0,
        gst: 0,
        serviceCharge: 0,
        totalTax: 0,
        totalSales: 0,
      };
    }
    const grp = acc[catId];
    grp.categoryCount += it.itemCount;
    grp.itemCount += it.itemCount;
    grp.totalAmount += it.grossAmount;
    grp.totalDiscount += it.discount;
    grp.gst += it.gst;
    grp.serviceCharge += it.serviceCharge;
    grp.totalTax += it.tax;
    grp.totalSales += it.totalSales;
    return acc;
  }, {});

  const catIds = Object.keys(catMap).filter((id) => id !== "uncategorized");
  const categories = await Category.find({ _id: { $in: catIds } })
    .lean()
    .select({ name: 1 });

  const nameById = categories.reduce<Record<string, string>>((m, c) => {
    m[c._id.toString()] = c.name;
    return m;
  }, {});

  return Object.entries(catMap)
    .map<CategoryReport>(([catId, grp]) => ({
      categoryId: catId,
      categoryName: nameById[catId] || "Unknown",
      categoryCount: grp.categoryCount,
      totalAmount: grp.totalAmount,
      totalDiscount: grp.totalDiscount,
      itemCount: grp.itemCount,
      gst: Number(grp.gst.toFixed(2)),
      serviceCharge: Number(grp.serviceCharge.toFixed(2)),
      totalTax: Number(grp.totalTax.toFixed(2)),
      totalSales: Number(grp.totalSales.toFixed(2)),
    }))
    .sort((a, b) => b.categoryCount - a.categoryCount);
}

// ---------------------------------------------------------------------
// Helper: Category Report sheet
// ---------------------------------------------------------------------

export async function buildCategorySheet(workbook: Workbook, ctx: BaseContext) {
  const { businessIds, allPayments, bizNameMap } = ctx;

  const sheet = workbook.addWorksheet("Category Report");

  const categoryEligiblePayments = filterPaymentsForItemReports(
    allPayments,
  ) as PaymentType[];

  const paymentsByBiz: Record<string, PaymentType[]> = {};
  for (const id of businessIds) {
    paymentsByBiz[id] = [];
  }

  for (const p of categoryEligiblePayments) {
    const bid = (p as any).businessId.toString();
    if (!paymentsByBiz[bid]) paymentsByBiz[bid] = [];
    paymentsByBiz[bid].push(p);
  }

  const header = [
    "Category",
    "No.of Orders",
    "Total Items Orders",
    "Gross Amount",
    "Total Discount",
    "GST",
    "Service Charge",
    "Total Tax",
    "Total Sales",
  ];

  for (const biz of businessIds) {
    const bizName = bizNameMap[biz] ?? "Unknown";

    const categories = (await buildCategoryReport(
      paymentsByBiz[biz] || [],
    )) as CategoryReport[];

    // Net Revenue = totalSales (final including GST + service charge) so it reconciles with Sales Total
    const enriched = categories.map((c) => ({
      ...c,
      netRevenue: c.totalSales ?? (c.totalAmount || 0) - (c.totalDiscount || 0) + (c.totalTax || 0),
    }));

    const totals = enriched.reduce(
      (acc, c) => {
        acc.amount += c.totalAmount || 0;
        acc.discount += c.totalDiscount || 0;
        acc.gst += c.gst || 0;
        acc.serviceCharge += c.serviceCharge || 0;
        acc.tax += c.totalTax || 0;
        acc.net += c.totalSales ?? c.netRevenue ?? 0;
        return acc;
      },
      { amount: 0, discount: 0, gst: 0, serviceCharge: 0, tax: 0, net: 0 },
    );

    let topCategory =
      enriched.length > 0
        ? enriched[0]
        : (null as (typeof enriched)[number] | null);
    let lowestCategory =
      enriched.length > 0
        ? enriched[0]
        : (null as (typeof enriched)[number] | null);

    for (let i = 1; i < enriched.length; i++) {
      const c = enriched[i];
      if (topCategory && c.netRevenue > topCategory.netRevenue) {
        topCategory = c;
      }
      if (lowestCategory && c.netRevenue < lowestCategory.netRevenue) {
        lowestCategory = c;
      }
    }

    sheet.addRow([]);
    addKeyValueRow(sheet, "BusinessId", biz);
    addKeyValueRow(sheet, "BusinessName", bizName);
    addKeyValueRow(sheet, "Gross Amount", totals.amount);
    addKeyValueRow(sheet, "Total Discount", totals.discount);
    addKeyValueRow(sheet, "GST", totals.gst);
    addKeyValueRow(sheet, "Service Charge", totals.serviceCharge);
    addKeyValueRow(sheet, "Total Tax (GST + Service Charge)", totals.tax);
    addKeyValueRow(sheet, "Net Revenue", totals.net);

    if (topCategory) {
      const row = sheet.addRow([
        "Top Category",
        topCategory.categoryName,
        topCategory.netRevenue,
      ]);
      row.getCell(1).font = { ...(row.getCell(1).font || {}), bold: true };
    }

    if (lowestCategory) {
      const row = sheet.addRow([
        "Lowest Category",
        lowestCategory.categoryName,
        lowestCategory.netRevenue,
      ]);
      row.getCell(1).font = { ...(row.getCell(1).font || {}), bold: true };
    }

    sheet.addRow([]);
    addBoldHeaderRow(sheet, header);

    for (const cat of enriched) {
      sheet.addRow([
        cat.categoryName,
        cat.categoryCount,
        cat.itemCount,
        cat.totalAmount,
        cat.totalDiscount,
        cat.gst,
        cat.serviceCharge,
        cat.totalTax,
        cat.totalSales,
      ]);
    }

    sheet.addRow([]);
  }
  autoFitColumns(sheet);
}
