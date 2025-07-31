import { ItemDiscount } from "@hi/db-models";

async function applyItemDiscountsIndividually(tableSession: unknown) {
  const { dishIds, discount } = tableSession as unknown as {
    dishIds: string[];
    discount: number;
  };
  if (!dishIds.length) return;

  const perItemDiscount = discount / dishIds.length;
  const timestamp = Date.now();

  for (const dishId of dishIds) {
    const itemDiscount = new ItemDiscount({
      discount: perItemDiscount,
      itemId: dishId,
      date: timestamp,
    });
    await itemDiscount.save();
  }
}

export { applyItemDiscountsIndividually };
