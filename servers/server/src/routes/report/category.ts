import { Business, Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  buildCategoryReport,
  buildCategorySheet,
} from "../../utils/reportHelper/categoryReport";
import { formatDateToIST } from "../../utils/reportHelper/dateFormater";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";
import { createReportWorkbook } from "../../utils/reportHelper/excelUtils";
import { filterPaymentsForItemReports } from "../../utils/reportHelper/itemFinancialCalculator";

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

    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      "billItems.0": { $exists: true },
    })) as PaymentType[];

    const itemPayments = filterPaymentsForItemReports(allPayments);

    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });
    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) {
      nameMap[b._id.toString()] = b.name;
    }

    const paymentsByBiz: Record<string, PaymentType[]> = {};
    for (const id of businessIds) paymentsByBiz[id] = [];
    for (const p of itemPayments) {
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

  .post("/download_xlsx", zValidator("json", bodySchema), async (c) => {
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

    const itemPayments = filterPaymentsForItemReports(allPayments);

    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });

    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) {
      nameMap[b._id.toString()] = b.name;
    }

    const paymentsByBiz: Record<string, PaymentType[]> = {};
    for (const id of businessIds) paymentsByBiz[id] = [];
    for (const p of itemPayments) {
      paymentsByBiz[p.businessId]?.push(p);
    }

    const { workbook } = createReportWorkbook();

    const ctx = {
      businessIds,
      from,
      to,
      allPayments: itemPayments,
      bizNameMap: nameMap,
      paymentsByBiz,
    };

    await buildCategorySheet(workbook, ctx);

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);
    const filename = `Category Reports ${fromIST} to ${toIST}.xlsx`;

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

export default categoryRouter;
