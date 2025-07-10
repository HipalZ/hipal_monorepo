import { UserSession } from "@hi/db-models";
import type { ClientSession } from "mongoose";
import type { BillGroup, Item } from "../billTypes";

// Reference to a business populated with name
export interface BusinessRef {
  _id: string;
  name: string;
}

// A single extra/add-on on a cart item
export interface Extra {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// A portion option for a dish (when portions.length > 0)
export interface Portion {
  _id: string;
  name: string;
  price: number;
  default: boolean;
  portionTypes: string[]; // e.g. ["VEG"]
  createdAt: string; // or Date
  updatedAt: string; // or Date
}

// The core dish definition
export interface Dish {
  _id: string;
  businessId: string;
  posDishId: string;
  __v: number;
  availability: boolean;
  categoryIds: string[];
  createdAt: string; // or Date
  updatedAt: string; // or Date
  name: string;
  description: string;
  dishTypes: string[]; // e.g. ["VEG"]
  ignoreDiscount: string; // "0" or "1"
  ignoreTax: string; // "0" or "1"
  images: [string]; // adjust if you have a specific image type
  isDeleted: boolean;
  menuId: string;
  portions: Portion[];
  pos: boolean;
  posTax: string; // comma-separated POS tax IDs
  price: number;
  rank: number;
  tags: string[];
  visibility: boolean;
  active: boolean;
  kitchenId: string;
  tax: number; // tax percentage
  gst?: number; // optional GST percentage
}

// One line in the cart
export interface CartItem {
  _id: string;
  id: string; // composed ID string
  dish: Dish;
  portion: Portion | null;
  extras: Extra[];
  quantity: number;
  isDeleted: boolean;
}

// The KOT (Kitchen Order Ticket) document
export interface KotOrderTypes {
  _id: string;
  businessId: BusinessRef;
  userId: string;
  phone: string;
  tableName: string;
  tableId: string;
  cart: CartItem[];
  date: number; // timestamp
  rejected: boolean;
  accepted: boolean;
  edited: boolean;
  settled: boolean;
  name: string; // customer or order name
  transferd: boolean;
  fromTable: string;
  toTable: string;
  unSettled: boolean;
  message: string;
  bill: boolean;
  isDeleted: boolean;
  createdAt: string; // or Date
  updatedAt: string; // or Date
  __v: number;
}

function calculateBillTotals(kots: KotOrderTypes[]): {
  totalDishTotal: number;
  totalGst: number;
} {
  let totalDishTotal = 0;
  let totalGst = 0;

  try {
    for (const kot of kots) {
      for (const item of kot.cart) {
        // Skip deleted items
        if (item.isDeleted) continue;

        // Base price comes from portion if present, otherwise dish.price
        const basePrice = item.portion?.price ?? item.dish.price;

        // Sum up all extras (price * quantity)
        const extrasTotal = item.extras.reduce(
          (sum, ex) => sum + ex.price * ex.quantity,
          0,
        );

        // Line total for this item
        const lineTotal = (basePrice + extrasTotal) * item.quantity;
        totalDishTotal += lineTotal;

        // Determine GST percentage (prefer gst field)
        const gstPercent = item.dish.gst || 0;
        totalGst += (lineTotal * gstPercent) / 100;
      }
    }
  } catch (err) {
    console.error("Error calculating bill totals:", err);
    throw new Error("Invalid data structure in KOTs");
  }

  return { totalDishTotal, totalGst };
}

function calculateBillDishIds(
  kots: KotOrderTypes[],
  itemIds: string[],
): {
  totalDishTotal: number;
  totalGst: number;
} {
  let totalDishTotal = 0;
  let totalGst = 0;

  // for faster lookups
  const allowed = new Set(itemIds);

  try {
    for (const kot of kots) {
      for (const item of kot.cart) {
        // Skip deleted items
        if (item.isDeleted) continue;
        // Only include if this item's id is in our list
        if (!allowed.has(item._id.toString())) continue;

        // Base price comes from portion if present, otherwise dish.price
        const basePrice = item.portion?.price ?? item.dish.price;

        // Sum up all extras (price * quantity)
        const extrasTotal = item.extras.reduce(
          (sum, ex) => sum + ex.price * ex.quantity,
          0,
        );

        // Line total for this item
        const lineTotal = (basePrice + extrasTotal) * item.quantity;
        totalDishTotal += lineTotal;

        // Determine GST percentage (prefer gst field)
        const gstPercent = item.dish.gst ?? item.dish.tax ?? 0;
        totalGst += (lineTotal * gstPercent) / 100;
      }
    }
  } catch (err) {
    console.error("Error calculating bill totals:", err);
    throw new Error("Invalid data structure in KOTs");
  }

  return { totalDishTotal, totalGst };
}

const calculateTotalDiscount = (
  discount: number,
  claimedCoins: number,
  couponDiscount: number,
) => {
  const dis = Math.round(discount + claimedCoins + couponDiscount);
  if (dis < 0) return 0;
  return dis;
};

// Calculate the GST for a given subtotal
const calculateGst = (gstPercentage: number, subtotal: number) => {
  const gst = (gstPercentage / 100) * subtotal;
  if (gst < 0.5) return 0;
  return gst;
};

// Calculate the final total after applying all discounts, GST, service charge, etc.
const calculateFinalTotal = (
  subtotal: number,
  totalDiscount: number,
  gst: number,
  serviceCharge: number,
  otherTax: number,
  tips: number,
) => {
  const total = Math.round(
    subtotal - totalDiscount + gst + serviceCharge + otherTax + tips,
  );
  if (total < 0) return 0;
  return total;
};

// Reusable function to update table session after applying or removing discounts
const updateTableSession = async (
  businessId: string,
  tableName: string,
  session: ClientSession,
  updatedFields: object,
) => {
  return await UserSession.findOneAndUpdate(
    { businessId, tableName },
    { $set: updatedFields },
    { session, new: true },
  );
};

const billPrintItems = (cartItems: CartItem[]) => {
  return cartItems.map((item) => {
    // pick the correct price
    const price = item.portion ? item.portion.price : item.dish.price;

    // build the name, appending the portion in parentheses if present
    const name = item.portion
      ? `${item.dish.name} (${item.portion.name})`
      : item.dish.name;

    return {
      dish: {
        name,
        price,
        quantity: item.quantity,
      },
      extras: item.extras.map((extra) => ({
        name: extra.name,
        price: extra.price,
        quantity: extra.quantity,
      })),
    };
  });
};

///

export function groupItemsByGST(items: Item[]): BillGroup[] {
  const map = items.reduce<Record<number, BillGroup>>((acc, item) => {
    const rate = item.dish.gst ?? 0;

    if (!acc[rate]) {
      acc[rate] = {
        gst: rate,
        subTotal: 0,
        totalGst: 0,
        items: [],
      };
    }

    // Pick the right base price
    const basePrice = item.portion?.price ?? item.dish.price;

    // Compute total extras per unit
    const extrasPerUnit = item.extras.reduce(
      (sum, ex) => sum + ex.price * ex.quantity,
      0,
    );

    // Net total for this item (without tax)
    const netTotal = (basePrice + extrasPerUnit) * item.quantity;

    // Accumulate
    acc[rate].subTotal += netTotal;
    acc[rate].totalGst += netTotal * (rate / 100);
    acc[rate].items.push(item);

    return acc;
  }, {});

  // Round to two decimal places
  return Object.values(map).map((group) => ({
    gst: group.gst,
    subTotal: Number(group.subTotal.toFixed(2)),
    totalGst: Number(group.totalGst.toFixed(2)),
    items: group.items,
  }));
}

export {
  billPrintItems,
  calculateBillDishIds,
  calculateBillTotals,
  calculateFinalTotal,
  calculateGst,
  calculateTotalDiscount,
  updateTableSession,
};
