import { SplitBillTableSession } from "@hi/db-models";
import type {
  SplitBillTableSessionValidator,
  UserSessionSchemaType,
} from "@hi/db-models/src/validators";
import type { ClientSession } from "mongoose";
import type { CartItem } from "../bill";
function roundToTwoDecimals(value: number): number {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return value > 0 && rounded < 0.01 ? 0.01 : rounded;
}

function calculateItemWithPortionAndPercentage(
  items: CartItem[],
  percentage: number,
): CartItem[] {
  if (
    !Array.isArray(items) ||
    typeof percentage !== "number" ||
    percentage <= 0
  ) {
    throw new Error(
      "Invalid input: items must be an array and percentage must be a positive number",
    );
  }

  const factor = percentage / 100;

  return items.map((item) => {
    if (item.isDeleted) return item;

    const updatedItem: CartItem = {
      ...item,
      dish: { ...item.dish },
      portion: item.portion ? { ...item.portion } : null,
      extras: item.extras?.map((extra) => ({ ...extra })) || [],
    };

    updatedItem.dish.price = roundToTwoDecimals(
      (updatedItem.dish?.price ?? 0) * factor,
    );

    if (updatedItem.portion?.price != null) {
      updatedItem.portion.price = roundToTwoDecimals(
        updatedItem.portion.price * factor,
      );
    }

    updatedItem.quantity = roundToTwoDecimals(
      (updatedItem.quantity ?? 1) * factor,
    );

    updatedItem.extras = updatedItem.extras.map((extra) => ({
      ...extra,
      price: roundToTwoDecimals((extra.price ?? 0) * factor),
      quantity: roundToTwoDecimals((extra.quantity ?? 1) * factor),
    }));

    return updatedItem;
  });
}

function safeMultiply(value: number | undefined, percentage: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return roundToTwoDecimals(value * (percentage / 100));
}

function calculateBillWithPortionAndPercentage(
  mainTableSession: UserSessionSchemaType,
  percentage: number,
  variantName: number,
) {
  if (typeof percentage !== "number" || percentage <= 0) {
    throw new Error("Invalid percentage: must be a number greater than 0");
  }

  if (!mainTableSession || typeof mainTableSession !== "object") {
    throw new Error("Invalid session object");
  }

  return {
    businessId: mainTableSession.businessId,
    tableName: mainTableSession.tableName,
    settleType: mainTableSession.settleType,
    date: Date.now(),

    // Calculated fields
    subTotal: safeMultiply(mainTableSession.subTotal, percentage),
    gst: safeMultiply(mainTableSession.gst, percentage),
    discount: safeMultiply(mainTableSession.discount, percentage),
    tips: safeMultiply(mainTableSession.tips, percentage),
    claimedCoins: safeMultiply(mainTableSession.claimedCoins, percentage),
    couponDiscount: safeMultiply(mainTableSession.couponDiscount, percentage),

    // Direct copy
    couponId: mainTableSession.couponId,
    isDiscountApplied: mainTableSession.isDiscountApplied,
    reasonOfDiscount: mainTableSession.reasonOfDiscount,
    serviceChargeAppliedBy: mainTableSession.serviceChargeAppliedBy,
    serviceChargeRemovedBy: mainTableSession.serviceChargeRemovedBy,
    discountAppliedBy: mainTableSession.discountAppliedBy,
    discountRemovedBy: mainTableSession.discountRemovedBy,
    reasonOfServiceCharge: mainTableSession.reasonOfServiceCharge,
    discountAppliedOn: mainTableSession.discountAppliedOn,
    gstPercentage: mainTableSession.gstPercentage,
    serviceChargePercentage: mainTableSession.serviceChargePercentage,
    newDishGst: mainTableSession.newDishGst,
    isServiceChargeRemoved: mainTableSession.isServiceChargeRemoved,
    customerIds: mainTableSession.customerIds,
    customerName: mainTableSession.customerName,
    phoneNumbers: mainTableSession.phoneNumbers,
    totalDishTotal: safeMultiply(mainTableSession.subTotal, percentage),
    totalGst: safeMultiply(mainTableSession.gst, percentage),

    originTableSessionId: mainTableSession._id,
    variantName,
  };
}

async function saveSplitBillSessionVariant(
  splitBillTableSession: SplitBillTableSessionValidator,
  session: ClientSession,
) {
  const checkAlreadyExist = await SplitBillTableSession.exists({
    businessId: splitBillTableSession.businessId,
    tableName: splitBillTableSession.tableName,
    variantName: splitBillTableSession.variantName,
  });

  if (checkAlreadyExist) {
    throw new Error("Split bill session already exist");
  }
  const saveTableSession = new SplitBillTableSession(splitBillTableSession);
  await saveTableSession.save({ session });

  if (!saveTableSession) {
    throw new Error("Split bill session not created");
  }

  return saveTableSession._id;
}

function formatBillOutput(original: UserSessionSchemaType, variant: any) {
  return {
    customerName: original.customerName,
    customerPhone: original.phoneNumbers?.[0],
    tableName: original.tableName,
    couponId: original.couponId,
    discountAppliedOn: original.discountAppliedOn,
    reasonOfDiscount: original.reasonOfDiscount,
    reasonOfServiceCharge: original.reasonOfServiceCharge,
    serviceChargeAppliedBy: original.serviceChargeAppliedBy,
    serviceChargeRemovedBy: original.serviceChargeRemovedBy,
    discountAppliedBy: original.discountAppliedBy,
    discountRemovedBy: original.discountRemovedBy,

    billItems: variant.items,
    subTotal: variant.subTotal,
    gst: variant.gst,
    discount: variant.discount,
    claimedCoins: variant.claimedCoins,
    couponDiscount: variant.couponDiscount,
    serviceCharge: variant.serviceCharge,
    tips: variant.tips,
    total: variant.total,
    billId: original?._id?.toString(),
    variantId: variant._id.toString(),
    variantName: variant.variantName,
  };
}

export {
  calculateBillWithPortionAndPercentage,
  calculateItemWithPortionAndPercentage,
  formatBillOutput,
  saveSplitBillSessionVariant,
};
