import { SplitBillTableSession, Tax } from "@hi/db-models";
import type {
  SplitBillTableSessionValidator,
  UserSessionSchemaType,
} from "@hi/db-models/src/validators";
import type { ClientSession } from "mongoose";
import {
  type CartItem,
  calculateFinalTotal,
  calculateGst,
  calculateSplitTotalsFromItems,
  calculateTotalDiscount,
} from "../bill";
function roundToTwoDecimals(value: number): number {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return value > 0 && rounded < 0.01 ? 0.01 : rounded;
}

function splitItemQuantityWithPortionAndPercentage(
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

    updatedItem.quantity = roundToTwoDecimals(
      (updatedItem.quantity ?? 1) * factor,
    );

    updatedItem.extras = updatedItem.extras.map((extra) => ({
      ...extra,

      quantity: roundToTwoDecimals((extra.quantity ?? 1) * factor),
    }));

    return updatedItem;
  });
}

function safeMultiply(value: number | undefined, percentage: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return roundToTwoDecimals(value * (percentage / 100));
}

function splitBillWithPortionAndPercentage(
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
    serviceCharge: safeMultiply(mainTableSession.serviceCharge, percentage),

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
    totalGst: safeMultiply(mainTableSession.totalGst, percentage),
    isUserRegistered: mainTableSession.isUserRegistered,
    discountPercentage: safeMultiply(
      mainTableSession.discountPercentage,
      percentage,
    ),
    splitType: mainTableSession.splitType,
    coinPercentage: safeMultiply(mainTableSession.coinPercentage, percentage),
    couponPercentage: safeMultiply(
      mainTableSession.couponPercentage,
      percentage,
    ),
    itemIds: mainTableSession.itemIds,
    itemGst: safeMultiply(mainTableSession.itemGst, percentage),
    itemGstAfterDiscount: safeMultiply(
      mainTableSession.itemGstAfterDiscount,
      percentage,
    ),

    originTableSessionId: mainTableSession._id,
    variantName,
  };
}

async function saveSplitBillSessionVariant(
  splitBillTableSession: SplitBillTableSessionValidator,
  session: ClientSession,
) {
  const checkAlreadyExist = await SplitBillTableSession.exists({
    variantName: splitBillTableSession.variantName,
    originTableSessionId: splitBillTableSession.originTableSessionId,
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

async function saveItemWiseSplitBillSessionVariant(
  items: CartItem[],
  originBillSession: UserSessionSchemaType,
  variantName: number,
  session: ClientSession,
) {
  const checkAlreadyExist = await SplitBillTableSession.exists({
    originTableSessionId: originBillSession._id,
    variantName: variantName,
  });

  if (checkAlreadyExist) {
    throw new Error("Split bill session already exist");
  }
  const discountPercentage = originBillSession.discountPercentage || 0;
  const coins =
    originBillSession.items && originBillSession.items.length > 0
      ? (originBillSession.claimedCoins / originBillSession.items.length) *
        items.length
      : 0;
  const couponDiscount =
    originBillSession.items && originBillSession.items.length > 0
      ? (originBillSession.couponDiscount / originBillSession.items.length) *
        items.length
      : 0;
  const tips =
    originBillSession.items && originBillSession.items.length > 0
      ? (originBillSession.tips / originBillSession.items.length) * items.length
      : 0;

  const { totalDishTotal, totalGst } = calculateSplitTotalsFromItems(items);

  // const billItems = itemsGroupedByGst(items);

  const discountAppliedBy = originBillSession.discountAppliedBy;
  const discountRemovedBy = originBillSession.discountRemovedBy;
  const serviceChargeAppliedBy = originBillSession.serviceChargeAppliedBy;
  const serviceChargeRemovedBy = originBillSession.serviceChargeRemovedBy;

  const serviceCharge = await Tax.findOne({
    businessId: originBillSession.businessId,
    menuId: items[0].dish.menuId,
    isActive: true,
    name: "servicecharge",
  });

  const serviceChargePercentage = serviceCharge?.value || 0;

  let serviceChargeAmount = Math.round(
    (serviceChargePercentage / 100) * totalDishTotal,
  );
  if (originBillSession.isServiceChargeRemoved) serviceChargeAmount = 0;

  const dis = Math.round((discountPercentage / 100) * totalDishTotal);

  // Calculate discount on the bill
  const discountAmount = Math.min(dis, totalDishTotal - coins - couponDiscount);

  // Calculate GST

  const newSubTotal = totalDishTotal - discountAmount - coins - couponDiscount;
  const newGst = calculateGst(originBillSession.gstPercentage, newSubTotal);

  const totalDis = calculateTotalDiscount(
    discountAmount,
    coins,
    couponDiscount,
  );

  const newTotal = calculateFinalTotal(
    totalDishTotal,
    totalDis,
    newGst,
    serviceChargeAmount,
    0,
    tips,
  );

  const updatePayloadToSaveVariant = {
    businessId: originBillSession.businessId,
    tableName: originBillSession.tableName,
    settleType: originBillSession.settleType,
    date: Date.now(),
    variantName: variantName,
    customerIds: originBillSession.customerIds,
    customerName: originBillSession.customerName,
    phoneNumbers: originBillSession.phoneNumbers,
    gst: Number(newGst.toFixed(2)),
    serviceCharge: Number(serviceChargeAmount.toFixed(2)),
    discount: Number(discountAmount.toFixed(2)),
    tips,
    claimedCoins: Number(coins.toFixed(2)),
    couponId: originBillSession.couponId,
    couponDiscount: Number(couponDiscount.toFixed(2)),
    isDiscountApplied: originBillSession.isDiscountApplied,
    reasonOfDiscount: originBillSession.reasonOfDiscount,
    serviceChargeAppliedBy,
    serviceChargeRemovedBy,
    discountAppliedBy: discountAppliedBy || null,
    discountRemovedBy: discountRemovedBy || null,
    reasonOfServiceCharge: originBillSession.reasonOfServiceCharge,
    discountAppliedOn: originBillSession.discountAppliedOn,
    subTotal: Number(totalDishTotal.toFixed(2)),
    total: newTotal,
    gstPercentage: originBillSession.gstPercentage,
    serviceChargePercentage: serviceChargePercentage,
    items,
    isUserRegistered: originBillSession.isUserRegistered,
    billRequest: originBillSession.billRequest,
    originTableSessionId: originBillSession._id,
    generatedBy: originBillSession.billGeneratedBy,
    totalDishTotal: Number(totalDishTotal.toFixed(2)),
    totalGst: Number(totalGst.toFixed(2)),
  };

  const splitBillTableSession = new SplitBillTableSession(
    updatePayloadToSaveVariant,
  );

  await splitBillTableSession.save({ session });
  if (!splitBillTableSession) {
    throw new Error("Split bill session not created");
  }

  return splitBillTableSession._id;
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
  formatBillOutput,
  saveItemWiseSplitBillSessionVariant,
  saveSplitBillSessionVariant,
  splitBillWithPortionAndPercentage,
  splitItemQuantityWithPortionAndPercentage,
};
