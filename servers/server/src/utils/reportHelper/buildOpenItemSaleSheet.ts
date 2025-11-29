// utils/reportHelper/openItemSaleReport.ts
import type { Workbook } from "exceljs";
import type { BaseContext } from "./types";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";
import { formatToIST } from "../../utils/reportHelper/dateFormater";
import type { Payment, BillItem } from "./itemType";

type AnyPayment = any;

type OpenItemAgg = {
  itemName: string;
  totalQty: number;
  netAmount: number; // excl. tax
  totalDiscount: number;
  totalTax: number;
  netRevenue: number; // incl. tax, after discount
};

export async function buildOpenItemSaleSheet(
  workbook: Workbook,
  ctx: BaseContext,
) {
  const { businessIds, allPayments, bizNameMap, from, to } = ctx;

  const sheet = workbook.addWorksheet("Open Item Sale");

  // Only payments that actually have billItems
  const itemEligiblePayments = allPayments.filter(
    (p: AnyPayment) => Array.isArray(p.billItems) && p.billItems.length > 0,
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
      totalTax: 0,
      netRevenue: 0,
    };

    for (const payment of payments as AnyPayment[]) {
      for (const bi of (payment.billItems || []) as BillItem[]) {
        // ✅ Only consider open items
        const isOpenItem = (bi as any).isOpenItem === true;
        if (!isOpenItem) continue;

        const dish = bi.dish;
        if (!dish) continue;

        const portion = bi.portion;
        const extras = bi.extras || [];
        const quantity = bi.quantity || 0;
        const discount = bi.discount || 0;

        if (!quantity) continue;

        const unitPrice = portion ? portion.price : dish.price || 0;

        const extrasTotal = extras.reduce(
          (sum: number, e: any) => sum + (e.price || 0) * (e.quantity || 1),
          0,
        );

        const lineAmountExclTax = (unitPrice + extrasTotal) * quantity;
        const lineTax = lineAmountExclTax * ((dish.gst || 0) / 100);

        const lineNetAmount = lineAmountExclTax; // excl. tax
        const lineTotalDiscount = discount; // item-level discount
        const lineNetRevenue = lineAmountExclTax - discount + lineTax; // incl. tax, after discount

        const itemName = dish.name || "Open Item";

        if (!aggByItem[itemName]) {
          aggByItem[itemName] = {
            itemName,
            totalQty: 0,
            netAmount: 0,
            totalDiscount: 0,
            totalTax: 0,
            netRevenue: 0,
          };
        }

        const agg = aggByItem[itemName];
        agg.totalQty += quantity;
        agg.netAmount += Number(lineNetAmount.toFixed(2));
        agg.totalDiscount += Number(lineTotalDiscount.toFixed(2));
        agg.totalTax += Number(lineTax.toFixed(2));
        agg.netRevenue += Number(lineNetRevenue.toFixed(2));

        overallTotals.totalQty += quantity;
        overallTotals.netAmount += Number(lineNetAmount.toFixed(2));
        overallTotals.totalDiscount += Number(lineTotalDiscount.toFixed(2));
        overallTotals.totalTax += Number(lineTax.toFixed(2));
        overallTotals.netRevenue += Number(lineNetRevenue.toFixed(2));
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
        Number(it.totalTax.toFixed(2)),
        Number(it.netRevenue.toFixed(2)),
      ]);
    }

    sheet.addRow([]);
  }

  autoFitColumns(sheet);
}
