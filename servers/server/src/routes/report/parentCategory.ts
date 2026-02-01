/**
 * Parent Category Report route.
 * Same filters as Item/Category: businessIds, from, to; exclude DUES_SETTLE.
 * Response: parent categories with optional child breakdown; reconciliation fields.
 */

import { Business, Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { formatDateToIST } from "../../utils/reportHelper/dateFormater";
import {
  buildParentCategoryReport,
  buildParentCategorySheet,
} from "../../utils/reportHelper/parentCategoryReport";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";
import { filterPaymentsForItemReports } from "../../utils/reportHelper/itemFinancialCalculator";
import { createReportWorkbook } from "../../utils/reportHelper/excelUtils";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
  includeChildBreakdown: z.boolean().optional().default(true),
});

const parentCategoryRouter = new Hono()

  .post("/", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to, includeChildBreakdown } = await c.req.json();

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

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);

    const grouped = await Promise.all(
      businessIds.map(async (biz) => {
        const payments = itemPayments.filter(
          (p) =>
            (typeof p.businessId === "string"
              ? p.businessId
              : (p.businessId as { toString(): string }).toString()) === biz,
        );
        const result = await buildParentCategoryReport(payments, [biz], {
          includeChildBreakdown,
        });
        return {
          businessId: biz,
          businessName: nameMap[biz] ?? "Unknown",
          from: fromIST,
          to: toIST,
          parentCategories: result.parentCategories,
          childCategoryTotals: result.childCategoryTotals,
          sumItemFinalAmount: result.sumItemFinalAmount,
          sumParentFinalAmount: result.sumParentFinalAmount,
          validationPassed: result.validationPassed,
          validationMessage: result.validationMessage,
        };
      }),
    );

    return respond(
      c,
      "Parent category report fetched successfully",
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

    const { workbook } = createReportWorkbook();
    const ctx = {
      businessIds,
      from,
      to,
      allPayments: itemPayments,
      bizNameMap: nameMap,
    };
    await buildParentCategorySheet(workbook, ctx);

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);
    const filename = `Parent Category Reports ${fromIST} to ${toIST}.xlsx`;
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

export default parentCategoryRouter;
