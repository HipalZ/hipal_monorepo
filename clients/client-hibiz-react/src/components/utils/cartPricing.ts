type CartExtra = {
  price?: number | null;
  quantity?: number | null;
};

type PricedCartItem = {
  dish?: {
    price?: number | null;
  } | null;
  portion?: {
    price?: number | null;
  } | null;
  extras?: CartExtra[] | null;
  quantity?: number | null;
};

const toNumber = (value: number | null | undefined, fallback = 0) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

export const getCartItemUnitPrice = (item: PricedCartItem) => toNumber(item?.portion?.price ?? item?.dish?.price);

export const getCartItemExtrasTotal = (item: PricedCartItem) =>
  item?.extras?.reduce((total, extra) => total + toNumber(extra?.price) * toNumber(extra?.quantity, 1), 0) ?? 0;

export const getCartItemQuantity = (item: PricedCartItem) => toNumber(item?.quantity, 1);

export const getCartItemLineTotal = (item: PricedCartItem) => (getCartItemUnitPrice(item) + getCartItemExtrasTotal(item)) * getCartItemQuantity(item);
