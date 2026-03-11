/**
 * Parent Category Report
 *
 * Aggregates revenue: Item → Child Category → Parent Category (only this direction).
 * All money is calculated at item level via calculateFinalItemTotals; no duplicate math.
 * Excludes settleType === "DUES_SETTLE". Complementary & NPC handled by calculator.
 *
 * Validation: Σ(parentCategory.finalAmount) ≈ Σ(item.finalAmount) ≈ Sales Total (± round-off).
 */

import type { Workbook } from "exceljs";
import { Category } from "@hi/db-models";
import type { Payment as PaymentType } from "./itemType";
import { calculateFinalItemTotals, filterPaymentsForItemReports } from "./itemFinancialCalculator";
import { OPEN_ITEM_CATEGORY_ID } from "./itemReport";
import type { BaseContext } from "./types";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";

const ROUND_OFF_TOLERANCE = 1.01;

/** One child category's totals (same shape as category report row) */
export interface ChildCategoryTotals {
  categoryId: string;
  categoryName: string;
  itemCount: number;
  grossAmount: number;
  discount: number;
  gst: number;
  serviceCharge: number;
  totalTax: number;
  finalAmount: number; // totalSales = net + GST + service charge
}

/** One parent category row with optional child breakdown */
export interface ParentCategoryReportRow {
  parentCategoryId: string;
  parentCategoryName: string;
  itemCount: number;
  grossAmount: number;
  discount: number;
  gst: number;
  serviceCharge: number;
  totalTax: number;
  finalAmount: number;
  children?: ChildCategoryTotals[];
}

export interface ParentCategoryReportResult {
  parentCategories: ParentCategoryReportRow[];
  childCategoryTotals: ChildCategoryTotals[];
  /** Sum of all item finalItemTotals (for validation) */
  sumItemFinalAmount: number;
  /** Sum of all parent finalAmount (must match sumItemFinalAmount) */
  sumParentFinalAmount: number;
  validationPassed: boolean;
  /** Logged when validation fails */
  validationMessage?: string;
}

type CategoryDoc = {
  _id: { toString(): string };
  name: string;
  parentCategoryIds?: { toString(): string }[];
  businessId?: { toString(): string };
};

/**
 * Step 1: Fetch categories for business(es) and build parentCategoryMap + childToParentMap.
 * - parentCategoryMap: categoryId -> { name, parentCategoryIds }
 * - childToParentMap: childCategoryId -> parentCategoryId (single; first parent or self if top-level)
 */
async function fetchCategoryMaps(
  businessIds: string[],
): Promise<{
  parentCategoryMap: Record<string, { name: string; parentCategoryIds: string[] }>;
  childToParentMap: Record<string, string>;
  categoryNameById: Record<string, string>;
}> {
  const categories = (await Category.find({
    businessId: { $in: businessIds },
    isDeleted: { $ne: true },
  })
    .lean()
    .select({ name: 1, parentCategoryIds: 1 })) as CategoryDoc[];

  const parentCategoryMap: Record<string, { name: string; parentCategoryIds: string[] }> = {};
  const childToParentMap: Record<string, string> = {};
  const categoryNameById: Record<string, string> = {
    uncategorized: "Uncategorized",
    [OPEN_ITEM_CATEGORY_ID]: "Open Item",
  };

  for (const c of categories) {
    const id = c._id.toString();
    const parentIds = (c.parentCategoryIds ?? []).map((p) => p.toString());
    categoryNameById[id] = c.name ?? "Unknown";
    parentCategoryMap[id] = { name: c.name ?? "Unknown", parentCategoryIds: parentIds };
    // Each child maps to exactly one parent for roll-up (no double counting).
    // Top-level category (no parents) is its own "parent" for the report row.
    childToParentMap[id] = parentIds.length > 0 ? parentIds[0]! : id;
  }
  const uncategorizedKey = "uncategorized";
  if (!(uncategorizedKey in childToParentMap)) {
    childToParentMap[uncategorizedKey] = uncategorizedKey;
  }
  if (!(OPEN_ITEM_CATEGORY_ID in childToParentMap)) {
    childToParentMap[OPEN_ITEM_CATEGORY_ID] = OPEN_ITEM_CATEGORY_ID;
  }

  return { parentCategoryMap, childToParentMap, categoryNameById };
}

/**
 * Step 2–4: Build item financials and aggregate Child → Parent.
 * Uses calculateFinalItemTotals only; item → childCategoryId from dish.categoryIds[0].
 */
