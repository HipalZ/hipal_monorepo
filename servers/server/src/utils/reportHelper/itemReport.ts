import type { BillItem, Payment } from "./itemType";
import { formatToIST } from "../../utils/reportHelper/dateFormater";
import type { Workbook } from "exceljs";
import type { BaseContext } from "./types";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";

export interface AggregatedItem {
  categoryId: string | null;
  itemName: string;
  itemCount: number;
  amount: number;
  discount: number;
  tax: number;
  // quantity: number;
  totalSales: number;
  kitchenId?: string;
}

export async function buildItemSheet(workbook: Workbook, ctx: BaseContext) {
  const {
    businessIds,
    allPayments,
    bizNameMap,
    kitchenNameMapByBiz,
    from,
    to,
  } = ctx;

  const sheet = workbook.addWorksheet("Item Report");

  const itemEligiblePayments = allPayments.filter(
    (p) => p.billItems && p.billItems.length > 0,
  ) as Payment[];

  const paymentsByBiz: Record<string, Payment[]> = {};
  for (const id of businessIds) paymentsByBiz[id] = [];
  for (const p of itemEligiblePayments) {
    const bid = (p as any).businessId.toString();
    if (!paymentsByBiz[bid]) paymentsByBiz[bid] = [];
    paymentsByBiz[bid].push(p);
  }

  const header = [
    "Name",
    "No.of Orders",
    "Net Amount",
    "Total Discount",
    "Total Tax",
    "Total Sales",
  ];

  for (const biz of businessIds) {
    const bizName = bizNameMap[biz] ?? "Unknown";
    const payments = paymentsByBiz[biz] || [];
    const kitchenNameMap = kitchenNameMapByBiz[biz] || {};

    type AggItem = {
      itemName: string;
      kitchenId: string;
      itemCount: number;
      amount: number;
      discount: number;
      tax: number;
      totalSales: number;
    };

    const byKitchen: Record<string, AggItem[]> = {};
    const overallTotals = {
      itemCount: 0,
      amount: 0,
      discount: 0,
      tax: 0,
      totalSales: 0,
    };

    for (const payment of payments as any[]) {
      for (const bi of payment.billItems || []) {
        const itemName = bi.dish.name;
        const dish = bi.dish;
        const portion = bi.portion;
        const extras = bi.extras || [];
        const quantity = bi.quantity;
        const discount = bi.discount || 0;

        const unitPrice = portion ? portion.price : dish.price;
        const kitchenId = dish.kitchenId;

        const extrasTotal = extras.reduce(
          (sum: number, e: any) => sum + (e.price || 0) * (e.quantity || 1),
          0,
        );

        const lineAmountExclTax = (unitPrice + extrasTotal) * quantity;
        const lineTax = lineAmountExclTax * (dish.gst / 100);

        if (!byKitchen[kitchenId]) byKitchen[kitchenId] = [];
        let agg = byKitchen[kitchenId].find((x) => x.itemName === itemName);
        if (!agg) {
          agg = {
            itemName,
            kitchenId,
            itemCount: 0,
            amount: 0,
            discount: 0,
            tax: 0,
            totalSales: 0,
          };
          byKitchen[kitchenId].push(agg);
        }

        const qty = (bi as any).itemCount ?? (bi as any).quantity ?? 0;

        agg.itemCount += qty;
        agg.amount += bi.dish.price || 0;
        agg.discount += bi.discount || 0;
        agg.tax += Number(lineTax?.toFixed(2)) || 0;
        agg.totalSales +=
          Number((lineAmountExclTax + lineTax - discount).toFixed(2)) || 0;

        overallTotals.itemCount += qty;
        overallTotals.amount += Number(lineAmountExclTax?.toFixed(2));
        overallTotals.discount += bi.discount || 0;
        overallTotals.tax += Number(lineTax?.toFixed(2)) || 0;
        overallTotals.totalSales +=
          Number((lineAmountExclTax - discount + lineTax)?.toFixed(2)) || 0;
      }
    }

    const allItems: AggItem[] = [];
    const kitchenIds = Object.keys(byKitchen);
    for (const kId of kitchenIds) {
      allItems.push(...byKitchen[kId]);
    }

    let topItem: AggItem | null = allItems.length > 0 ? allItems[0] : null;
    let lowestItem: AggItem | null = allItems.length > 0 ? allItems[0] : null;

    for (let i = 1; i < allItems.length; i++) {
      const it = allItems[i];
      if (topItem && it.totalSales > topItem.totalSales) {
        topItem = it;
      }
      if (lowestItem && it.totalSales < lowestItem.totalSales) {
        lowestItem = it;
      }
    }

    type KitchenSummary = {
      kitchenId: string;
      kitchenName: string;
      qty: number;
      net: number;
    };

    const kitchenSummary: KitchenSummary[] = [];

    for (const kitchenId of kitchenIds) {
      const items = byKitchen[kitchenId];
      if (!items || items.length === 0) continue;

      const kitchenName = kitchenNameMap[kitchenId] ?? "Unknown Kitchen";

      let qty = 0;
      let net = 0;
      for (const it of items) {
        qty += it.itemCount || 0;
        net += it.totalSales || 0;
      }

      kitchenSummary.push({
        kitchenId,
        kitchenName,
        qty,
        net,
      });
    }

    let topKitchen: KitchenSummary | null =
      kitchenSummary.length > 0 ? kitchenSummary[0] : null;

    for (let i = 1; i < kitchenSummary.length; i++) {
      const k = kitchenSummary[i];
      if (topKitchen && k.qty > topKitchen.qty) {
        topKitchen = k;
      }
    }

    sheet.addRow([]);
    addKeyValueRow(sheet, "BusinessId", biz);
    addKeyValueRow(sheet, "BusinessName", bizName);
    addKeyValueRow(sheet, "Total Quantity", overallTotals.itemCount);
    addKeyValueRow(sheet, "Total Amount", overallTotals.amount);
    addKeyValueRow(sheet, "Total Discount", overallTotals.discount);
    addKeyValueRow(sheet, "Total Tax", overallTotals.tax);
    addKeyValueRow(sheet, "Net Revenue", overallTotals.totalSales);

    if (topItem) {
      const row = sheet.addRow([
        "Top Item",
        topItem.itemName,
        topItem.totalSales,
      ]);
      row.getCell(1).font = { ...(row.getCell(1).font || {}), bold: true };
    }

    if (lowestItem) {
      const row = sheet.addRow([
        "Lowest Item",
        lowestItem.itemName,
        lowestItem.totalSales,
      ]);
      row.getCell(1).font = { ...(row.getCell(1).font || {}), bold: true };
    }

    sheet.addRow([]);

    if (kitchenSummary.length > 0) {
      sheet.addRow(["Kitchen Summary"]);
      addBoldHeaderRow(sheet, [
        "Kitchen",
        "Total Quantity",
        "Net Revenue",
        "Flag",
      ]);

      for (const k of kitchenSummary) {
        sheet.addRow([
          k.kitchenName,
          k.qty,
          k.net,
          topKitchen && k.kitchenId === topKitchen.kitchenId
            ? "Top kitchen"
            : "",
        ]);
      }

      sheet.addRow([]);
    }

    addKeyValueRow(sheet, "from", formatToIST(from, true));
    addKeyValueRow(sheet, "to", formatToIST(to, true));
    sheet.addRow([]);

    for (const kitchenId of kitchenIds) {
      const items = byKitchen[kitchenId];
      if (!items || items.length === 0) continue;

      const kitchenName = kitchenNameMap[kitchenId] ?? "Unknown Kitchen";

      sheet.addRow(["Kitchen", kitchenName]);
      addBoldHeaderRow(sheet, header);

      for (const it of items) {
        sheet.addRow([
          it.itemName,
          it.itemCount,
          it.amount,
          it.discount,
          it.tax,
          it.totalSales,
        ]);
      }

      sheet.addRow([]);
    }

    sheet.addRow([
      "Overall Summary",
      overallTotals.itemCount,
      overallTotals.amount,
      overallTotals.discount,
      overallTotals.tax,
      overallTotals.totalSales,
    ]);
  }

  autoFitColumns(sheet);
}

