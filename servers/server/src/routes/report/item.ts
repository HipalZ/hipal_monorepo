import { Business, Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { formatToIST } from "../../utils/reportHelper/dateFormater";
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

    // 1) fetch all payments
    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      "billItems.0": { $exists: true },
    })) as PaymentType[];

    // 2) fetch business names
    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });
    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

    // 3) group payments per biz
    const paymentsByBiz: Record<string, PaymentType[]> = {};
    for (const id of businessIds) paymentsByBiz[id] = [];
    for (const p of allPayments) {
      paymentsByBiz[p.businessId]?.push(p);
    }

    // 4) build final array
    const grouped = businessIds.map((biz) => ({
      businessId: biz,
      businessName: nameMap[biz] ?? "Unknown",
      items: aggregateBillItems(paymentsByBiz[biz]),
    }));

    return respond(c, "Item report fetched successfully", false, 200, grouped);
  })

  // CSV download
  .post("/download_csv", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    // fetch all payments
    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      "billItems.0": { $exists: true },
    })) as PaymentType[];

    // fetch business names
    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });
    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

    // group payments per biz
    const paymentsByBiz: Record<string, PaymentType[]> = {};
    for (const id of businessIds) paymentsByBiz[id] = [];
    for (const p of allPayments) {
      paymentsByBiz[p.businessId]?.push(p);
    }

    // build CSV lines
    const header = [
      "Name",
      "ItemCount",
      "Quantity",
      "Amount",
      "Discount",
      "Tax",
    ].join(",");
    const csvLines: string[] = [];

    for (const biz of businessIds) {
      const bizName = nameMap[biz] ?? "Unknown";

      csvLines.push(`BusinessId,${biz}`);
      csvLines.push(`BusinessName,"${bizName.replace(/"/g, '""')}"`);
      csvLines.push(header);

      const items = aggregateBillItems(paymentsByBiz[biz]);
      for (const it of items) {
        const cols = [
          `"${it.itemName.replace(/"/g, '""')}"`,
          it.itemCount,
          it.quantity,
          it.amount,
          it.discount,
          it.tax,
        ];
        csvLines.push(cols.join(","));
      }

      csvLines.push(""); // blank line
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
