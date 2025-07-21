import { Business, Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  type CategoryReport,
  buildCategoryReport,
} from "../../utils/reportHelper/categoryReport";
import {
  formatDateToIST,
  formatToIST,
} from "../../utils/reportHelper/dateFormater";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

const categoryRouter = new Hono()

  .post("/", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    // 1) fetch payments
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
    for (const b of bizDocs) {
      nameMap[b._id.toString()] = b.name;
    }

    // 3) group payments by biz
    const paymentsByBiz: Record<string, PaymentType[]> = {};
    for (const id of businessIds) paymentsByBiz[id] = [];
    for (const p of allPayments) {
      paymentsByBiz[p.businessId]?.push(p);
    }

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);
    const grouped = await Promise.all(
      businessIds.map(async (biz) => ({
        businessId: biz,
        businessName: nameMap[biz] ?? "Unknown",
        from: fromIST,
        to: toIST,
        categories: await buildCategoryReport(paymentsByBiz[biz]),
      })),
    );

    return respond(
      c,
      "Category report fetched successfully",
      false,
      200,
      grouped,
    );
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

    // fetch payments
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
    for (const b of bizDocs) {
      nameMap[b._id.toString()] = b.name;
    }

    // group payments
    const paymentsByBiz: Record<string, PaymentType[]> = {};
    for (const id of businessIds) paymentsByBiz[id] = [];
    for (const p of allPayments) {
      paymentsByBiz[p.businessId]?.push(p);
    }

    // build CSV blocks
    const csvLines: string[] = [];
    const header = [
      "Name",
      "CategoryCount",
      "TotalAmount",
      "TotalDiscount",
      "TotalTax",
    ].join(",");

    for (const biz of businessIds) {
      const bizName = nameMap[biz] ?? "Unknown";

      // BusinessId and BusinessName rows
      csvLines.push(`BusinessId,${biz}`);
      csvLines.push(`BusinessName,"${bizName.replace(/"/g, '""')}"`);

      // header + data rows
      csvLines.push(header);
      const categories: CategoryReport[] = await buildCategoryReport(
        paymentsByBiz[biz],
      );
      for (const cat of categories) {
        csvLines.push(
          [
            `"${cat.categoryName.replace(/"/g, '""')}"`,
            cat.categoryCount,
            cat.totalAmount,
            cat.totalDiscount,
            cat.totalTax,
          ].join(","),
        );
      }

      // blank line
      csvLines.push("");
    }

    const csv = csvLines.join("\r\n");
    const fromIST = formatToIST(from, true).replace(/[:/ ]/g, "-");
    const toIST = formatToIST(to, true).replace(/[:/ ]/g, "-");
    const filename = `category-report_${businessIds.join(
      "_",
    )}_${fromIST}_${toIST}.csv`;

    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    return c.body(csv);
  });

export default categoryRouter;