function aggregateByParentCategory(
  payments: PaymentType[],
  childToParentMap: Record<string, string>,
  categoryNameById: Record<string, string>,
): {
  childTotals: Record<string, ChildCategoryTotals>;
  parentTotals: Record<
    string,
    {
      itemCount: number;
      grossAmount: number;
      discount: number;
      gst: number;
      serviceCharge: number;
      totalTax: number;
      finalAmount: number;
    }
  >;
  sumItemFinalAmount: number;
} {
  const childTotals: Record<
    string,
    {
      itemCount: number;
      grossAmount: number;
      discount: number;
      gst: number;
      serviceCharge: number;
      totalTax: number;
      finalAmount: number;
    }
  > = {};
  let sumItemFinalAmount = 0;

  for (const payment of payments) {
    const billItems = payment.billItems ?? [];
    if (billItems.length === 0) continue;

    const result = calculateFinalItemTotals(billItems, payment);

    if (!result.reconciled) {
      const paymentId =
        (payment as { _id?: { toString?: () => string }; id?: string })._id?.toString?.() ??
        (payment as { id?: string }).id ??
        "unknown";
      console.warn(
        `[Parent Category Report] Payment ${paymentId}: sum(itemFinalTotals)=${result.sumFinalItemTotal} vs payment.total=${result.paymentTotal} diff=${result.reconciliationDiff}`,
      );
    }

    for (let i = 0; i < billItems.length; i++) {
      const item = billItems[i];
      const b = result.items[i];
      const dish = item?.dish;
      const isOpenItem = Boolean((item as { isOpenItem?: boolean }).isOpenItem);
      const childCategoryId = isOpenItem
        ? OPEN_ITEM_CATEGORY_ID
        : dish?.categoryIds?.[0] ?? "uncategorized";
      const childIdStr = typeof childCategoryId === "string" ? childCategoryId : String(childCategoryId);

      if (!childTotals[childIdStr]) {
        childTotals[childIdStr] = {
          itemCount: 0,
          grossAmount: 0,
          discount: 0,
          gst: 0,
          serviceCharge: 0,
          totalTax: 0,
          finalAmount: 0,
        };
      }

      const qty = b.quantity;
      childTotals[childIdStr].itemCount += qty;
      childTotals[childIdStr].grossAmount += b.grossItemValue;
      childTotals[childIdStr].discount += b.itemDiscount;
      childTotals[childIdStr].gst += b.itemGST;
      childTotals[childIdStr].serviceCharge += b.itemServiceCharge;
      childTotals[childIdStr].totalTax += b.totalTax;
      childTotals[childIdStr].finalAmount += b.finalItemTotal;

      sumItemFinalAmount += b.finalItemTotal;
    }
  }

  // Roll up child → parent (each child counts in exactly one parent)
  const parentTotals: Record<
    string,
    {
      itemCount: number;
      grossAmount: number;
      discount: number;
      gst: number;
      serviceCharge: number;
      totalTax: number;
      finalAmount: number;
    }
  > = {};

  for (const [childId, tot] of Object.entries(childTotals)) {
    const parentId = childToParentMap[childId] ?? "uncategorized";
    if (!parentTotals[parentId]) {
      parentTotals[parentId] = {
        itemCount: 0,
        grossAmount: 0,
        discount: 0,
        gst: 0,
        serviceCharge: 0,
        totalTax: 0,
        finalAmount: 0,
      };
    }
    const p = parentTotals[parentId];
    p.itemCount += tot.itemCount;
    p.grossAmount += tot.grossAmount;
    p.discount += tot.discount;
    p.gst += tot.gst;
    p.serviceCharge += tot.serviceCharge;
    p.totalTax += tot.totalTax;
    p.finalAmount += tot.finalAmount;
  }

  return {
    childTotals: Object.fromEntries(
      Object.entries(childTotals).map(([catId, tot]) => [
        catId,
        {
          categoryId: catId,
          categoryName:
            categoryNameById[catId] ??
            (catId === "uncategorized" ? "Uncategorized" : catId === OPEN_ITEM_CATEGORY_ID ? "Open Item" : catId),
          itemCount: tot.itemCount,
          grossAmount: Number(tot.grossAmount.toFixed(2)),
          discount: Number(tot.discount.toFixed(2)),
          gst: Number(tot.gst.toFixed(2)),
          serviceCharge: Number(tot.serviceCharge.toFixed(2)),
          totalTax: Number(tot.totalTax.toFixed(2)),
          finalAmount: Number(tot.finalAmount.toFixed(2)),
        },
      ]),
    ),
    parentTotals,
    sumItemFinalAmount,
  };
}

/**
 * Build Parent Category Report for one business.
 * Same payment filter as Item/Category: filterPaymentsForItemReports (exclude DUES_SETTLE).
 */
