import type { BillItem, Payment } from "./itemType";
import { formatToIST } from "./dateFormater";
import type { Workbook } from "exceljs";
import type { BaseContext } from "./types";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";
import {
  calculateFinalItemTotals,
  filterPaymentsForItemReports,
} from "./itemFinancialCalculator";

/**
 * DishZoneKitchen mapping interface
 * Represents the new model where kitchen is resolved via (dishId + zoneId)
 */
export interface DishZoneKitchenMapping {
  dishId: string | { toString(): string };
  zoneId: string | { toString(): string };
  kitchenId: string | { toString(): string };
  businessId: string | { toString(): string };
}

export interface AggregatedItem {
  categoryId: string | null;
  itemName: string;
  itemCount: number;
  grossAmount: number;
  amount: number; // net item value (pre-tax)
  discount: number;
  /** GST only (per-dish: 0%, 5%, 18%, etc.) */
  gst: number;
  /** Allocated service charge */
  serviceCharge: number;
  /** All taxes: GST + service charge */
  tax: number;
  totalSales: number;
  dishId: string;
  zoneId: string;
  kitchenId: string;
}

/**
 * Build lookup map for Dish-Zone-Kitchen mappings
 * Key format: `${dishId}_${zoneId}` -> kitchenId
 */
type DZKKey = `${string}_${string}`;

function buildDishZoneKitchenMap(
  mappings: DishZoneKitchenMapping[],
): Record<DZKKey, string> {
  const map: Record<DZKKey, string> = {};
  for (const m of mappings) {
    const dishId =
      typeof m.dishId === "string" ? m.dishId : m.dishId.toString();
    const zoneId =
      typeof m.zoneId === "string" ? m.zoneId : m.zoneId.toString();
    const kitchenId =
      typeof m.kitchenId === "string" ? m.kitchenId : m.kitchenId.toString();
    const key: DZKKey = `${dishId}_${zoneId}`;
    map[key] = kitchenId;
  }
  return map;
}

/**
 * Resolve kitchenId for a dish in a specific zone
 * Uses DishZoneKitchen mapping instead of deprecated dish.kitchenId
 */
function resolveKitchenId(
  dishId: string,
  zoneId: string | null | undefined,
  dishZoneKitchenMap: Record<DZKKey, string>,
): string {
  if (!zoneId) {
    return "UNASSIGNED";
  }
  const key: DZKKey = `${dishId}_${zoneId}`;
  return dishZoneKitchenMap[key] ?? "UNASSIGNED";
}

