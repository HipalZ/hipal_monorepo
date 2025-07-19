// utils/reportHelper/categoryReport.ts

import { Category } from "@hi/db-models";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { type AggregatedItem, aggregateBillItems } from "./itemReport";

export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  categoryCount: number;
  totalAmount: number;
  totalDiscount: number;
  totalTax: number;
}

type CatGroup = {
  categoryCount: number;
  totalAmount: number;
  totalDiscount: number;
  totalTax: number;
};

export async function buildCategoryReport(
  payments: PaymentType[],
): Promise<CategoryReport[]> {
  // 1) get per‑dish aggregations
  const items: AggregatedItem[] = aggregateBillItems(payments);

  // 2) bucket into categories
  const catMap = items.reduce<Record<string, CatGroup>>((acc, it) => {
    const catId = it.categoryId ?? "uncategorized";
    if (!acc[catId]) {
      acc[catId] = {
        categoryCount: 0,
        totalAmount: 0,
        totalDiscount: 0,
        totalTax: 0,
      };
    }
    const grp = acc[catId];
    grp.categoryCount += it.itemCount;
    grp.totalAmount += it.amount;
    grp.totalDiscount += it.discount;
    grp.totalTax += it.tax;
    return acc;
  }, {});

  // 3) fetch category names in one go
  const catIds = Object.keys(catMap).filter((id) => id !== "uncategorized");
  const categories = await Category.find({ _id: { $in: catIds } })
    .lean()
    .select({ name: 1 });

  const nameById = categories.reduce<Record<string, string>>((m, c) => {
    m[c._id.toString()] = c.name;
    return m;
  }, {});

  // 4) shape final array (no items), sorted desc by categoryCount
  return Object.entries(catMap)
    .map<CategoryReport>(([catId, grp]) => ({
      categoryId: catId,
      categoryName: nameById[catId] || "Unknown",
      categoryCount: grp.categoryCount,
      totalAmount: grp.totalAmount,
      totalDiscount: grp.totalDiscount,
      totalTax: Number(grp.totalTax.toFixed(2)),
    }))
    .sort((a, b) => b.categoryCount - a.categoryCount);
}
