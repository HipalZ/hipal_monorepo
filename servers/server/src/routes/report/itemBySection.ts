import {
  Business,
  DishZoneKitchen,
  Kitchen,
  Payment,
  Table,
  Zone,
} from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { formatDateToIST, formatToIST } from "../../utils/reportHelper/dateFormater";
import {
  aggregateKitchenWise,
  aggregateZoneWise,
  type DishZoneKitchenMapping,
  hasDzkForBusiness,
} from "../../utils/reportHelper/itemReport";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";
import { filterPaymentsForItemReports } from "../../utils/reportHelper/itemFinancialCalculator";
import {
  addBoldHeaderRow,
  createReportWorkbook,
} from "../../utils/reportHelper/excelUtils";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

/** Item row in a section (item-only fields). */
interface SectionItemRow {
  itemName: string;
  categoryId: string;
  itemCount: number;
  amount: number;
  discount: number;
  tax: number;
  totalSales: number;
}

/** One section (zone or kitchen) with its items. */
interface ReportSection {
  sectionId: string;
  sectionName: string;
  items: SectionItemRow[];
}

/** Per-business item-by-section response. */
interface BusinessItemBySectionResponse {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  reportFlow: "zone" | "kitchen";
  sections: ReportSection[];
}

async function buildItemBySectionGrouped(
  businessIds: string[],
  from: number,
  to: number,
): Promise<BusinessItemBySectionResponse[]> {
  const paymentFilter = {
    businessId: { $in: businessIds },
    isDeleted: false,
    date: { $gte: from, $lte: to },
    "billItems.0": { $exists: true },
  };

    const [allPayments, dishZoneKitchenMappings, bizDocs, kitchenDocs] =
      await Promise.all([
        Payment.find(paymentFilter)
          .lean()
          .select(
            "businessId date tableName billItems billValue discount claimedCoins couponDiscount serviceCharge total mode splitModes settleType",
          ) as Promise<PaymentType[]>,
        DishZoneKitchen.find({ businessId: { $in: businessIds } })
          .lean()
          .select({
            dishId: 1,
            zoneId: 1,
            kitchenId: 1,
            businessId: 1,
          }) as Promise<DishZoneKitchenMapping[]>,
        Business.find({ _id: { $in: businessIds } })
          .lean()
          .select({ name: 1 }),
        Kitchen.find({ businessId: { $in: businessIds } })
          .lean()
          .select({ name: 1, businessId: 1 }),
      ]);

    const itemPayments = filterPaymentsForItemReports(allPayments);

    const nameMap: Record<string, string> = {};
    for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

    const kitchenIdToName: Record<string, string> = {};
    for (const k of kitchenDocs) {
      kitchenIdToName[k._id.toString()] = k.name ?? k._id.toString();
    }

    const tableNames = Array.from(
      new Set(itemPayments.map((p) => p.tableName).filter(Boolean)),
    );
    const tables = await Table.find({
      businessId: { $in: businessIds },
      name: { $in: tableNames },
    })
      .lean()
      .select({ name: 1, businessId: 1, zoneId: 1, internalZoneId: 1 });

    const tableToZoneMap: Record<string, Record<string, string>> = {};
    const zoneIds = new Set<string>();
    for (const table of tables) {
      const bizId = table.businessId.toString();
      if (!tableToZoneMap[bizId]) tableToZoneMap[bizId] = {};
      const zoneId =
        table.internalZoneId?.toString() || table.zoneId?.toString() || null;
      if (zoneId) {
        tableToZoneMap[bizId][table.name] = zoneId;
        zoneIds.add(zoneId);
      }
    }
    for (const m of dishZoneKitchenMappings) {
      const zid =
        typeof m.zoneId === "string" ? m.zoneId : m.zoneId?.toString?.();
      if (zid) zoneIds.add(zid);
    }

    const zoneDocs =
      zoneIds.size > 0
        ? await Zone.find({ _id: { $in: Array.from(zoneIds) } })
            .lean()
            .select({ name: 1 })
        : [];
    const zoneIdToName: Record<string, string> = {};
    for (const z of zoneDocs) {
      zoneIdToName[z._id.toString()] = z.name ?? z._id.toString();
    }
    for (const id of zoneIds) {
      if (!zoneIdToName[id]) zoneIdToName[id] = id;
    }

    const getZoneIdFromPayment = (payment: PaymentType): string | null => {
      const bizId =
        typeof payment.businessId === "string"
          ? payment.businessId
          : (payment.businessId as { toString(): string }).toString();
      return tableToZoneMap[bizId]?.[payment.tableName] ?? null;
    };

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

    const grouped: BusinessItemBySectionResponse[] = businessIds.map((biz) => {
      const payments = paymentsByBiz[biz] ?? [];
      const useZoneMode = hasDzkForBusiness(biz, dishZoneKitchenMappings);

      if (useZoneMode) {
        const rows = aggregateZoneWise(
          payments,
          getZoneIdFromPayment,
          zoneIdToName,
        );
        const bySection: Record<string, SectionItemRow[]> = {};
        for (const r of rows) {
          const zoneName = r.zoneNames?.[0] ?? "—";
          if (!bySection[zoneName]) bySection[zoneName] = [];
          bySection[zoneName].push({
            itemName: r.itemName,
            categoryId: r.categoryId ?? "",
            itemCount: r.itemCount,
            amount: r.amount,
            discount: r.discount,
            tax: r.tax,
            totalSales: r.netRevenue,
          });
        }
        const sections: ReportSection[] = Object.entries(bySection).map(
          ([sectionName, items]) => ({
            sectionId: sectionName,
            sectionName,
            items,
          }),
        );
        return {
          businessId: biz,
          businessName: nameMap[biz] ?? "Unknown",
          from: fromIST,
          to: toIST,
          reportFlow: "zone" as const,
          sections,
        };
      }

      const rows = aggregateKitchenWise(payments, kitchenIdToName);
      const bySection: Record<string, SectionItemRow[]> = {};
      for (const r of rows) {
        const kid = r.kitchenId ?? "unknown";
        const name = r.kitchenName ?? "Unknown Kitchen";
        if (!bySection[kid]) bySection[kid] = [];
        bySection[kid].push({
          itemName: r.itemName,
          categoryId: r.categoryId ?? "",
          itemCount: r.itemCount,
          amount: r.amount,
          discount: r.discount,
          tax: r.tax,
          totalSales: r.netRevenue,
        });
      }
      const sections: ReportSection[] = Object.entries(bySection).map(
        ([sectionId, items]) => ({
          sectionId,
          sectionName: kitchenIdToName[sectionId] ?? sectionId,
          items,
        }),
      );

      return {
        businessId: biz,
        businessName: nameMap[biz] ?? "Unknown",
        from: fromIST,
        to: toIST,
        reportFlow: "kitchen" as const,
        sections,
      };
    });

  return grouped;
}

