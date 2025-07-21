// utils/reportHelper/categoryReport.ts

import { Category } from "@hi/db-models";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { type AggregatedItem, aggregateBillItems } from "./itemReport";

export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  categoryCount: number;
  itemCount: number;
  totalAmount: number;
  totalDiscount: number;
  totalTax: number;
  totalSales: number;
}

type CatGroup = {
  categoryCount: number;
  totalAmount: number;
  totalDiscount: number;
  totalTax: number;
  itemCount: number;
  totalSales: number;
};

export async function buildCategoryReport(
  payments: PaymentType[],
): Promise<CategoryReport[]> {
  const items: AggregatedItem[] = aggregateBillItems(payments);

  const catMap = items.reduce<Record<string, CatGroup>>((acc, it) => {
    const catId = it.categoryId ?? "uncategorized";
    if (!acc[catId]) {
      acc[catId] = {
        categoryCount: 0,
        itemCount: 0,
        totalAmount: 0,
        totalDiscount: 0,
        totalTax: 0,
        totalSales: 0,
      };
    }
    const grp = acc[catId];
    grp.categoryCount += it.itemCount;
    grp.itemCount += it.itemCount;
    grp.totalAmount += it.amount;
    grp.totalDiscount += it.discount;
    grp.totalTax += it.tax;
    grp.totalSales += it.amount - it.discount + it.tax;
    return acc;
  }, {});

  const catIds = Object.keys(catMap).filter((id) => id !== "uncategorized");
  const categories = await Category.find({ _id: { $in: catIds } })
    .lean()
    .select({ name: 1 });

  const nameById = categories.reduce<Record<string, string>>((m, c) => {
    m[c._id.toString()] = c.name;
    return m;
  }, {});

  return Object.entries(catMap)
    .map<CategoryReport>(([catId, grp]) => ({
      categoryId: catId,
      categoryName: nameById[catId] || "Unknown",
      categoryCount: grp.categoryCount,
      totalAmount: grp.totalAmount,
      totalDiscount: grp.totalDiscount,
      itemCount: grp.itemCount,
      totalTax: Number(grp.totalTax.toFixed(2)),
      totalSales: Number(grp.totalSales.toFixed(2)),
    }))
    .sort((a, b) => b.categoryCount - a.categoryCount);
}