export async function buildItemSheet(
  workbook: Workbook,
  ctx: BaseContext,
  dishZoneKitchenMappings?: DishZoneKitchenMapping[],
  getZoneIdFromPayment?: (payment: Payment) => string | null,
) {
  const {
    businessIds,
    allPayments,
    bizNameMap,
    kitchenNameMapByBiz,
    from,
    to,
  } = ctx;

  // Build Dish-Zone-Kitchen lookup map ONCE before any loops
  // This replaces the deprecated dish.kitchenId approach
  const dishZoneKitchenMap = dishZoneKitchenMappings
    ? buildDishZoneKitchenMap(dishZoneKitchenMappings)
    : ({} as Record<DZKKey, string>);

  const sheet = workbook.addWorksheet("Item Report");

  // Item reports: exclude DUES_SETTLE; only payments with billItems
  const itemEligiblePayments = filterPaymentsForItemReports(
    allPayments,
  ) as Payment[];

  const paymentsByBiz: Record<string, Payment[]> = {};
  for (const id of businessIds) paymentsByBiz[id] = [];
  for (const p of itemEligiblePayments) {
    const bid =
      typeof p.businessId === "string"
        ? p.businessId
        : (p.businessId as { toString(): string }).toString();
    if (!paymentsByBiz[bid]) paymentsByBiz[bid] = [];
    paymentsByBiz[bid].push(p);
  }

  const header = [
    "Name",
    "No.of Orders",
    "Gross Amount",
    "Net Amount",
    "Total Discount",
    "GST",
    "Service Charge",
    "Total Tax",
    "Total Sales",
  ];

  for (const biz of businessIds) {
    const bizName = bizNameMap[biz] ?? "Unknown";
    const payments = paymentsByBiz[biz] || [];
    const kitchenNameMap = kitchenNameMapByBiz?.[biz] || {};

    type AggItem = {
      dishId: string;
      itemName: string;
      zoneId: string;
      kitchenId: string;
      itemCount: number;
      grossAmount: number;
      amount: number;
      discount: number;
      gst: number;
      serviceCharge: number;
      tax: number; // GST + service charge
      totalSales: number;
    };

    const byZoneKitchen: Record<string, Record<string, AggItem[]>> = {};
    const overallTotals = {
      itemCount: 0,
      grossAmount: 0,
      amount: 0,
      discount: 0,
      gst: 0,
      serviceCharge: 0,
      tax: 0,
      totalSales: 0,
    };

    for (const payment of payments) {
      const billItems = payment.billItems || [];
      if (billItems.length === 0) continue;

      const result = calculateFinalItemTotals(billItems, payment);

      let zoneId: string | null = null;
      if (getZoneIdFromPayment) {
        zoneId = getZoneIdFromPayment(payment);
      } else {
        const p = payment as Payment & {
          zoneId?: string | { toString(): string };
          table?: { zoneId?: string | { toString(): string } };
        };
        if (p.zoneId) {
          zoneId =
            typeof p.zoneId === "string" ? p.zoneId : p.zoneId.toString();
        } else if (p.table?.zoneId) {
          zoneId =
            typeof p.table.zoneId === "string"
              ? p.table.zoneId
              : p.table.zoneId.toString();
        }
      }
      const zoneIdStr = zoneId || "UNASSIGNED_ZONE";

      const DELETED_DISH_LABEL = "Not found or deleted dish";
      const DELETED_DISH_ID = "deleted";

      for (let i = 0; i < billItems.length; i++) {
        const bi = billItems[i];
        const b = result.items[i];
        const dish = bi.dish;
        const isDeletedOrMissing = !dish || dish._id == null || dish._id === undefined;
        const itemName = isDeletedOrMissing
          ? DELETED_DISH_LABEL
          : (dish.name ?? DELETED_DISH_LABEL);
        const dishId = isDeletedOrMissing
          ? DELETED_DISH_ID
          : typeof dish!._id === "string"
            ? dish!._id
            : (dish!._id as { toString(): string }).toString();

        const kitchenId = resolveKitchenId(
          dishId,
          zoneIdStr !== "UNASSIGNED_ZONE" ? zoneIdStr : null,
          dishZoneKitchenMap,
        );

        if (!byZoneKitchen[zoneIdStr]) {
          byZoneKitchen[zoneIdStr] = {};
        }
        if (!byZoneKitchen[zoneIdStr][kitchenId]) {
          byZoneKitchen[zoneIdStr][kitchenId] = [];
        }

        let agg = byZoneKitchen[zoneIdStr][kitchenId].find(
          (x) => x.dishId === dishId,
        );
        if (!agg) {
          agg = {
            dishId,
            itemName,
            zoneId: zoneIdStr,
            kitchenId,
            itemCount: 0,
            grossAmount: 0,
            amount: 0,
            discount: 0,
            gst: 0,
            serviceCharge: 0,
            tax: 0,
            totalSales: 0,
          };
          byZoneKitchen[zoneIdStr][kitchenId].push(agg);
        }

        const qty = b.quantity;

        agg.itemCount += qty;
        agg.grossAmount += b.grossItemValue;
        agg.amount += b.netItemValue;
        agg.discount += b.itemDiscount;
        agg.gst += b.itemGST;
        agg.serviceCharge += b.itemServiceCharge;
        agg.tax += b.totalTax;
        agg.totalSales += b.finalItemTotal;

        overallTotals.itemCount += qty;
        overallTotals.grossAmount += b.grossItemValue;
        overallTotals.amount += b.netItemValue;
        overallTotals.discount += b.itemDiscount;
        overallTotals.gst += b.itemGST;
        overallTotals.serviceCharge += b.itemServiceCharge;
        overallTotals.tax += b.totalTax;
        overallTotals.totalSales += b.finalItemTotal;
      }
    }

    // Flatten all items across zones and kitchens for top/lowest item calculation
    const allItems: AggItem[] = [];
    for (const zoneId of Object.keys(byZoneKitchen)) {
      for (const kitchenId of Object.keys(byZoneKitchen[zoneId])) {
        allItems.push(...byZoneKitchen[zoneId][kitchenId]);
      }
    }

    let topItem: AggItem | null = allItems.length > 0 ? allItems[0] : null;
    let lowestItem: AggItem | null = allItems.length > 0 ? allItems[0] : null;

    for (let i = 1; i < allItems.length; i++) {
      const it = allItems[i];
      if (topItem && it.totalSales > topItem.totalSales) {
        topItem = it;
      }
      if (lowestItem && it.totalSales < lowestItem.totalSales) {
        lowestItem = it;
      }
    }

    type KitchenSummary = {
      zoneId: string;
      kitchenId: string;
      kitchenName: string;
      qty: number;
      net: number;
    };

    // Collect kitchen summaries across all zones
    const kitchenSummary: KitchenSummary[] = [];

    for (const zoneId of Object.keys(byZoneKitchen)) {
      for (const kitchenId of Object.keys(byZoneKitchen[zoneId])) {
        const items = byZoneKitchen[zoneId][kitchenId];
        if (!items || items.length === 0) continue;

        const kitchenName = kitchenNameMap[kitchenId] ?? "Unknown Kitchen";

        let qty = 0;
        let net = 0;
        for (const it of items) {
          qty += it.itemCount || 0;
          net += it.totalSales || 0;
        }

        kitchenSummary.push({
          zoneId,
          kitchenId,
          kitchenName,
          qty,
          net,
        });
      }
    }

    // Find top kitchen by quantity (across all zones)
    let topKitchen: KitchenSummary | null =
      kitchenSummary.length > 0 ? kitchenSummary[0] : null;

    for (let i = 1; i < kitchenSummary.length; i++) {
      const k = kitchenSummary[i];
      if (topKitchen && k.qty > topKitchen.qty) {
        topKitchen = k;
      }
    }

    sheet.addRow([]);
    addKeyValueRow(sheet, "BusinessId", biz);
    addKeyValueRow(sheet, "BusinessName", bizName);
    addKeyValueRow(sheet, "Total Quantity", overallTotals.itemCount);
    addKeyValueRow(sheet, "Gross Amount", overallTotals.grossAmount);
    addKeyValueRow(sheet, "Net Amount", overallTotals.amount);
    addKeyValueRow(sheet, "Total Discount", overallTotals.discount);
    addKeyValueRow(sheet, "GST", overallTotals.gst);
    addKeyValueRow(sheet, "Service Charge", overallTotals.serviceCharge);
    addKeyValueRow(sheet, "Total Tax (GST + Service Charge)", overallTotals.tax);
    addKeyValueRow(sheet, "Net Revenue", overallTotals.totalSales);

    if (topItem) {
      const row = sheet.addRow([
        "Top Item",
        topItem.itemName,
        topItem.totalSales,
      ]);
      row.getCell(1).font = { ...(row.getCell(1).font || {}), bold: true };
    }

    if (lowestItem) {
      const row = sheet.addRow([
        "Lowest Item",
        lowestItem.itemName,
        lowestItem.totalSales,
      ]);
      row.getCell(1).font = { ...(row.getCell(1).font || {}), bold: true };
    }

    sheet.addRow([]);

    if (kitchenSummary.length > 0) {
      sheet.addRow(["Kitchen Summary"]);
      addBoldHeaderRow(sheet, [
        "Kitchen",
        "Total Quantity",
        "Net Revenue",
        "Flag",
      ]);

      for (const k of kitchenSummary) {
        sheet.addRow([
          k.kitchenName,
          k.qty,
          k.net,
          topKitchen && k.kitchenId === topKitchen.kitchenId
            ? "Top kitchen"
            : "",
        ]);
      }

      sheet.addRow([]);
    }

    addKeyValueRow(sheet, "from", formatToIST(from, true));
    addKeyValueRow(sheet, "to", formatToIST(to, true));
    sheet.addRow([]);

    // Iterate through zones, then kitchens within each zone
    // This preserves zone-aware grouping while maintaining backward-compatible output
    for (const zoneId of Object.keys(byZoneKitchen)) {
      const zoneKitchens = byZoneKitchen[zoneId];
      for (const kitchenId of Object.keys(zoneKitchens)) {
        const items = zoneKitchens[kitchenId];
        if (!items || items.length === 0) continue;

        const kitchenName = kitchenNameMap[kitchenId] ?? "Unknown Kitchen";

        // Optional: Add zone info if needed (commented for backward compatibility)
        // sheet.addRow(["Zone", zoneId === "UNASSIGNED_ZONE" ? "Unassigned" : zoneId]);
        sheet.addRow(["Kitchen", kitchenName]);
        addBoldHeaderRow(sheet, header);

        for (const it of items) {
          sheet.addRow([
            it.itemName,
            it.itemCount,
            it.grossAmount,
            it.amount,
            it.discount,
            it.gst,
            it.serviceCharge,
            it.tax,
            it.totalSales,
          ]);
        }

        sheet.addRow([]);
      }
    }

    sheet.addRow([
      "Overall Summary",
      overallTotals.itemCount,
      overallTotals.grossAmount,
      overallTotals.amount,
      overallTotals.discount,
      overallTotals.gst,
      overallTotals.serviceCharge,
      overallTotals.tax,
      overallTotals.totalSales,
    ]);
  }

  autoFitColumns(sheet);
}

