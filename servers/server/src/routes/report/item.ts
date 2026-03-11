import { Business, Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  formatDateToIST,
  formatToIST,
} from "../../utils/reportHelper/dateFormater";
import {
  buildItemReport,
  buildSimpleItemSheet,
} from "../../utils/reportHelper/itemReport";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";
import { createReportWorkbook } from "../../utils/reportHelper/excelUtils";
import { filterPaymentsForItemReports } from "../../utils/reportHelper/itemFinancialCalculator";
import { aggregateByDishType } from "../../utils/reportHelper/itemTypeReport";
import { buildDishTypeSheet } from "../../utils/reportHelper/itemTypeReport";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

const itemRouter = new Hono()

  // Item report: same pattern as category report
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
    })
      .lean()
      .select(
        "businessId date tableName billItems billValue discount claimedCoins couponDiscount serviceCharge total mode splitModes settleType",
      )) as PaymentType[];

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
      const bid =
        typeof p.businessId === "string"
          ? p.businessId
          : (p.businessId as { toString(): string }).toString();
      if (paymentsByBiz[bid]) paymentsByBiz[bid].push(p);
    }

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);

    const grouped = businessIds.map((biz) => ({
      businessId: biz,
      businessName: nameMap[biz] ?? "Unknown",
      from: fromIST,
      to: toIST,
      items: buildItemReport(paymentsByBiz[biz] ?? []),
    }));

    return respond(
      c,
      "Item report fetched successfully",
      false,
      200,
      grouped,
    );
  })

  .post("/dish-type", zValidator("json", bodySchema), async (c) => {
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
    })
      .lean()) as PaymentType[];

    const itemPayments = filterPaymentsForItemReports(allPayments);

    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });
    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);

    const grouped = businessIds.map((biz) => {
      const businessPayments = itemPayments.filter(
        (p) =>
          (typeof p.businessId === "string"
            ? p.businessId
            : (p.businessId as { toString(): string }).toString()) === biz,
      );
      const businessAggregates = aggregateByDishType(businessPayments);
      return {
        businessId: biz,
        businessName: nameMap[biz] ?? "Unknown",
        from: fromIST,
        to: toIST,
        dishTypes: businessAggregates,
      };
    });

    return respond(
      c,
      "Dish type report fetched successfully",
      false,
      200,
      grouped,
    );
  })

  .post("/download_csv", zValidator("json", bodySchema), async (c) => {
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
    })
      .lean()
      .select(
        "businessId date tableName billItems billValue discount claimedCoins couponDiscount serviceCharge total mode splitModes settleType",
      )) as PaymentType[];

    const itemPayments = filterPaymentsForItemReports(allPayments);

    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });
    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

    const paymentsByBiz: Record<string, PaymentType[]> = {};
    for (const id of businessIds) paymentsByBiz[id] = [];
    for (const p of itemPayments) {
      const bid =
        typeof p.businessId === "string"
          ? p.businessId
          : (p.businessId as { toString(): string }).toString();
      if (paymentsByBiz[bid]) paymentsByBiz[bid].push(p);
    }

    const ctx = {
      businessIds,
      from,
      to,
      allPayments: itemPayments,
      bizNameMap: nameMap,
    };

    const { workbook } = createReportWorkbook();
    buildSimpleItemSheet(workbook, ctx);

    const dishTypeAggregates = aggregateByDishType(itemPayments);
    buildDishTypeSheet(workbook, dishTypeAggregates, from, to);

    const fromIST = formatToIST(from);
    const toIST = formatToIST(to);
    const filename = `Item Reports ${fromIST} to ${toIST}.xlsx`;

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
  })

  .post(
    "/download_csv_dish_type",
    zValidator("json", bodySchema),
    async (c) => {
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
      })
        .lean()) as PaymentType[];

      const itemPayments = filterPaymentsForItemReports(allPayments);

      const bizDocs = await Business.find({ _id: { $in: businessIds } })
        .lean()
        .select({ name: 1 });
      const nameMap: Record<string, string> = {};
      for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

      const dishTypeAggregates = aggregateByDishType(itemPayments);

      const { workbook } = createReportWorkbook();
      buildDishTypeSheet(workbook, dishTypeAggregates, from, to);

      const fromIST = formatToIST(from);
      const toIST = formatToIST(to);
      const filename = `Dish Type Reports ${fromIST} to ${toIST}.xlsx`;

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
    },
  );

export default itemRouter;