const itemBySectionRouter = new Hono()

  .post("/", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    const grouped = await buildItemBySectionGrouped(businessIds, from, to);
    return respond(
      c,
      "Item by areas report fetched successfully",
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

    const grouped = await buildItemBySectionGrouped(businessIds, from, to);
    const { workbook } = createReportWorkbook("Item by Areas");
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error("Sheet not created");

    const header = [
      "Item Name",
      "Quantity",
      "Amount",
      "Discount",
      "Tax",
      "Total Sales",
    ];

    for (const biz of grouped) {
      sheet.addRow([]);
      sheet.addRow([`Business: ${biz.businessName} (${biz.businessId})`]);
      sheet.addRow([`From: ${biz.from}  To: ${biz.to}`]);
      sheet.addRow([`Report flow: ${biz.reportFlow}`]);
      sheet.addRow([]);

      for (const section of biz.sections) {
        sheet.addRow([`${biz.reportFlow === "zone" ? "Zone" : "Kitchen"}: ${section.sectionName}`]);
        addBoldHeaderRow(sheet, header);
        for (const row of section.items) {
          sheet.addRow([
            row.itemName,
            row.itemCount,
            row.amount,
            row.discount,
            row.tax,
            row.totalSales,
          ]);
        }
        sheet.addRow([]);
      }
    }

    const fromIST = formatToIST(from);
    const toIST = formatToIST(to);
    const filename = `Item by Areas ${fromIST} to ${toIST}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();

    c.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8",
    );
    c.header(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    return c.body(buffer);
  });

export default itemBySectionRouter;