export async function buildParentCategoryReport(
  payments: PaymentType[],
  businessIds: string[],
  options?: { includeChildBreakdown?: boolean },
): Promise<ParentCategoryReportResult> {
  const { parentCategoryMap, childToParentMap, categoryNameById } = await fetchCategoryMaps(
    businessIds,
  );

  const { childTotals, parentTotals, sumItemFinalAmount } = aggregateByParentCategory(
    payments,
    childToParentMap,
    categoryNameById,
  );

  const parentCategories: ParentCategoryReportRow[] = Object.entries(parentTotals)
    .map(([parentId, tot]) => {
      const name = parentCategoryMap[parentId]?.name ?? categoryNameById[parentId] ?? parentId;
      const childIdsUnderParent = Object.keys(childToParentMap).filter(
        (childId) => childToParentMap[childId] === parentId,
      );
      const childrenList =
        options?.includeChildBreakdown && childIdsUnderParent.length > 0
          ? childIdsUnderParent.map((cid) => childTotals[cid]).filter(Boolean)
          : undefined;

      return {
        parentCategoryId: parentId,
        parentCategoryName: name,
        itemCount: tot.itemCount,
        grossAmount: Number(tot.grossAmount.toFixed(2)),
        discount: Number(tot.discount.toFixed(2)),
        gst: Number(tot.gst.toFixed(2)),
        serviceCharge: Number(tot.serviceCharge.toFixed(2)),
        totalTax: Number(tot.totalTax.toFixed(2)),
        finalAmount: Number(tot.finalAmount.toFixed(2)),
        children: childrenList,
      };
    })
    .sort((a, b) => b.finalAmount - a.finalAmount);

  const sumParentFinalAmount = parentCategories.reduce((s, r) => s + r.finalAmount, 0);
  const diff = Math.abs(sumItemFinalAmount - sumParentFinalAmount);
  const validationPassed = diff <= ROUND_OFF_TOLERANCE;
  const validationMessage = validationPassed
    ? undefined
    : `Parent report sum (${sumParentFinalAmount.toFixed(2)}) != item sum (${sumItemFinalAmount.toFixed(2)}), diff=${diff.toFixed(2)}`;

  if (!validationPassed) {
    console.warn(
      `[Parent Category Report] Reconciliation failed: ${validationMessage}. Check category hierarchy or payment data.`,
    );
  }

  return {
    parentCategories,
    childCategoryTotals: Object.values(childTotals),
    sumItemFinalAmount: Number(sumItemFinalAmount.toFixed(2)),
    sumParentFinalAmount,
    validationPassed,
    validationMessage,
  };
}

// ---------------------------------------------------------------------------
// Excel sheet for Combine / Unified report
// ---------------------------------------------------------------------------

/**
 * Build "Parent Category Report" sheet for the unified/combine Excel workbook.
 * Same pattern as buildCategorySheet: one sheet, sections per business.
 */
export async function buildParentCategorySheet(
  workbook: Workbook,
  ctx: BaseContext,
): Promise<void> {
  const { businessIds, allPayments, bizNameMap } = ctx;

  const sheet = workbook.addWorksheet("Parent Category Report");

  const itemPayments = filterPaymentsForItemReports(
    allPayments as PaymentType[],
  );

  const paymentsByBiz: Record<string, PaymentType[]> = {};
  for (const id of businessIds) paymentsByBiz[id] = [];
  for (const p of itemPayments) {
    const bid =
      typeof (p as { businessId: unknown }).businessId === "string"
        ? (p as { businessId: string }).businessId
        : (p as { businessId: { toString(): string } }).businessId.toString();
    if (!paymentsByBiz[bid]) paymentsByBiz[bid] = [];
    paymentsByBiz[bid].push(p);
  }

  const header = [
    "Parent Category",
    "Quantity",
    "Gross Amount",
    "Discount",
    "GST",
    "Service Charge",
    "Total Tax",
    "Final Amount",
  ];

  for (const biz of businessIds) {
    const bizName = bizNameMap[biz] ?? "Unknown";
    const result = await buildParentCategoryReport(
      paymentsByBiz[biz] ?? [],
      [biz],
      { includeChildBreakdown: false },
    );

    sheet.addRow([]);
    addKeyValueRow(sheet, "BusinessId", biz);
    addKeyValueRow(sheet, "BusinessName", bizName);
    addKeyValueRow(sheet, "Sum Item Final", result.sumItemFinalAmount);
    addKeyValueRow(sheet, "Sum Parent Final", result.sumParentFinalAmount);
    addKeyValueRow(sheet, "Validation", result.validationPassed ? "OK" : "FAIL");
    if (result.validationMessage) {
      addKeyValueRow(sheet, "Validation Message", result.validationMessage);
    }

    sheet.addRow([]);
    addBoldHeaderRow(sheet, header);

    for (const row of result.parentCategories) {
      sheet.addRow([
        row.parentCategoryName,
        row.itemCount,
        row.grossAmount,
        row.discount,
        row.gst,
        row.serviceCharge,
        row.totalTax,
        row.finalAmount,
      ]);
    }

    sheet.addRow([]);
  }

  autoFitColumns(sheet);
}
