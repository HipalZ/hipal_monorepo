import type { Workbook } from "exceljs";
import type { BaseContext } from "./types";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";
import { formatToIST } from "./dateFormater";
import { KotOrder } from "@hi/db-models"; // Adjust import path as needed

// Helper to build extras summary string
function buildExtrasSummary(extras: any[]): string {
  if (!Array.isArray(extras) || extras.length === 0) return "";

  return extras
    .map((e) => {
      const name = e.name ?? "";
      const quantity = e.quantity ?? 0;
      const price = e.price ?? 0;
      return `${name} x${quantity} (₹${price})`;
    })
    .join(", ");
}

type DeletedItemSummaryRow = {
  itemKey: string;
  dishName: string;
  portionName: string;
  extrasSummary: string;
  deleteCount: number;
  totalQuantity: number;
  totalAmount: number;
  averageRate: number;
  deletedByList: string[];
  reasons: string[];
};

type InternalSummary = DeletedItemSummaryRow & {
  _deletedBySet: Set<string>;
  _reasonSet: Set<string>;
  _rateSum: number;
  _rateCount: number;
};

export async function buildDeletedItemsSheet(
  workbook: Workbook,
  ctx: BaseContext,
) {
  const { businessIds, bizNameMap, from, to } = ctx;

  const sheet = workbook.addWorksheet("Deleted Items");

  // Fetch orders that have deleted items within the time range for these businesses
  // Note: If you already pass `allOrders` inside `ctx` (like `allPayments`), you can filter that instead of querying here.
  const orders = await KotOrder.find({
    businessId: { $in: businessIds },
    date: { $gte: from, $lte: to },
    "cart.isDeleted": true,
  }).lean();

  // Group orders by business
  const ordersByBiz: Record<string, any[]> = {};
  for (const id of businessIds) ordersByBiz[id] = [];
  for (const o of orders) {
    const bid = o.businessId?.toString();
    if (bid && ordersByBiz[bid]) {
      ordersByBiz[bid].push(o);
    }
  }

  const header = [
    "Dish Name",
    "Portion",
    "Extras",
    "Delete Count",
    "Total Quantity",
    "Average Rate",
    "Total Amount",
    "Deleted By",
    "Reasons",
  ];

  for (const biz of businessIds) {
    const bizName = bizNameMap[biz] ?? "Unknown";
    const bizOrders = ordersByBiz[biz] || [];

    // Aggregate items for this specific business
    const map = new Map<string, InternalSummary>();

    const overallTotals = {
      deleteCount: 0,
      totalQuantity: 0,
      totalAmount: 0,
    };

    for (const order of bizOrders) {
      const cart = Array.isArray(order.cart) ? order.cart : [];

      for (const item of cart) {
        if (!item?.isDeleted) continue;

        const dishName = item.dish?.name ?? "";
        const portionName = item.portion?.name ?? "";
        const extras = Array.isArray(item.extras) ? item.extras : [];
        const extrasSummary = buildExtrasSummary(extras);

        const quantity = item.quantity ?? 0;
        const rate = item.portion?.price ?? item.dish?.price ?? 0;
        const amount = quantity * rate;
        const deletedBy = (item.deletedBy ?? "").trim();
        const reasonOfDeletion = (item.reasonOfDeletion ?? "").trim();
        const itemKey = item.id ?? "";

        let entry = map.get(itemKey);

        if (!entry) {
          entry = {
            itemKey,
            dishName,
            portionName,
            extrasSummary,
            deleteCount: 0,
            totalQuantity: 0,
            totalAmount: 0,
            averageRate: 0,
            deletedByList: [],
            reasons: [],
            _deletedBySet: new Set<string>(),
            _reasonSet: new Set<string>(),
            _rateSum: 0,
            _rateCount: 0,
          };
          map.set(itemKey, entry);
        }

        // Update item aggregations
        entry.deleteCount += 1;
        entry.totalQuantity += quantity;
        entry.totalAmount += amount;
        entry._rateSum += rate;
        entry._rateCount += 1;
        if (deletedBy) entry._deletedBySet.add(deletedBy);
        if (reasonOfDeletion) entry._reasonSet.add(reasonOfDeletion);

        // Update overall business totals
        overallTotals.deleteCount += 1;
        overallTotals.totalQuantity += quantity;
        overallTotals.totalAmount += amount;
      }
    }

    const items = Array.from(map.values()).map((m) => ({
      ...m,
      averageRate:
        m._rateCount > 0 ? Number((m._rateSum / m._rateCount).toFixed(2)) : 0,
      deletedByList: Array.from(m._deletedBySet),
      reasons: Array.from(m._reasonSet),
    }));

    // If no deleted items for this business, just skip to the next
    if (!items.length) continue;

    // Sort by totalAmount descending (optional, but good for reports)
    items.sort((a, b) => b.totalAmount - a.totalAmount);

    // ======= Business header block =======
    sheet.addRow([]);
    addKeyValueRow(sheet, "BusinessId", biz);
    addKeyValueRow(sheet, "BusinessName", bizName);
    addKeyValueRow(sheet, "From", formatToIST(from, true));
    addKeyValueRow(sheet, "To", formatToIST(to, true));

    // ======= Overall summary row =======
    sheet.addRow([]);
    const summaryRow = sheet.addRow([
      "Overall Deleted Items Summary",
      "", // Portion
      "", // Extras
      overallTotals.deleteCount,
      overallTotals.totalQuantity,
      "", // Avg Rate
      Number(overallTotals.totalAmount.toFixed(2)),
    ]);
    summaryRow.getCell(1).font = { bold: true };

    sheet.addRow([]);

    // ======= Detail table =======
    addBoldHeaderRow(sheet, header);

    for (const row of items) {
      const deletedByText = (row.deletedByList ?? [])
        .filter(Boolean)
        .join(", ");
      const reasonsText = (row.reasons ?? []).filter(Boolean).join(" | ");

      sheet.addRow([
        row.dishName,
        row.portionName,
        row.extrasSummary,
        row.deleteCount,
        row.totalQuantity,
        row.averageRate,
        Number(row.totalAmount.toFixed(2)),
        deletedByText,
        reasonsText,
      ]);
    }

    sheet.addRow([]);
  }

  autoFitColumns(sheet);
}
