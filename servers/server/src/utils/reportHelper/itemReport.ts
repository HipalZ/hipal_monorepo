import type { BillItem, Payment } from "./itemType";

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
