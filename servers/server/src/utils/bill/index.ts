import { UserSession } from "@hi/db-models";
import type { ClientSession } from "mongoose";

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
        console.log("Line total:", lineTotal);

        // Determine GST percentage (prefer gst field)
        const gstPercent = item.dish.gst ?? item.dish.tax ?? 0;
        totalGst += (lineTotal * gstPercent) / 100;
        console.log(
          `GST for item ${item.id} (${item.dish.name}): ${gstPercent}%`,
          (lineTotal * gstPercent) / 100,
        );
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
  dishIds: string[],
): {
  totalDishTotal: number;
  totalGst: number;
} {
  let totalDishTotal = 0;
  let totalGst = 0;

  try {
    for (const kot of kots) {
      for (const item of kot.cart) {
        // Skip deleted items
        if (item.isDeleted || !dishIds.includes(item.dish._id)) continue;

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
        console.log("Line total:", lineTotal);

        // Determine GST percentage (prefer gst field)
        const gstPercent = item.dish.gst ?? item.dish.tax ?? 0;
        totalGst += (lineTotal * gstPercent) / 100;
        console.log(
          `GST for item ${item.id} (${item.dish.name}): ${gstPercent}%`,
          (lineTotal * gstPercent) / 100,
        );
      }
    }
  } catch (err) {
    console.error("Error calculating bill totals:", err);
    throw new Error("Invalid data structure in KOTs");
  }

  return { totalDishTotal, totalGst };
}

// function calculateFinalTotal(
//   subtotal: number,
//   totalDiscount: number,
//   gst: number,
//   serviceCharge: number,
//   otherTax: number,
//   tips: number,
// ) {
//   const total =
//     subtotal - totalDiscount + gst + serviceCharge + otherTax + tips;
//   return Math.round(total); // Round to 2 decimal places
// }

// function calculateTotalDiscount(
//   discount: number,
//   claimedCoins: number,
//   couponDiscount: number,
// ) {
//   const totalDiscount = discount + claimedCoins + couponDiscount;
//   return Math.round(totalDiscount); // Round to 2 decimal places
// }

// Calculate the total discount applied (coins, coupons, etc.)
const calculateTotalDiscount = (
  discount: number,
  claimedCoins: number,
  couponDiscount: number,
) => {
  return Math.round(discount + claimedCoins + couponDiscount);
};

// Calculate the GST for a given subtotal
const calculateGst = (gstPercentage: number, subtotal: number) => {
  return (gstPercentage / 100) * subtotal;
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
  return Math.round(
    subtotal - totalDiscount + gst + serviceCharge + otherTax + tips,
  );
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

export {
  calculateBillDishIds,
  calculateBillTotals,
  calculateFinalTotal,
  calculateGst,
  calculateTotalDiscount,
  updateTableSession,
};
