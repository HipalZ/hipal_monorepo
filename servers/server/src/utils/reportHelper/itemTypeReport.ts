/**
 * Item Type Report (VEG/NON_VEG/EGG/etc. Aggregation)
 * 
 * Aggregates sales by dish type (VEG, NON_VEG, EGG, JAIN, etc.)
 * Handles multi-type dishes correctly (counts fully in each type)
 */

import type { Payment, BillItem } from "./itemType";
import type { Workbook } from "exceljs";
import { addBoldHeaderRow, autoFitColumns, addKeyValueRow } from "./excelUtils";
import { formatToIST } from "./dateFormater";
import type { BaseContext } from "./types";

export interface DishTypeAggregate {
  type: string;              // VEG, NON_VEG, EGG, JAIN, etc.
  itemCount: number;         // total quantity sold
  grossAmount: number;       // before discount + tax
  discount: number;
  tax: number;
  netSales: number;          // final revenue
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
export function aggregateByDishType(
  payments: Payment[],
): DishTypeAggregate[] {
  const map: Record<string, DishTypeAggregate> = {};

  for (const payment of payments) {
    for (const item of payment.billItems || []) {
      const { dish, portion, extras = [], quantity, discount = 0 } = item;
      
      // Skip if no dish or no dish types
      // dish.dishTypes is an array: ["VEG"], ["NON_VEG"], ["VEG","JAIN"], etc.
      if (!dish || !dish.dishTypes || dish.dishTypes.length === 0) continue;

      // Calculate line amount
      const unitPrice = portion ? portion.price : dish.price;
      const extrasTotal = extras.reduce(
        (sum, e) => sum + (e.price || 0) * (e.quantity || 1),
        0,
      );

      const lineAmountExclTax = (unitPrice + extrasTotal) * quantity;
      const lineTax = ((lineAmountExclTax * (dish.gst || 0)) / 100);
      const net = lineAmountExclTax + lineTax - discount;

      // Multi-type dishes: count fully in each type
      // Example: ["VEG","JAIN"] → contributes fully to both VEG and JAIN
      for (const type of dish.dishTypes) {
        if (!map[type]) {
          map[type] = {
            type,
            itemCount: 0,
            grossAmount: 0,
            discount: 0,
            tax: 0,
            netSales: 0,
          };
        }

        // Add fully to each type (not split)
        map[type].itemCount += quantity;
        map[type].grossAmount += Number(lineAmountExclTax.toFixed(2));
        map[type].discount += discount;
        map[type].tax += Number(lineTax.toFixed(2));
        map[type].netSales += Number(net.toFixed(2));
      }
    }
  }

  // Sort by netSales descending
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

  // Header row
  addBoldHeaderRow(sheet, [
    "Item Type",
    "Quantity Sold",
    "Gross Amount",
    "Discount",
    "Tax",
    "Net Sales",
  ]);

  // Data rows
  for (const row of aggregates) {
    sheet.addRow([
      row.type,
      row.itemCount,
      row.grossAmount,
      row.discount,
      row.tax,
      row.netSales,
    ]);
  }

  // Add summary row
  const totals = aggregates.reduce(
    (acc, row) => ({
      itemCount: acc.itemCount + row.itemCount,
      grossAmount: acc.grossAmount + row.grossAmount,
      discount: acc.discount + row.discount,
      tax: acc.tax + row.tax,
      netSales: acc.netSales + row.netSales,
    }),
    {
      itemCount: 0,
      grossAmount: 0,
      discount: 0,
      tax: 0,
      netSales: 0,
    },
  );

  sheet.addRow([]);
  const summaryRow = sheet.addRow([
    "TOTAL",
    totals.itemCount,
    totals.grossAmount,
    totals.discount,
    totals.tax,
    totals.netSales,
  ]);

  // Make summary row bold
  for (let i = 1; i <= 6; i++) {
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
  
  // Aggregate by dish type across all businesses
  const aggregates = aggregateByDishType(allPayments);
  
  // Build sheet
  buildDishTypeSheet(workbook, aggregates, from, to);
}