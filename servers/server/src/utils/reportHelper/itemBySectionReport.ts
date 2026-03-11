import type { Workbook } from "exceljs";
import type { Payment as PaymentType } from "./itemType";
import type { DishZoneKitchenMapping } from "./itemReport";
import {
  aggregateKitchenWise,
  aggregateZoneWise,
  hasDzkForBusiness,
} from "./itemReport";
import { filterPaymentsForItemReports } from "./itemFinancialCalculator";
import { formatDateToIST } from "./dateFormater";
import { addBoldHeaderRow } from "./excelUtils";

export interface SectionItemRow {
  itemName: string;
  categoryId: string;
  itemCount: number;
  amount: number;
  discount: number;
  tax: number;
  totalSales: number;
}

export interface ReportSection {
  sectionId: string;
  sectionName: string;
  items: SectionItemRow[];
}

export interface BusinessItemBySectionResponse {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  reportFlow: "zone" | "kitchen";
  sections: ReportSection[];
}

/**
 * Build Item by Areas grouped data from already-fetched context (e.g. for combined report).
 * Filters payments with filterPaymentsForItemReports, then aggregates zone-wise or kitchen-wise.
 */
export function buildItemBySectionGroupedFromContext(
  allPayments: unknown[],
  businessIds: string[],
  from: number,
  to: number,
  bizNameMap: Record<string, string>,
  tableToZoneMap: Record<string, Record<string, string>>,
  zoneIdToName: Record<string, string>,
  kitchenIdToName: Record<string, string>,
  dishZoneKitchenMappings: DishZoneKitchenMapping[],
): BusinessItemBySectionResponse[] {
  const itemPayments = filterPaymentsForItemReports(
    allPayments as PaymentType[],
  );

  const getZoneIdFromPayment = (payment: PaymentType): string | null => {
    const bizId =
      typeof payment.businessId === "string"
        ? payment.businessId
        : (payment.businessId as { toString(): string }).toString();
    const tableName = (payment as { tableName?: string }).tableName ?? "";
    return tableToZoneMap[bizId]?.[tableName] ?? null;
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
        businessName: bizNameMap[biz] ?? "Unknown",
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
      businessName: bizNameMap[biz] ?? "Unknown",
      from: fromIST,
      to: toIST,
      reportFlow: "kitchen" as const,
      sections,
    };
  });

  return grouped;
}

const ITEM_BY_AREAS_HEADER = [
  "Item Name",
  "Quantity",
  "Amount",
  "Discount",
  "Tax",
  "Total Sales",
];

/**
 * Add one "Item by Areas" sheet to an existing workbook from pre-built grouped data.
 */
export function buildItemBySectionSheet(
  workbook: Workbook,
  grouped: BusinessItemBySectionResponse[],
): void {
  const sheet = workbook.addWorksheet("Item by Areas");

  for (const biz of grouped) {
    sheet.addRow([]);
    sheet.addRow([`Business: ${biz.businessName} (${biz.businessId})`]);
    sheet.addRow([`From: ${biz.from}  To: ${biz.to}`]);
    sheet.addRow([`Report flow: ${biz.reportFlow}`]);
    sheet.addRow([]);

    for (const section of biz.sections) {
      sheet.addRow([
        `${biz.reportFlow === "zone" ? "Zone" : "Kitchen"}: ${section.sectionName}`,
      ]);
      addBoldHeaderRow(sheet, ITEM_BY_AREAS_HEADER);
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
}
