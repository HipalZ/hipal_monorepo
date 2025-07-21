import type { BillItem, Payment } from "./itemType";

export interface AggregatedItem {
  categoryId: string | null;
  itemName: string;
  itemCount: number;
  quantity: number;
  amount: number;
  discount: number;
  tax: number;
}

export function aggregateBillItems(payments: Payment[]): AggregatedItem[] {
  const groups = payments
    .flatMap((p) => p.billItems)
    .reduce<Record<string, AggregatedItem>>((acc, item: BillItem) => {
      const { dish, portion, extras = [], quantity, discount = 0 } = item;
      const key = dish._id.toString();

      const unitPrice = portion ? portion.price : dish.price;

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
          quantity: 0,
          amount: 0,
          discount: 0,
          tax: 0,
        };
      }

      const grp = acc[key];
      grp.itemCount += 1;
      grp.quantity += quantity;
      grp.discount += discount;
      grp.tax += Number(lineTax?.toFixed(2));

      return acc;
    }, {});

  return Object.values(groups).sort((a, b) => b.itemCount - a.itemCount);
}

export default aggregateBillItems;
