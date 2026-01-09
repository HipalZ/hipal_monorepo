import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import * as ExcelJS from "exceljs";

import { Payment, Business, Kitchen, DishZoneKitchen, Table } from "@hi/db-models";
import { formatDateToIST } from "../../utils/reportHelper/dateFormater";

import { buildNetAndSalesSheets } from "../../utils/reportHelper/salesReport";
import { buildCategorySheet } from "../../utils/reportHelper/categoryReport";
import {
  buildItemSheet,
  type DishZoneKitchenMapping,
} from "../../utils/reportHelper/itemReport";
import { buildAddOnSheet } from "../../utils/reportHelper/addOnReport";
import { buildDiscountSheet } from "../../utils/reportHelper/discountReport";
import { buildServiceChargeSheet } from "../../utils/reportHelper/serviceChargeReport";
import type { BaseContext, AnyPayment } from "../../utils/reportHelper/types";
import { buildConsolidatedSheet } from "../../utils/reportHelper/cansolidateReport";
import { buildOpenItemSaleSheet } from "../../utils/reportHelper/buildOpenItemSaleSheet";
import { buildDishTypeSheetFromContext } from "../../utils/reportHelper/itemTypeReport";

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

    // 🔹 Fetch DishZoneKitchen mappings for item report (kitchen routing)
    const dishZoneKitchenMappings = (await DishZoneKitchen.find({
      businessId: { $in: businessIds },
    })
      .lean()
      .select({
        dishId: 1,
        zoneId: 1,
        kitchenId: 1,
        businessId: 1,
      })) as DishZoneKitchenMapping[];

    // 🔹 Build table name to zoneId lookup map
    const tableNames = Array.from(
      new Set(
        allPayments.map((p) => (p as any).tableName).filter(Boolean),
      ),
    );
    const tables = await Table.find({
      businessId: { $in: businessIds },
      name: { $in: tableNames },
    })
      .lean()
      .select({ name: 1, businessId: 1, zoneId: 1, internalZoneId: 1 });

    const tableToZoneMap: Record<string, Record<string, string>> = {};
    for (const table of tables) {
      const bizId = table.businessId.toString();
      if (!tableToZoneMap[bizId]) {
        tableToZoneMap[bizId] = {};
      }
      const zoneId =
        table.internalZoneId?.toString() || table.zoneId?.toString() || null;
      if (zoneId && table.name) {
        tableToZoneMap[bizId][table.name] = zoneId;
      }
    }

    // Helper to get zoneId from payment
    const getZoneIdForExcel = (payment: AnyPayment): string | null => {
      const p = payment as AnyPayment & {
        zoneId?: string | { toString(): string };
        table?: { zoneId?: string | { toString(): string } };
        tableName?: string;
      };
      if (p.zoneId) {
        return typeof p.zoneId === "string" ? p.zoneId : p.zoneId.toString();
      }
      if (p.table?.zoneId) {
        return typeof p.table.zoneId === "string"
          ? p.table.zoneId
          : p.table.zoneId.toString();
      }
      const bizId =
        typeof (payment as any).businessId === "string"
          ? (payment as any).businessId
          : (payment as any).businessId.toString();
      return tableToZoneMap[bizId]?.[p.tableName || ""] || null;
    };

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

    // 3) Item Report (with DishZoneKitchen mappings for correct kitchen routing)
    await buildItemSheet(
      workbook,
      ctx,
      dishZoneKitchenMappings,
      getZoneIdForExcel,
    );

    // 3.5) Item Type Report (VEG/NON_VEG/etc.)
    buildDishTypeSheetFromContext(workbook, ctx);

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
