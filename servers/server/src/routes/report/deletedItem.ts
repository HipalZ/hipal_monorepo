// src/routes/report/deletedItems.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { KotOrder, Business } from "@hi/db-models";
import {
  autoFitColumns,
  createReportWorkbook,
} from "../../utils/reportHelper/excelUtils";
import { formatDateToIST } from "../../utils/reportHelper/dateFormater";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

type DeletedItemRow = {
  businessId: string;
  businessName: string;
  kotId: string;
  kotInvoiceNumber: number | null;
  kotDate: number;
  tableName: string;
  waiterName: string;
  customerPhone: string;
  itemKey: string;
  dishName: string;
  portionName: string;
  extrasSummary: string;
  quantity: number;
  rate: number;
  amount: number;
  isOpenItem: boolean;
  deletedBy: string;
  reasonOfDeletion: string;
};

export type DeletedItemSummaryRow = {
  businessId: string;
  businessName: string;
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

/**
 * Helper: build extras summary string
 * e.g. "Bread 1 x1 (₹10), bread 2 x1 (₹10)"
 */
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

/**
 * Fetch raw deleted items (per deletion line) + grouped summary per itemKey.
 */
async function fetchDeletedItemsAndSummary(
  businessIds: string[],
  from: number,
  to: number,
): Promise<{ rows: DeletedItemRow[]; summary: DeletedItemSummaryRow[] }> {
  const [orders, bizDocs] = await Promise.all([
    KotOrder.find({
      businessId: { $in: businessIds },
      date: { $gte: from, $lte: to },
      "cart.isDeleted": true,
    }).lean(),
    Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 }),
  ]);

  const bizNameMap: Record<string, string> = {};
  for (const b of bizDocs) {
    bizNameMap[b._id.toString()] = b.name;
  }

  const rows: DeletedItemRow[] = [];

  for (const order of orders as any[]) {
    const businessId = order.businessId?.toString?.() ?? "";
    const businessName = bizNameMap[businessId] ?? "Unknown";
    const kotId = order._id?.toString?.() ?? "";
    const kotInvoiceNumber = order.kotInvoiceNumber ?? null;
    const kotDate = order.date ?? Date.now();
    const tableName = order.tableName ?? "";
    const waiterName = order.name ?? "";
    const customerPhone = order.phone ?? "";

    const cart = Array.isArray(order.cart) ? order.cart : [];

    for (const item of cart) {
      if (!item?.isDeleted) continue;

      const dishName = item.dish?.name ?? "";
      const portionName = item.portion?.name ?? "";
      const extras = Array.isArray(item.extras) ? item.extras : [];
      const extrasSummary = buildExtrasSummary(extras);

      const quantity = item.quantity ?? 0;
      const rate = item.portion?.price ?? item.dish?.price ?? 0; // follow your POS rule for rate
      const amount = quantity * rate;
      const isOpenItem = !!item.isOpenItem;
      const deletedBy = (item.deletedBy ?? "").trim();
      const reasonOfDeletion = (item.reasonOfDeletion ?? "").trim();
      const itemKey: string = item.id ?? "";

      rows.push({
        businessId,
        businessName,
        kotId,
        kotInvoiceNumber,
        kotDate,
        tableName,
        waiterName,
        customerPhone,
        itemKey,
        dishName,
        portionName,
        extrasSummary,
        quantity,
        rate,
        amount,
        isOpenItem,
        deletedBy,
        reasonOfDeletion,
      });
    }
  }

  // ---- Group by businessId + itemKey ----
  type InternalSummary = DeletedItemSummaryRow & {
    _deletedBySet: Set<string>;
    _reasonSet: Set<string>;
    _rateSum: number;
    _rateCount: number;
  };

  const map = new Map<string, InternalSummary>();

  for (const r of rows) {
    const key = `${r.businessId}::${r.itemKey}`;
    let entry = map.get(key);

    if (!entry) {
      const deletedBySet = new Set<string>();
      const reasonSet = new Set<string>();

      if (r.deletedBy) deletedBySet.add(r.deletedBy);
      if (r.reasonOfDeletion) reasonSet.add(r.reasonOfDeletion);

      entry = {
        businessId: r.businessId,
        businessName: r.businessName,
        itemKey: r.itemKey,
        dishName: r.dishName,
        portionName: r.portionName,
        extrasSummary: r.extrasSummary,
        deleteCount: 0,
        totalQuantity: 0,
        totalAmount: 0,
        averageRate: 0,
        deletedByList: [],
        reasons: [],
        _deletedBySet: deletedBySet,
        _reasonSet: reasonSet,
        _rateSum: 0,
        _rateCount: 0,
      };
      map.set(key, entry);
    }

    entry.deleteCount += 1;
    entry.totalQuantity += r.quantity ?? 0;
    entry.totalAmount += r.amount ?? 0;
    entry._rateSum += r.rate ?? 0;
    entry._rateCount += 1;

    if (r.deletedBy) entry._deletedBySet.add(r.deletedBy);
    if (r.reasonOfDeletion) entry._reasonSet.add(r.reasonOfDeletion);
  }

  const summary: DeletedItemSummaryRow[] = Array.from(map.values()).map(
    (m) => ({
      businessId: m.businessId,
      businessName: m.businessName,
      itemKey: m.itemKey,
      dishName: m.dishName,
      portionName: m.portionName,
      extrasSummary: m.extrasSummary,
      deleteCount: m.deleteCount,
      totalQuantity: m.totalQuantity,
      totalAmount: m.totalAmount,
      averageRate:
        m._rateCount > 0 ? Number((m._rateSum / m._rateCount).toFixed(2)) : 0,
      deletedByList: Array.from(m._deletedBySet),
      reasons: Array.from(m._reasonSet),
    }),
  );

  // Optional: sort by totalAmount desc
  summary.sort((a, b) => b.totalAmount - a.totalAmount);

  return { rows, summary };
}

const deletedItemRouter = new Hono()

  /**
   * JSON API: return deleted items detail + grouped summary
   */
  .post("/", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    const { rows, summary } = await fetchDeletedItemsAndSummary(
      businessIds,
      from,
      to,
    );

    return c.json({
      err: false,
      data: {
        rows,
        summary,
      },
      message: "Deleted items fetched successfully",
    });
  })

  /**
   * XLSX download: Deleted Items Summary (grouped by itemKey)
   */
  .post("/download_xlsx", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    const { summary } = await fetchDeletedItemsAndSummary(
      businessIds,
      from,
      to,
    );

    const { workbook, sheet } = createReportWorkbook("Deleted Items Summary");

    if (!sheet) {
      return c.json(
        { err: true, data: null, message: "Failed to create worksheet" },
        500,
      );
    }

    const header = [
      "Dish Name",
      "Portion",
      "Extras",
      "Delete Count",
      "Total Quantity",
      "Deleted By",
      "Reasons",
    ];

    const headerRow = sheet.addRow(header);
    headerRow.font = { bold: true };

    for (const row of summary) {
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
        deletedByText,
        reasonsText,
      ]);
    }

    autoFitColumns(sheet);

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);
    const filename = `Deleted Items Summary ${fromIST} to ${toIST}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();

    c.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8",
    );
    c.header(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
        filename,
      )}`,
    );

    return c.body(buffer);
  });

export default deletedItemRouter;
