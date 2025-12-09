import { Business, Kitchen, Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  formatDateToIST,
  formatToIST,
} from "../../utils/reportHelper/dateFormater";
import aggregateBillItems, {
  buildItemSheet,
} from "../../utils/reportHelper/itemReport";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";
import { createReportWorkbook } from "../../utils/reportHelper/excelUtils";
import type { BaseContext } from "../../utils/reportHelper/types";

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

    const ctx: BaseContext = {
      businessIds,
      from,
      to,
      allPayments,
      bizNameMap: nameMap,
      kitchenNameMapByBiz,
    };
    const { workbook } = createReportWorkbook();

    //Item Report
    await buildItemSheet(workbook, ctx);

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
  });

export default itemRouter;
