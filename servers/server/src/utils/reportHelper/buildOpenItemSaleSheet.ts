// utils/reportHelper/openItemSaleReport.ts
import type { Workbook } from "exceljs";
import type { BaseContext } from "./types";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";
import { formatToIST } from "./dateFormater";
import type { Payment, BillItem } from "./itemType";
import {
  calculateFinalItemTotals,
  filterPaymentsForItemReports,
} from "./itemFinancialCalculator";

type AnyPayment = any;

type OpenItemAgg = {
  itemName: string;
  totalQty: number;
  netAmount: number;
  totalDiscount: number;
  gst: number;
  serviceCharge: number;
  totalTax: number; // GST + service charge
  netRevenue: number;
};

export async function buildOpenItemSaleSheet(
  workbook: Workbook,
  ctx: BaseContext,
) {
  const { businessIds, allPayments, bizNameMap, from, to } = ctx;

  const sheet = workbook.addWorksheet("Open Item Sale");

  const itemEligiblePayments = filterPaymentsForItemReports(
    allPayments,
  ) as Payment[];

  // Group payments by business
  const paymentsByBiz: Record<string, Payment[]> = {};
  for (const id of businessIds) paymentsByBiz[id] = [];
  for (const p of itemEligiblePayments) {
    const bid = (p as any).businessId.toString();
    if (!paymentsByBiz[bid]) paymentsByBiz[bid] = [];
    paymentsByBiz[bid].push(p);
  }

  const header = [
    "Item Name",
    "Total Quantity",
    "Net Amount (Excl. Tax)",
    "Total Discount",
    "GST",
    "Service Charge",
    "Total Tax",
    "Net Revenue (Incl. Tax)",
  ];

  for (const biz of businessIds) {
    const bizName = bizNameMap[biz] ?? "Unknown";
    const payments = paymentsByBiz[biz] || [];

    // Aggregate per itemName (only isOpenItem)
    const aggByItem: Record<string, OpenItemAgg> = {
      // [itemName]: { ... }
    };

    const overallTotals = {
      totalQty: 0,
      netAmount: 0,
      totalDiscount: 0,
      gst: 0,
      serviceCharge: 0,
      totalTax: 0,
      netRevenue: 0,
    };

    for (const payment of payments as AnyPayment[]) {
      const billItems = (payment.billItems || []) as BillItem[];
      if (billItems.length === 0) continue;

      const result = calculateFinalItemTotals(billItems, payment);

      for (let i = 0; i < billItems.length; i++) {
        const bi = billItems[i];
        if ((bi as any).isOpenItem !== true) continue;

        const dish = bi.dish;
        if (!dish) continue;

        const b = result.items[i];
        const itemName = dish.name || "Open Item";

        if (!aggByItem[itemName]) {
          aggByItem[itemName] = {
            itemName,
            totalQty: 0,
            netAmount: 0,
            totalDiscount: 0,
            gst: 0,
            serviceCharge: 0,
            totalTax: 0,
            netRevenue: 0,
          };
        }

        const agg = aggByItem[itemName];
        agg.totalQty += b.quantity;
        agg.netAmount += b.grossItemValue;
        agg.totalDiscount += b.itemDiscount;
        agg.gst += b.itemGST;
        agg.serviceCharge += b.itemServiceCharge;
        agg.totalTax += b.totalTax;
        agg.netRevenue += b.finalItemTotal;

        overallTotals.totalQty += b.quantity;
        overallTotals.netAmount += b.grossItemValue;
        overallTotals.totalDiscount += b.itemDiscount;
        overallTotals.gst += b.itemGST;
        overallTotals.serviceCharge += b.itemServiceCharge;
        overallTotals.totalTax += b.totalTax;
        overallTotals.netRevenue += b.finalItemTotal;
      }
    }

    // If no open items for this business, just skip
    const items = Object.values(aggByItem);
    if (!items.length) continue;

    // ======= Business header block =======
    sheet.addRow([]);
    addKeyValueRow(sheet, "BusinessId", biz);
    addKeyValueRow(sheet, "BusinessName", bizName);
    addKeyValueRow(sheet, "From", formatToIST(from, true));
    addKeyValueRow(sheet, "To", formatToIST(to, true));

    // Overall summary row
    sheet.addRow([]);
    const summaryRow = sheet.addRow([
      "Overall Open Item Summary",
      overallTotals.totalQty,
      overallTotals.netAmount,
      overallTotals.totalDiscount,
      overallTotals.gst,
      overallTotals.serviceCharge,
      overallTotals.totalTax,
      overallTotals.netRevenue,
    ]);
    summaryRow.getCell(1).font = {
      ...(summaryRow.getCell(1).font || {}),
      bold: true,
    };

    sheet.addRow([]);

    // ======= Detail table =======
    addBoldHeaderRow(sheet, header);

    for (const it of items) {
      sheet.addRow([
        it.itemName,
        it.totalQty,
        Number(it.netAmount.toFixed(2)),
        Number(it.totalDiscount.toFixed(2)),
        Number(it.gst.toFixed(2)),
        Number(it.serviceCharge.toFixed(2)),
        Number(it.totalTax.toFixed(2)),
        Number(it.netRevenue.toFixed(2)),
      ]);
    }

    sheet.addRow([]);
  }

  autoFitColumns(sheet);
}
