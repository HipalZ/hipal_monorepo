/**
 * Item Type Report (VEG/NON_VEG/EGG/etc. Aggregation)
 *
 * Aggregates sales by dish type (VEG, NON_VEG, EGG, JAIN, etc.)
 * Uses canonical itemFinancialCalculator; multi-type dishes counted fully in each type.
 */

import type { Workbook } from "exceljs";
import { formatToIST } from "./dateFormater";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";
import type { Payment } from "./itemType";
import type { BaseContext } from "./types";
import {
  calculateFinalItemTotals,
  filterPaymentsForItemReports,
} from "./itemFinancialCalculator";

export interface DishTypeAggregate {
  type: string;
  itemCount: number;
  grossAmount: number;
  discount: number;
  /** GST only (per-dish: 0%, 5%, 18%, etc.) */
  gst: number;
  /** Allocated service charge */
  serviceCharge: number;
  /** All taxes: GST + service charge */
  tax: number;
  netSales: number;
}

/**
 * Aggregate sales by dish type
 *
 * CRITICAL: Multi-type dishes (e.g., ["VEG","JAIN"]) are counted fully in each type
 * This means a single sale contributes 100% to both VEG and JAIN totals
 *
 * Handles:
 * - Portions (portion price overrides dish price)
 * - Extras/addons (added to base price)
 * - Discounts (applied after tax calculation)
 * - Multi-type dishes (counted in all types)
 */
export function aggregateByDishType(payments: Payment[]): DishTypeAggregate[] {
  const map: Record<string, DishTypeAggregate> = {};

  for (const payment of payments) {
    const billItems = payment.billItems || [];
    if (billItems.length === 0) continue;

    const result = calculateFinalItemTotals(billItems, payment);

    for (let i = 0; i < billItems.length; i++) {
      const item = billItems[i];
      const b = result.items[i];
      const dish = item.dish;
      const isOpenItem = Boolean(item.isOpenItem);

      if (isOpenItem) {
        const type = "Open Item";
        if (!map[type]) {
          map[type] = {
            type,
            itemCount: 0,
            grossAmount: 0,
            discount: 0,
            gst: 0,
            serviceCharge: 0,
            tax: 0,
            netSales: 0,
          };
        }
        map[type].itemCount += b.quantity;
        map[type].grossAmount += b.grossItemValue;
        map[type].discount += b.itemDiscount;
        map[type].gst += b.itemGST;
        map[type].serviceCharge += b.itemServiceCharge;
        map[type].tax += b.totalTax;
        map[type].netSales += b.finalItemTotal;
        continue;
      }

      if (!dish || !dish.dishTypes || dish.dishTypes.length === 0) continue;

      for (const type of dish.dishTypes) {
        if (!map[type]) {
          map[type] = {
            type,
            itemCount: 0,
            grossAmount: 0,
            discount: 0,
            gst: 0,
            serviceCharge: 0,
            tax: 0,
            netSales: 0,
          };
        }
        map[type].itemCount += b.quantity;
        map[type].grossAmount += b.grossItemValue;
        map[type].discount += b.itemDiscount;
        map[type].gst += b.itemGST;
        map[type].serviceCharge += b.itemServiceCharge;
        map[type].tax += b.totalTax;
        map[type].netSales += b.finalItemTotal;
      }
    }
  }

  return Object.values(map).sort((a, b) => b.netSales - a.netSales);
}

/**
 * Build Excel sheet for Item Type Report
 */
export function buildDishTypeSheet(
  workbook: Workbook,
  aggregates: DishTypeAggregate[],
  from: number,
  to: number,
): void {
  const sheet = workbook.addWorksheet("Item Type Report");

  addBoldHeaderRow(sheet, [
    "Type",
    "Quantity Sold",
    "Gross Amount",
    "Discount",
    "Net Amount",
    "GST",
    "Service Charge",
    "Total Tax",
    "Net Sales",
  ]);

  for (const row of aggregates) {
    const netAmount = row.grossAmount - row.discount;
    sheet.addRow([
      row.type,
      row.itemCount,
      row.grossAmount,
      row.discount,
      netAmount,
      row.gst,
      row.serviceCharge,
      row.tax,
      row.netSales,
    ]);
  }

  const totals = aggregates.reduce(
    (acc, row) => ({
      itemCount: acc.itemCount + row.itemCount,
      grossAmount: acc.grossAmount + row.grossAmount,
      discount: acc.discount + row.discount,
      gst: acc.gst + row.gst,
      serviceCharge: acc.serviceCharge + row.serviceCharge,
      tax: acc.tax + row.tax,
      netSales: acc.netSales + row.netSales,
    }),
    {
      itemCount: 0,
      grossAmount: 0,
      discount: 0,
      gst: 0,
      serviceCharge: 0,
      tax: 0,
      netSales: 0,
    },
  );

  const totalNetAmount = totals.grossAmount - totals.discount;

  sheet.addRow([]);
  const summaryRow = sheet.addRow([
    "TOTAL",
    totals.itemCount,
    totals.grossAmount,
    totals.discount,
    totalNetAmount,
    totals.gst,
    totals.serviceCharge,
    totals.tax,
    totals.netSales,
  ]);

  for (let i = 1; i <= 9; i++) {
    summaryRow.getCell(i).font = { bold: true };
  }

  // Add date range
  sheet.addRow([]);
  addKeyValueRow(sheet, "From", formatToIST(from, true));
  addKeyValueRow(sheet, "To", formatToIST(to, true));

  autoFitColumns(sheet);
}

/**
 * Build Item Type Sheet for combined report (uses BaseContext)
 */
export function buildDishTypeSheetFromContext(
  workbook: Workbook,
  ctx: BaseContext,
): void {
  const { allPayments, from, to } = ctx;
  const itemPayments = filterPaymentsForItemReports(allPayments);
  const aggregates = aggregateByDishType(itemPayments);
  buildDishTypeSheet(workbook, aggregates, from, to);
}