/**
 * Aggregate bill items across payments
 * REFACTORED: Now uses Dish-Zone-Kitchen mapping instead of dish.kitchenId
 *
 * @param payments - Array of payment documents
 * @param dishZoneKitchenMappings - Array of DishZoneKitchen mappings (optional, falls back to UNASSIGNED if missing)
 * @param getZoneIdFromPayment - Optional function to extract zoneId from payment (defaults to payment.zoneId or payment.table?.zoneId)
 */
export function aggregateBillItems(
  payments: Payment[],
  dishZoneKitchenMappings?: DishZoneKitchenMapping[],
  getZoneIdFromPayment?: (payment: Payment) => string | null,
): AggregatedItem[] {
  // Build lookup map ONCE before any loops (no DB calls inside loops)
  const dishZoneKitchenMap = dishZoneKitchenMappings
    ? buildDishZoneKitchenMap(dishZoneKitchenMappings)
    : ({} as Record<DZKKey, string>);

  // Helper to get zoneId from payment
  const getZoneId = (payment: Payment): string | null => {
    if (getZoneIdFromPayment) {
      return getZoneIdFromPayment(payment);
    }
    // Default: try payment.zoneId or payment.table?.zoneId
    const p = payment as Payment & {
      zoneId?: string | { toString(): string };
      table?: { zoneId?: string | { toString(): string } };
    };
    if (p.zoneId) {
      return typeof p.zoneId === "string" ? p.zoneId : p.zoneId.toString();
    }
    if (p.table?.zoneId) {
      return typeof p.table.zoneId === "string"
        ? p.table.zoneId
        : p.table.zoneId.toString();
    }
    return null;
  };

  const groups = payments.reduce<Record<string, AggregatedItem>>(
    (acc, payment) => {
      const billItems = payment.billItems || [];
      if (billItems.length === 0) return acc;

      const result = calculateFinalItemTotals(billItems, payment);
      const zoneId = getZoneId(payment);
      const zoneIdStr = zoneId || "UNASSIGNED";

      const DELETED_DISH_LABEL = "Not found or deleted dish";
      const DELETED_DISH_ID = "deleted";

      for (let i = 0; i < billItems.length; i++) {
        const item = billItems[i];
        const b = result.items[i];
        const dish = item.dish;
        const isDeletedOrMissing = !dish || dish._id == null || dish._id === undefined;
        const dishId = isDeletedOrMissing
          ? DELETED_DISH_ID
          : typeof dish!._id === "string"
            ? dish!._id
            : (dish!._id as { toString(): string }).toString();
        const itemName = isDeletedOrMissing
          ? DELETED_DISH_LABEL
          : (dish!.name ?? DELETED_DISH_LABEL);
        const categoryId = isDeletedOrMissing ? null : (dish!.categoryIds?.[0] ?? null);

        const kitchenId = resolveKitchenId(
          dishId,
          zoneIdStr !== "UNASSIGNED" ? zoneIdStr : null,
          dishZoneKitchenMap,
        );

        const key = `${dishId}_${zoneIdStr}_${kitchenId}`;

        if (!acc[key]) {
          acc[key] = {
            categoryId,
            itemName,
            itemCount: 0,
            grossAmount: 0,
            amount: 0,
            discount: 0,
            gst: 0,
            serviceCharge: 0,
            tax: 0,
            totalSales: 0,
            dishId,
            zoneId: zoneIdStr,
            kitchenId,
          };
        }

        const grp = acc[key];
        grp.itemCount += b.quantity;
        grp.grossAmount += b.grossItemValue;
        grp.amount += b.netItemValue;
        grp.discount += b.itemDiscount;
        grp.gst += b.itemGST;
        grp.serviceCharge += b.itemServiceCharge;
        grp.tax += b.totalTax;
        grp.totalSales += b.finalItemTotal;
      }
      return acc;
    },
    {},
  );

  return Object.values(groups).sort((a, b) => b.itemCount - a.itemCount);
}

export default aggregateBillItems;
