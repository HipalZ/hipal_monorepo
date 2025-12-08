import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import * as ExcelJS from "exceljs";

import { Payment, Business, Kitchen } from "@hi/db-models";
import { formatDateToIST } from "../../utils/reportHelper/dateFormater";

import { buildNetAndSalesSheets } from "../../utils/reportHelper/salesReport";
import { buildCategorySheet } from "../../utils/reportHelper/categoryReport";
import { buildItemSheet } from "../../utils/reportHelper/itemReport";
import { buildAddOnSheet } from "../../utils/reportHelper/addOnReport";
import { buildDiscountSheet } from "../../utils/reportHelper/discountReport";
import { buildServiceChargeSheet } from "../../utils/reportHelper/serviceChargeReport";
import type { BaseContext, AnyPayment } from "../../utils/reportHelper/types";
import { buildConsolidatedSheet } from "../../utils/reportHelper/cansolidateReport";
import { buildOpenItemSaleSheet } from "../../utils/reportHelper/buildOpenItemSaleSheet";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

const unifiedExcelRouter = new Hono().post(
  "/",
  zValidator("json", bodySchema),
  async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    // 🔹 Base payments (no appliedFilter logic)
    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
    }).populate({ path: "userId", select: "name phone" })) as AnyPayment[];

    // 🔹 Business names
    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });

    const bizNameMap: Record<string, string> = {};
    for (const b of bizDocs) {
      bizNameMap[b._id.toString()] = b.name;
    }

    // 🔹 Kitchens (for item/kitchen reports)
    const kitchenDocs = await Kitchen.find({
      businessId: { $in: businessIds },
    })
      .lean()
      .select({ name: 1, businessId: 1 });

    const kitchenNameMapByBiz: Record<string, Record<string, string>> = {};
    for (const k of kitchenDocs) {
      const bizId = k.businessId.toString();
      if (!kitchenNameMapByBiz[bizId]) kitchenNameMapByBiz[bizId] = {};
      kitchenNameMapByBiz[bizId][k._id.toString()] = k.name;
    }

    const ctx: BaseContext = {
      businessIds,
      from,
      to,
      allPayments,
      bizNameMap,
      kitchenNameMapByBiz,
    };

    // 📗 ExcelJS workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "HiPalz";
    workbook.created = new Date();

    await buildConsolidatedSheet(workbook, ctx);

    // 1) Net Sales + Sales Report
    await buildNetAndSalesSheets(workbook, ctx);

    // 2) Category Report
    await buildCategorySheet(workbook, ctx);

    // 3) Item Report
    await buildItemSheet(workbook, ctx);

    // 4) AddOn Report
    await buildAddOnSheet(workbook, ctx);

    // 5) Discount Report
    await buildDiscountSheet(workbook, ctx);

    // 6) Service Charge Report
    await buildServiceChargeSheet(workbook, ctx);

    //7) open item sale report
    await buildOpenItemSaleSheet(workbook, ctx);

    // 🔚 Final write & response
    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);
    const filename = `test_${businessIds.join("_")}_${fromIST}_${toIST}.xlsx`;

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

export default unifiedExcelRouter;
