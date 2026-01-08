import { DishZoneKitchen, Zone } from '@hi/db-models';
import type { CartItem } from '../../utils/bill';

const assignKitchenToDish = async (zoneId: string, businessId: string, cart: CartItem[]) => {
  const zoneInfo = await Zone.findOne({ zoneId: zoneId });
  if (!zoneInfo) {
    throw new Error('Zone not found');
  }
  for (const dish of cart) {
    const dishId = dish.dish._id;
    if (!dishId) {
      throw new Error('DishId not found in cart');
    }
    const dishZoneKitchen = await DishZoneKitchen.findOne({
      dishId,
      zoneId: zoneInfo._id,
    });

    dish.dish.kitchenId = dishZoneKitchen?.kitchenId?.toString() || dish.dish.kitchenId;
  }
  return cart;
};

export default assignKitchenToDish;
