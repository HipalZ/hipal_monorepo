/**
 * Item Variant Report (Item-wise Portion Sales)
 *
 * Aggregates sales by item (dish) and portion using canonical itemFinancialCalculator.
 */

import type { Payment, BillItem } from "./itemType";
import type { Workbook } from "exceljs";
import { addBoldHeaderRow, autoFitColumns, addKeyValueRow } from "./excelUtils";
import { formatToIST } from "./dateFormater";
import type { BaseContext } from "./types";
import {
  calculateFinalItemTotals,
  filterPaymentsForItemReports,
} from "./itemFinancialCalculator";

export interface ItemVariantAggregate {
  itemName: string;
  dishId: string;
  portionName: string;
  portionId: string | null;
  itemCount: number;
  grossAmount: number;
  discount: number;
  gst: number;
  serviceCharge: number;
  /** All taxes: GST + service charge */
  tax: number;
  netSales: number;
}

/**
 * Parse item ID to extract dishId, portionId, and extras
 * ID format: `${dishId}_${portionId || "no_portion"}_${sortedExtras || "no_extras"}`
 *
 * Examples:
 * - "68eca1198c81ca83e65ad0aa_68eca1198c81ca83e65ad0ab_no_extras" (has portion)
 * - "68eca1198c81ca83e65ad0aa_no_portion_no_extras" (no portion)
 * - "68eca1198c81ca83e65ad0aa_68eca1198c81ca83e65ad0ab_id1:1|id2:2" (has portion and extras)
 */
function parseItemId(itemId: string): {
  dishId: string;
  portionId: string | null;
  hasExtras: boolean;
} {
  // Split by underscore - format is always: dishId_portionIdOrNoPortion_extrasOrNoExtras
  const parts = itemId.split("_");
  if (parts.length < 2) {
    // Fallback: return the whole ID as dishId (malformed ID)
    return {
      dishId: itemId,
      portionId: null,
      hasExtras: false,
    };
  }

  const dishId = parts[0];
  const portionPart = parts[1];

  // Everything after the second underscore is the extras part
  // Join them back in case there were underscores in the extras string
  const extrasPart = parts.slice(2).join("_") || "no_extras";

  // Check if portion exists (not "no_portion")
  const portionId = portionPart === "no_portion" ? null : portionPart;
  const hasExtras = extrasPart !== "no_extras";

  return {
    dishId,
    portionId,
    hasExtras,
  };
}

/**
 * Aggregate sales by item and portion
 *
 * Groups sales by:
 * - Item (dish) name and ID
 * - Portion name (or "Default" if no portion selected)
 *
 * This helps identify which portions of each item are most popular.
 * Uses item.id format to determine portion: `${dishId}_${portionId || "no_portion"}_${extras}`
 */
export function aggregateByItemVariant(
  payments: Payment[],
): ItemVariantAggregate[] {
  const map: Record<string, ItemVariantAggregate> = {};

  for (const payment of payments) {
    const billItems = payment.billItems || [];
    if (billItems.length === 0) continue;

    const result = calculateFinalItemTotals(billItems, payment);

    for (let i = 0; i < billItems.length; i++) {
      const item = billItems[i];
      const b = result.items[i];
      const { dish, portion, id } = item;

      if (!dish || dish._id === null || dish._id === undefined) continue;

      let dishId: string;
      try {
        dishId =
          typeof dish._id === "string"
            ? dish._id
            : (dish._id as { toString(): string }).toString();
      } catch {
        continue;
      }

      let portionId: string | null = null;
      let portionName = "Default";

      if (id) {
        const parsed = parseItemId(id);
        if (parsed.portionId) {
          portionId = parsed.portionId;
          portionName = portion?.name || `Portion ${portionId.substring(0, 8)}`;
        } else if (portion?._id) {
          portionId =
            typeof portion._id === "string"
              ? portion._id
              : (portion._id as { toString(): string }).toString();
          portionName = portion.name || "Default";
        }
      } else if (portion?._id) {
        portionId =
          typeof portion._id === "string"
            ? portion._id
            : (portion._id as { toString(): string }).toString();
        portionName = portion.name || "Default";
      }

      const key = `${dishId}_${portionId || "default"}`;

      if (!map[key]) {
        map[key] = {
          itemName: dish.name || "Unknown Item",
          dishId,
          portionName,
          portionId,
          itemCount: 0,
          grossAmount: 0,
          discount: 0,
          gst: 0,
          serviceCharge: 0,
          tax: 0,
          netSales: 0,
        };
      }

      map[key].itemCount += b.quantity;
      map[key].grossAmount += b.grossItemValue;
      map[key].discount += b.itemDiscount;
      map[key].gst += b.itemGST;
      map[key].serviceCharge += b.itemServiceCharge;
      map[key].tax += b.totalTax;
      map[key].netSales += b.finalItemTotal;
    }
  }

  return Object.values(map).sort((a, b) => {
    if (a.itemName !== b.itemName) {
      return a.itemName.localeCompare(b.itemName);
    }
    return b.netSales - a.netSales;
  });
}

/**
 * Build Excel sheet for Item Variant Report
 */
export function buildItemVariantSheet(
  workbook: Workbook,
  aggregates: ItemVariantAggregate[],
  from: number,
  to: number,
): void {
  const sheet = workbook.addWorksheet("Item Variant Report");

  addBoldHeaderRow(sheet, [
    "Item Name",
    "Portion",
    "Quantity Sold",
    "Gross Amount",
    "Discount",
    "GST",
    "Service Charge",
    "Total Tax",
    "Net Sales",
  ]);

  for (const row of aggregates) {
    sheet.addRow([
      row.itemName,
      row.portionName,
      row.itemCount,
      row.grossAmount,
      row.discount,
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

  sheet.addRow([]);
  const summaryRow = sheet.addRow([
    "TOTAL",
    "",
    totals.itemCount,
    totals.grossAmount,
    totals.discount,
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
 * Build Item Variant Sheet for combined report (uses BaseContext)
 */
export function buildItemVariantSheetFromContext(
  workbook: Workbook,
  ctx: BaseContext,
): void {
  const { allPayments, from, to } = ctx;
  const itemPayments = filterPaymentsForItemReports(allPayments);
  const aggregates = aggregateByItemVariant(itemPayments);
  buildItemVariantSheet(workbook, aggregates, from, to);
}
