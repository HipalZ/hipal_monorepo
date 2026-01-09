import {
  Business,
  DishZoneKitchen,
  Kitchen,
  Payment,
  Table,
} from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  formatDateToIST,
  formatToIST,
} from "../../utils/reportHelper/dateFormater";
import aggregateBillItems, {
  buildItemSheet,
  type DishZoneKitchenMapping,
} from "../../utils/reportHelper/itemReport";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";
import { createReportWorkbook } from "../../utils/reportHelper/excelUtils";
import type { BaseContext } from "../../utils/reportHelper/types";
import { aggregateByDishType } from "../../utils/reportHelper/itemTypeReport";
import { buildDishTypeSheet } from "../../utils/reportHelper/itemTypeReport";

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

    // Fetch DishZoneKitchen mappings for all businesses (ONCE, outside loops)
    // This replaces the deprecated dish.kitchenId approach
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

    // Build table name to zoneId lookup map (for deriving zoneId from payment.tableName)
    const tableNames = Array.from(
      new Set(allPayments.map((p) => p.tableName).filter(Boolean)),
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
      // Use internalZoneId if available, otherwise zoneId
      const zoneId =
        table.internalZoneId?.toString() || table.zoneId?.toString() || null;
      if (zoneId) {
        tableToZoneMap[bizId][table.name] = zoneId;
      }
    }

    // Helper function to get zoneId from payment
    const getZoneIdFromPayment = (payment: PaymentType): string | null => {
      const p = payment as PaymentType & {
        zoneId?: string | { toString(): string };
        table?: { zoneId?: string | { toString(): string } };
      };
      // Try payment.zoneId first
      if (p.zoneId) {
        return typeof p.zoneId === "string" ? p.zoneId : p.zoneId.toString();
      }
      // Try payment.table?.zoneId
      if (p.table?.zoneId) {
        return typeof p.table.zoneId === "string"
          ? p.table.zoneId
          : p.table.zoneId.toString();
      }
      // Fallback: lookup from table name
      const bizId =
        typeof payment.businessId === "string"
          ? payment.businessId
          : payment.businessId.toString();
      const zoneId = tableToZoneMap[bizId]?.[payment.tableName];
      return zoneId || null;
    };

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
      // Pass mappings and zoneId resolver to aggregation function
      items: aggregateBillItems(
        paymentsByBiz[biz],
        dishZoneKitchenMappings,
        getZoneIdFromPayment,
      ),
    }));

    return respond(c, "Item report fetched successfully", false, 200, grouped);
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
    })) as PaymentType[];

    // Fetch business names for response
    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });
    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);

    // Aggregate by dish type across all businesses
    // Returns flat array of DishTypeAggregate (sorted by netSales descending)
    const aggregates = aggregateByDishType(allPayments);

    // Return grouped by business for consistency with other endpoints
    const grouped = businessIds.map((biz) => {
      // Filter payments for this business
      const businessPayments = allPayments.filter(
        (p) =>
          (typeof p.businessId === "string"
            ? p.businessId
            : p.businessId.toString()) === biz,
      );
      // Aggregate per business
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

    // 1) Fetch payments for given businesses + date range
    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      "billItems.0": { $exists: true },
    })) as PaymentType[];

    // 2) Fetch DishZoneKitchen mappings for all businesses (ONCE, outside loops)
    // This replaces the deprecated dish.kitchenId approach
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

    // 3) Build table name to zoneId lookup map (for deriving zoneId from payment.tableName)
    const tableNames = Array.from(
      new Set(allPayments.map((p) => p.tableName).filter(Boolean)),
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
      // Use internalZoneId if available, otherwise zoneId
      const zoneId =
        table.internalZoneId?.toString() || table.zoneId?.toString() || null;
      if (zoneId) {
        tableToZoneMap[bizId][table.name] = zoneId;
      }
    }

    // 4) Fetch business names
    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });

    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

    // 5) Fetch kitchens for these businesses (to resolve kitchenId -> name)
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

    // 6) Group payments by business
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

    // Helper to get zoneId from payment for Excel export
    const getZoneIdForExcel = (payment: PaymentType): string | null => {
      const p = payment as PaymentType & {
        zoneId?: string | { toString(): string };
        table?: { zoneId?: string | { toString(): string } };
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
        typeof payment.businessId === "string"
          ? payment.businessId
          : payment.businessId.toString();
      return tableToZoneMap[bizId]?.[payment.tableName] || null;
    };

    // Item Report - Pass mappings to buildItemSheet
    // Note: buildItemSheet will use getZoneIdForExcel internally to resolve zoneId
    await buildItemSheet(
      workbook,
      ctx,
      dishZoneKitchenMappings,
      getZoneIdForExcel,
    );

    // Item Type Report (VEG/NON_VEG/etc.)
    const dishTypeAggregates = aggregateByDishType(allPayments);
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

      // 3) Aggregate by dish type
      const dishTypeAggregates = aggregateByDishType(allPayments);

      // 4) Create workbook with dish type sheet
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
