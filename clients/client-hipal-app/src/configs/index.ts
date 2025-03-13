export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV as string;
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;
export const GOOGLE_ANALYTICS = process.env
  .NEXT_PUBLIC_GOOGLE_ANALYTICS as string;
export const BUSINESS_KEYID = process.env.NEXT_PUBLIC_BUSINESS_KEYID as string;

export const OUTLET_ACCESS = {
  FOOD: ["explore", "category", "cart", "couponz", "loyalty"],
  HOTEL: ["booking", "rooms", "amenities"],
  RESTAURENT: ["explore", "category", "reservations"],
  "E-COMMERCE": ["products", "collections", "checkout"],
  CLINIC: ["appointments", "services"],
  COMMON: ["terms", "scan"]
} as const;

export type OutletType = keyof typeof OUTLET_ACCESS;