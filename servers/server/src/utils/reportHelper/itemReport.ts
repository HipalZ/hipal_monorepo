import type { BillItem, Payment } from "./itemType";
import { formatToIST } from "../../utils/reportHelper/dateFormater";
import type { Workbook } from "exceljs";
import type { BaseContext } from "./types";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";

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
  amount: number;
  discount: number;
  tax: number;
  // quantity: number;
  totalSales: number;
  dishId: string; // Required: Part of aggregation key
  zoneId: string; // Required: Part of aggregation key (not optional)
  kitchenId: string; // Required: Part of aggregation key (not optional)
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

  const itemEligiblePayments = allPayments.filter(
    (p) => p.billItems && p.billItems.length > 0,
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
    "Net Amount",
    "Total Discount",
    "Total Tax",
    "Total Sales",
  ];

  for (const biz of businessIds) {
    const bizName = bizNameMap[biz] ?? "Unknown";
    const payments = paymentsByBiz[biz] || [];
    const kitchenNameMap = kitchenNameMapByBiz?.[biz] || {};

    type AggItem = {
      dishId: string; // Required: Part of aggregation key
      itemName: string;
      zoneId: string; // Required: Part of aggregation key
      kitchenId: string; // Required: Part of aggregation key
      itemCount: number;
      amount: number;
      discount: number;
      tax: number;
      totalSales: number;
    };

    // NEW STRUCTURE: Group by Zone → Kitchen → Item
    // This replaces the old byKitchen[kitchenId] structure
    const byZoneKitchen: Record<string, Record<string, AggItem[]>> = {};
    const overallTotals = {
      itemCount: 0,
      amount: 0,
      discount: 0,
      tax: 0,
      totalSales: 0,
    };

    for (const payment of payments) {
      // Get zoneId from payment (derived from table → zone)
      // Use provided function or fallback to default logic
      let zoneId: string | null = null;
      if (getZoneIdFromPayment) {
        zoneId = getZoneIdFromPayment(payment);
      } else {
        // Default fallback logic (Payment type may not have zoneId/table, cast if needed)
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

      for (const bi of payment.billItems || []) {
        const itemName = bi.dish.name;
        const dish = bi.dish;
        const portion = bi.portion;
        const extras = bi.extras || [];
        const quantity = bi.quantity;
        const discount = bi.discount || 0;

        const unitPrice = portion ? portion.price : dish.price;
        // CRITICAL FIX: Extract dishId first (used in multiple places)
        const dishId =
          typeof dish._id === "string"
            ? dish._id
            : (dish._id as { toString(): string }).toString();

        // RESOLVE KITCHEN VIA MAPPING: Never use dish.kitchenId again
        const kitchenId = resolveKitchenId(
          dishId,
          zoneIdStr !== "UNASSIGNED_ZONE" ? zoneIdStr : null,
          dishZoneKitchenMap,
        );

        const extrasTotal = extras.reduce(
          (sum: number, e: { price?: number; quantity?: number }) =>
            sum + (e.price || 0) * (e.quantity || 1),
          0,
        );

        const lineAmountExclTax = (unitPrice + extrasTotal) * quantity;
        const lineTax = (lineAmountExclTax * (dish.gst || 0)) / 100;

        // Initialize zone → kitchen structure
        if (!byZoneKitchen[zoneIdStr]) {
          byZoneKitchen[zoneIdStr] = {};
        }
        if (!byZoneKitchen[zoneIdStr][kitchenId]) {
          byZoneKitchen[zoneIdStr][kitchenId] = [];
        }

        // CRITICAL FIX: Find or create aggregated item (keyed by dishId, not just itemName)
        // Same dish name could appear in different categories, so we need dishId
        // Aggregation key is implicitly dishId + zoneId + kitchenId via the nested structure
        let agg = byZoneKitchen[zoneIdStr][kitchenId].find(
          (x) => x.dishId === dishId,
        );
        if (!agg) {
          agg = {
            dishId, // Required: Part of aggregation key
            itemName,
            zoneId: zoneIdStr,
            kitchenId,
            itemCount: 0,
            amount: 0,
            discount: 0,
            tax: 0,
            totalSales: 0,
          };
          byZoneKitchen[zoneIdStr][kitchenId].push(agg);
        }

        const qty =
          (bi as BillItem & { itemCount?: number }).itemCount ??
          bi.quantity ??
          0;

        // FIXED: Use lineAmountExclTax instead of bi.dish.price
        // All math logic preserved exactly as before
        agg.itemCount += qty;
        agg.amount += Number(lineAmountExclTax?.toFixed(2)) || 0; // FIXED: was bi.dish.price
        agg.discount += discount;
        agg.tax += Number(lineTax?.toFixed(2)) || 0;
        agg.totalSales +=
          Number((lineAmountExclTax + lineTax - discount).toFixed(2)) || 0;

        overallTotals.itemCount += qty;
        overallTotals.amount += Number(lineAmountExclTax?.toFixed(2));
        overallTotals.discount += discount;
        overallTotals.tax += Number(lineTax?.toFixed(2)) || 0;
        overallTotals.totalSales +=
          Number((lineAmountExclTax - discount + lineTax)?.toFixed(2)) || 0;
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
    addKeyValueRow(sheet, "Total Amount", overallTotals.amount);
    addKeyValueRow(sheet, "Total Discount", overallTotals.discount);
    addKeyValueRow(sheet, "Total Tax", overallTotals.tax);
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
            it.amount,
            it.discount,
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
      overallTotals.amount,
      overallTotals.discount,
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
  // console.log("sankla", payments);
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

  // CRITICAL FIX: Aggregate by dishId + zoneId + kitchenId (not just dishId)
  // This ensures we don't lose sales data when same dish is sold in different zones/kitchens
  const groups = payments.reduce<Record<string, AggregatedItem>>(
    (acc, payment) => {
      const zoneId = getZoneId(payment);
      // Use "UNASSIGNED" if zoneId is missing (must be string, not null)
      const zoneIdStr = zoneId || "UNASSIGNED";

      for (const item of payment.billItems || []) {
        const { dish, portion, extras = [], quantity, discount = 0 } = item;
        if (!dish || !dish._id) continue;

        const dishId =
          typeof dish._id === "string"
            ? dish._id
            : (dish._id as { toString(): string }).toString();

        // RESOLVE KITCHEN VIA MAPPING: Never use dish.kitchenId
        const kitchenId = resolveKitchenId(
          dishId,
          zoneIdStr !== "UNASSIGNED" ? zoneIdStr : null,
          dishZoneKitchenMap,
        );

        // CRITICAL: Aggregation key must include dishId + zoneId + kitchenId
        // This prevents data loss when same dish appears in different zones/kitchens
        const key = `${dishId}_${zoneIdStr}_${kitchenId}`;

        const unitPrice = portion ? portion.price : dish.price;

        const extrasTotal = extras.reduce(
          (sum, e) => sum + (e.price || 0) * (e.quantity || 1),
          0,
        );

        const lineAmountExclTax = (unitPrice + extrasTotal) * quantity;
        const lineTax = (lineAmountExclTax * (dish.gst || 0)) / 100;

        if (!acc[key]) {
          acc[key] = {
            categoryId: dish.categoryIds?.[0] || null,
            itemName: dish.name,
            itemCount: 0,
            amount: 0,
            discount: 0,
            tax: 0,
            totalSales: 0,
            dishId,
            zoneId: zoneIdStr,
            kitchenId,
          };
        }

        const grp = acc[key];
        grp.itemCount += quantity;
        grp.discount += discount;
        grp.tax += Number(lineTax?.toFixed(2));
        grp.amount += Number(lineAmountExclTax?.toFixed(2));
        grp.totalSales += Number(
          (lineAmountExclTax - discount + lineTax)?.toFixed(2),
        );
      }
      return acc;
    },
    {},
  );

  return Object.values(groups).sort((a, b) => b.itemCount - a.itemCount);
}

export default aggregateBillItems;