export function aggregateBillItems(payments: Payment[]): AggregatedItem[] {
  const groups = payments
    .flatMap((p) => p.billItems)
    .reduce<Record<string, AggregatedItem>>((acc, item: BillItem) => {
      const { dish, portion, extras = [], quantity, discount = 0 } = item;
      if (!dish || !dish._id) return acc;
      const key = dish._id.toString();

      const unitPrice = portion ? portion.price : dish.price;
      const kitchenId = dish.kitchenId;

      const extrasTotal = extras.reduce(
        (sum, e) => sum + (e.price || 0) * (e.quantity || 1),
        0,
      );

      const lineAmountExclTax = (unitPrice + extrasTotal) * quantity;
      const lineTax = lineAmountExclTax * (dish.gst / 100);

      if (!acc[key]) {
        acc[key] = {
          categoryId: dish.categoryIds[0] || null,
          itemName: dish.name,
          itemCount: 0,
          // quantity: 0,
          amount: 0,
          discount: 0,
          tax: 0,
          totalSales: 0,
        };
      }

      const grp = acc[key];
      grp.itemCount += quantity;
      // grp.quantity += quantity;
      grp.discount += discount;
      grp.tax += Number(lineTax?.toFixed(2));
      grp.amount += Number(lineAmountExclTax?.toFixed(2));
      grp.totalSales += Number(
        (lineAmountExclTax - discount + lineTax)?.toFixed(2),
      );
      grp.kitchenId = kitchenId;

      return acc;
    }, {});

  return Object.values(groups).sort((a, b) => b.itemCount - a.itemCount);
}

export default aggregateBillItems;
