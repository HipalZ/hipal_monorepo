/**
 * Item Variant Report (Item-wise Portion Sales)
 *
 * Aggregates sales by item (dish) and portion to show which portions
 * of each item are sold the most.
 */

import type { Payment, BillItem } from "./itemType";
import type { Workbook } from "exceljs";
import { addBoldHeaderRow, autoFitColumns, addKeyValueRow } from "./excelUtils";
import { formatToIST } from "./dateFormater";
import type { BaseContext } from "./types";

export interface ItemVariantAggregate {
  itemName: string; // Dish name
  dishId: string; // Dish ID for uniqueness
  portionName: string; // Portion name or "Default" if no portion
  portionId: string | null; // Portion ID or null
  itemCount: number; // Total quantity sold for this item-portion combination
  grossAmount: number; // Before discount + tax
  discount: number;
  tax: number;
  netSales: number; // Final revenue
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
  // Map key: `${dishId}_${portionId || 'default'}`
  const map: Record<string, ItemVariantAggregate> = {};

  for (const payment of payments) {
    for (const item of payment.billItems || []) {
      const { dish, portion, extras = [], quantity, discount = 0, id } = item;

      // Skip if no dish or dish._id
      if (!dish || dish._id === null || dish._id === undefined) continue;

      // Get dish ID - safely convert to string
      let dishId: string;
      try {
        if (typeof dish._id === "string") {
          dishId = dish._id;
        } else if (
          dish._id &&
          typeof (dish._id as { toString?: () => string }).toString ===
            "function"
        ) {
          dishId = (dish._id as { toString(): string }).toString();
        } else {
          dishId = String(dish._id);
        }
      } catch (error) {
        // Skip this item if we can't get a valid dish ID
        console.warn("Failed to parse dish._id:", dish._id, error);
        continue;
      }

      // Parse item.id to determine portion
      // ID format: `${dishId}_${portionId || "no_portion"}_${sortedExtras || "no_extras"}`
      let portionId: string | null = null;
      let portionName = "Default";

      if (id) {
        const parsed = parseItemId(id);
        // Use parsed portionId if available, otherwise fallback to portion object
        if (parsed.portionId) {
          portionId = parsed.portionId;
          // Try to get portion name from portion object if available, otherwise use ID
          portionName = portion?.name || `Portion ${portionId.substring(0, 8)}`;
        } else {
          // No portion in ID, check if portion object exists as fallback
          if (portion?._id) {
            portionId =
              typeof portion._id === "string"
                ? portion._id
                : (portion._id as { toString(): string }).toString();
            portionName = portion.name || "Default";
          } else {
            portionId = null;
            portionName = "Default";
          }
        }
      } else {
        // Fallback: use portion object if ID parsing fails
        portionId = portion?._id
          ? typeof portion._id === "string"
            ? portion._id
            : (portion._id as { toString(): string }).toString()
          : null;
        portionName = portion?.name || "Default";
      }

      // Create unique key for this item-portion combination
      const key = `${dishId}_${portionId || "default"}`;

      // Calculate line amount
      const unitPrice = portion ? portion.price : dish.price;
      const extrasTotal = extras.reduce(
        (sum, e) => sum + (e.price || 0) * (e.quantity || 1),
        0,
      );

      const lineAmountExclTax = (unitPrice + extrasTotal) * quantity;
      const lineTax = (lineAmountExclTax * (dish.gst || 0)) / 100;
      const net = lineAmountExclTax + lineTax - discount;

      // Initialize or update aggregate
      if (!map[key]) {
        map[key] = {
          itemName: dish.name || "Unknown Item",
          dishId,
          portionName,
          portionId,
          itemCount: 0,
          grossAmount: 0,
          discount: 0,
          tax: 0,
          netSales: 0,
        };
      }

      map[key].itemCount += quantity;
      map[key].grossAmount += Number(lineAmountExclTax.toFixed(2));
      map[key].discount += discount;
      map[key].tax += Number(lineTax.toFixed(2));
      map[key].netSales += Number(net.toFixed(2));
    }
  }

  // Sort by item name, then by netSales descending
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

  // Header row
  addBoldHeaderRow(sheet, [
    "Item Name",
    "Portion",
    "Quantity Sold",
    "Gross Amount",
    "Discount",
    "Tax",
    "Net Sales",
  ]);

  // Data rows
  for (const row of aggregates) {
    sheet.addRow([
      row.itemName,
      row.portionName,
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
    "",
    totals.itemCount,
    totals.grossAmount,
    totals.discount,
    totals.tax,
    totals.netSales,
  ]);

  // Make summary row bold
  for (let i = 1; i <= 7; i++) {
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

  // Aggregate by item and portion across all businesses
  const aggregates = aggregateByItemVariant(allPayments);

  // Build sheet
  buildItemVariantSheet(workbook, aggregates, from, to);
}
