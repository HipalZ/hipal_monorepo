import { Business, Kitchen, Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  formatDateToIST,
  formatToIST,
} from "../../utils/reportHelper/dateFormater";
import aggregateBillItems from "../../utils/reportHelper/itemReport";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

const itemRouter = new Hono()
  .post("/", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      "billItems.0": { $exists: true },
    })) as PaymentType[];

    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });
    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

    const paymentsByBiz: Record<string, PaymentType[]> = {};
    for (const id of businessIds) paymentsByBiz[id] = [];
    for (const p of allPayments) {
      paymentsByBiz[p.businessId]?.push(p);
    }

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);

    const grouped = businessIds.map((biz) => ({
      businessId: biz,
      from: fromIST,
      to: toIST,
      businessName: nameMap[biz] ?? "Unknown",
      items: aggregateBillItems(paymentsByBiz[biz]),
    }));

    return respond(c, "Item report fetched successfully", false, 200, grouped);
  })

  .post("/download_csv", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    // 1) Fetch payments for given businesses + date range
    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      "billItems.0": { $exists: true },
    })) as PaymentType[];

    // 2) Fetch business names
    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });

    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

    // 3) Fetch kitchens for these businesses (to resolve kitchenId -> name)
    const kitchenDocs = await Kitchen.find({ businessId: { $in: businessIds } })
      .lean()
      .select({ name: 1, businessId: 1 });

    const kitchenNameMapByBiz: Record<string, Record<string, string>> = {};
    for (const k of kitchenDocs) {
      const bizId = k.businessId.toString();
      if (!kitchenNameMapByBiz[bizId]) {
        kitchenNameMapByBiz[bizId] = {};
      }
      kitchenNameMapByBiz[bizId][k._id.toString()] = k.name;
    }

    // 4) Group payments by business
    const paymentsByBiz: Record<string, PaymentType[]> = {};
    for (const id of businessIds) paymentsByBiz[id] = [];
    for (const p of allPayments) {
      paymentsByBiz[p.businessId]?.push(p);
    }

    const header = [
      "Name",
      "No.of Orders",
      "Net Amount",
      "Total Discount",
      "Total Tax",
      "Total Sales",
    ].join(",");

    const csvLines: string[] = [];

    // 5) For each business, build kitchen-wise CSV blocks
    for (const biz of businessIds) {
      const bizName = nameMap[biz] ?? "Unknown";
      const payments = paymentsByBiz[biz] || [];
      const kitchenNameMap = kitchenNameMapByBiz[biz] || {};

      // Aggregate per kitchen + item
      type AggItem = {
        itemName: string;
        kitchenId: string;
        itemCount: number;
        amount: number;
        discount: number;
        tax: number;
        totalSales: number;
      };

      const byKitchen: Record<string, AggItem[]> = {};
      const overallTotals = {
        itemCount: 0,
        amount: 0,
        discount: 0,
        tax: 0,
        totalSales: 0,
      };

      for (const payment of payments) {
        for (const bi of payment.billItems || []) {
          const itemName = bi.dish.name;
          const dish = bi.dish;
          const portion = bi.portion;
          const extras = bi.extras || [];
          const quantity = bi.quantity;
          const discount = bi.discount || 0;

          const unitPrice = portion ? portion.price : dish.price;
          const kitchenId = dish.kitchenId;

          const extrasTotal = extras.reduce(
            (sum, e) => sum + (e.price || 0) * (e.quantity || 1),
            0,
          );

          const lineAmountExclTax = (unitPrice + extrasTotal) * quantity;
          const lineTax = lineAmountExclTax * (dish.gst / 100);

          const key = `${kitchenId}::${itemName}`;

          if (!byKitchen[kitchenId]) {
            byKitchen[kitchenId] = [];
          }

          let agg = byKitchen[kitchenId].find((x) => x.itemName === itemName);
          if (!agg) {
            agg = {
              itemName,
              kitchenId,
              itemCount: 0,
              amount: 0,
              discount: 0,
              tax: 0,
              totalSales: 0,
            };
            byKitchen[kitchenId].push(agg);
          }

          const qty = (bi as any).itemCount ?? (bi as any).quantity ?? 0;

          agg.itemCount += qty;
          agg.amount += bi.dish.price || 0;
          agg.discount += bi.discount || 0;
          agg.tax += Number(lineTax?.toFixed(2)) || 0;
          agg.totalSales +=
            Number((lineAmountExclTax + lineTax - discount).toFixed(2)) || 0;

          overallTotals.itemCount += qty;
          overallTotals.amount += Number(lineAmountExclTax?.toFixed(2));
          overallTotals.discount += bi.discount || 0;
          overallTotals.tax += Number(lineTax?.toFixed(2)) || 0;
          overallTotals.totalSales +=
            Number((lineAmountExclTax - discount + lineTax)?.toFixed(2)) || 0;
        }
      }

      // Business-level header
      csvLines.push(`BusinessId,${biz}`);
      csvLines.push(`BusinessName,"${bizName.replace(/"/g, '""')}"`);
      csvLines.push(`from,"${formatToIST(from, true)}" `);
      csvLines.push(`to ,"${formatToIST(to, true)}"`);
      csvLines.push(""); // blank line

      const kitchenIds = Object.keys(byKitchen);

      for (let i = 0; i < kitchenIds.length; i++) {
        const kitchenId = kitchenIds[i];
        const items = byKitchen[kitchenId];
        if (!items || items.length === 0) continue;

        const kitchenName = kitchenNameMap[kitchenId] ?? "Unknown Kitchen";

        // Kitchen section header
        csvLines.push(`Kitchen,"${kitchenName.replace(/"/g, '""')}"`);
        csvLines.push(header);

        for (const it of items) {
          const cols = [
            `"${it.itemName.replace(/"/g, '""')}"`,
            it.itemCount,
            it.amount,
            it.discount,
            it.tax,
            it.totalSales,
          ];
          csvLines.push(cols.join(","));
        }

        // blank line between kitchens
        csvLines.push("");
      }

      // extra blank line between businesses
      csvLines.push("");
      csvLines.push(
        `Overall Summary,${overallTotals.itemCount},${overallTotals.amount},${overallTotals.discount},${overallTotals.tax},${overallTotals.totalSales}`,
      );
    }

    const csv = csvLines.join("\r\n");
    const fromIST = formatToIST(from, true).replace(/[:/ ]/g, "-");
    const toIST = formatToIST(to, true).replace(/[:/ ]/g, "-");
    const filename = `item-report_${businessIds.join(
      "_",
    )}_${fromIST}_${toIST}.csv`;

    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    return c.body(csv);
  });

export default itemRouter;
