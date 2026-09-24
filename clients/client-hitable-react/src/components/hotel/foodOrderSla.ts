import type { Alert } from '../types/hotelData';

const FOOD_ORDER_ACCEPTANCE_FALLBACK_MINS = 0.5;
const FOOD_ORDER_FULFILLMENT_FALLBACK_MINS = 30;

const positiveNumberOr = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const resolveFoodOrderSla = (
  alert: Pick<Alert, 'cart' | 'foodOrderSlaSnapshot' | 'foodOrderSlaSettings'>,
) => {
  const hasCart = Array.isArray(alert.cart) && alert.cart.length > 0;
  if (!hasCart) return { acceptanceMins: 0, fulfillmentMins: 0 };

  // Prefer the values captured when the order was created. Hydrated settings
  // are only a fallback for older alerts that predate SLA snapshots.
  const settings = alert.foodOrderSlaSnapshot ?? alert.foodOrderSlaSettings;
  const acceptanceMins = positiveNumberOr(settings?.avgAcceptanceTime, FOOD_ORDER_ACCEPTANCE_FALLBACK_MINS);
  const defaultFulfillmentMins = positiveNumberOr(settings?.avgDeliveryTime, FOOD_ORDER_FULFILLMENT_FALLBACK_MINS);
  const effectiveFulfillmentMins = Number(settings?.effectiveFulfillmentTime);
  const longestItemPrepMins = alert.cart.reduce(
    (max, item) => Math.max(max, positiveNumberOr(item?.dish?.avgPrepTime, 0)),
    0,
  );
  const fulfillmentMins =
    Number.isFinite(effectiveFulfillmentMins) && effectiveFulfillmentMins > 0
      ? effectiveFulfillmentMins
      : settings?.useItemPrepTime !== false && longestItemPrepMins > 0
        ? longestItemPrepMins
        : defaultFulfillmentMins;

  return { acceptanceMins, fulfillmentMins };
};
