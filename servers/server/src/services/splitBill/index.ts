import {
  Couponz,
  PaymentAlert,
  SplitBillTableSession,
  Tax,
} from "@hi/db-models";
import type { UserSessionSchemaType } from "@hi/db-models/src/validators";
import type { ClientSession } from "mongoose";
import {
  calculateFinalTotal,
  calculateFinalTotalWithoutRoundOff,
  calculateSplitBillDishIds,
  calculateSplitTotalsFromItems,
  calculateTotalDiscount,
  calculateUpdatedGstAfterDiscount,
  getRoundOff,
  groupSplitItemsByGST,
  itemsGroupedByGst,
  splitCalculateItemUpdated,
  splitCalculateItemUpdatedGstAfterDiscount,
  updateSplitTableSession,
} from "../../utils/bill";

import type { CartItem } from "../../utils/bill";

import type { Item } from "../../utils/billTypes";

const isOriginBillChanged = (original: UserSessionSchemaType) => {
  if (
    original.discount > 0 ||
    original.claimedCoins > 0 ||
    original.couponDiscount > 0 ||
    original.tips > 0 ||
    original.serviceChargeAppliedBy !== null ||
    original.serviceChargeRemovedBy !== null
  ) {
    return true;
  }

  return false;
};

const checkOfflinePaymentRequest = async (
  businessId: string,
  tableName: string,
) => {
  const orderAlreadyExist = await PaymentAlert.findOne({
    businessId,
    tableName,
    alertType: "OFFLINE",
    isAccepted: false,
  });

  if (orderAlreadyExist) {
    return true;
  }

  return false;
};

const checkOriginBillIsSplit = (original?: UserSessionSchemaType) => {
  return original?.isSplit || false;
};

const checkVariantIsPaid = async (originalTableSessionId: string) => {
  const isPaid = await SplitBillTableSession.exists?.({
    originTableSessionId: originalTableSessionId,
    isPaid: true,
  });

  return !!isPaid;
};

const variantIsPaid = async (variantId: string) => {
  const isPaid = await SplitBillTableSession.exists?.({
    _id: variantId,
    isPaid: true,
  });

  return !!isPaid;
};

const returnSplitBillVariants = async (
  originalTableSessionId: string,
  businessId: string,
  tableName: string,
  session: ClientSession,
  billInvoice: number,
) => {
  const fetchVariants = await SplitBillTableSession.find({
    businessId,
    tableName,
    originTableSessionId: originalTableSessionId,
  }).populate({
    path: "discountAppliedBy discountRemovedBy serviceChargeAppliedBy serviceChargeRemovedBy billingUserId",
    select: "name phone",
  });

  const billVariants = [];

  for (let variant of fetchVariants) {
    const cartItems = variant.items as Item[];
    if (!cartItems?.length) continue;

    const totalDishTotal = variant.totalDishTotal || 0;
    const totalGst = variant.totalGst || 0;

    const billItems = groupSplitItemsByGST(cartItems);

    const billingUserName = variant.billingUserId?.name;
    const billingUserPhone = variant.billingUserId?.phone;

    const discountAppliedBy = variant.discountAppliedBy?.name || "";
    const discountRemovedBy = variant.discountRemovedBy?.name || "";
    const serviceChargeAppliedBy = variant.serviceChargeAppliedBy?.name || "";
    const serviceChargeRemovedBy = variant.serviceChargeRemovedBy?.name || "";

    // Get service charge
    let serviceChargeAmount = 0;
    const menuId = cartItems[0]?.dish?.menuId;

    const serviceCharge = await Tax.findOne({
      businessId,
      menuId,
      isActive: true,
      name: "servicecharge",
    });

    const percentage =
      variant.serviceChargePercentage || serviceCharge?.value || 0;
    serviceChargeAmount = (percentage / 100) * totalDishTotal;

    if (variant.isServiceChargeRemoved) {
      serviceChargeAmount = 0;
    }

    // Recalculate GST if needed

    const gst = variant.isDiscountApplied ? variant.gst : totalGst;
    const newGst = gst;

    const totalDis = calculateTotalDiscount(
      variant.discount,
      variant.claimedCoins,
      variant.couponDiscount,
    );

    const newTotal = calculateFinalTotal(
      totalDishTotal,
      totalDis,
      newGst,
      serviceChargeAmount,
      0,
      variant.tips,
    );

    const totalWithoutRoundOff = calculateFinalTotalWithoutRoundOff(
      totalDishTotal,
      totalDis,
      newGst,
      serviceChargeAmount,
      0,
      variant.tips,
    );

    const { type, value } = getRoundOff(totalWithoutRoundOff);

    // Update table session
    variant = await updateSplitTableSession(
      variant._id.toString(),
      {
        gst: Number(newGst.toFixed(2)),
        total: newTotal,
        serviceCharge: Number(serviceChargeAmount?.toFixed(2)),
        billGeneratedBy: variant.generatedBy || "system",
        subTotal: totalDishTotal,
        items: cartItems,
        totalGst: Number(totalGst?.toFixed(2)),
        serviceChargePercentage:
          variant.serviceChargePercentage || serviceCharge?.value || 0,
        billInvoice: billInvoice,
        roundOffType: type,
        roundOffAmount: value,
      },
      session,
    );

    if (!variant) {
      throw new Error("Failed to update split table session");
    }

    billVariants.push({
      customerName: billingUserName || variant.customerName,
      customerPhone: billingUserPhone || variant.phoneNumbers?.[0] || "",
      tableName: variant.tableName,
      couponId: variant.couponId,
      discountAppliedOn: variant.discountAppliedOn,
      reasonOfDiscount: variant.reasonOfDiscount,
      reasonOfServiceCharge: variant.reasonOfServiceCharge,
      serviceChargeAppliedBy,
      serviceChargeRemovedBy,
      discountAppliedBy,
      discountRemovedBy,

      billItems,
      subTotal: totalDishTotal,
      gst: Number(newGst.toFixed(2)),
      discount: variant.discount,
      claimedCoins: variant.claimedCoins,
      couponDiscount: variant.couponDiscount,
      serviceCharge: serviceChargeAmount,
      tips: variant.tips,
      total: newTotal,
      billId: originalTableSessionId,
      variantId: variant._id.toString(),
      variantName: variant.variantName,
      isPaid: variant.isPaid,
      serviceChargePercentage:
        variant.serviceChargePercentage || serviceCharge?.value || 0,
      roundOffType: type,
      roundOffAmount: value,
    });
  }

  return billVariants;
};

const returnSplitBillVariantsForItemWise = async (
  originalTableSessionId: string,
  businessId: string,
  tableName: string,
  session: ClientSession,
  billInvoice: number,
) => {
  const fetchVariants = await SplitBillTableSession.find({
    businessId,
    tableName,
    originTableSessionId: originalTableSessionId,
  }).populate({
    path: "discountAppliedBy discountRemovedBy serviceChargeAppliedBy serviceChargeRemovedBy billingUserId",
    select: "name phone",
  });

  const billVariants = [];

  for (let variant of fetchVariants) {
    const cartItems = variant.items as CartItem[];
    if (!cartItems?.length) continue;

    const { totalDishTotal, totalGst } =
      calculateSplitTotalsFromItems(cartItems);

    const billItems = itemsGroupedByGst(cartItems);

    const billingUserName = variant.billingUserId?.name;
    const billingUserPhone = variant.billingUserId?.phone;

    const discountAppliedBy = variant.discountAppliedBy?.name || "";
    const discountRemovedBy = variant.discountRemovedBy?.name || "";
    const serviceChargeAppliedBy = variant.serviceChargeAppliedBy?.name || "";
    const serviceChargeRemovedBy = variant.serviceChargeRemovedBy?.name || "";

    // Get service charge
    let serviceChargeAmount = 0;
    const menuId = cartItems[0]?.dish?.menuId;

    const serviceCharge = await Tax.findOne({
      businessId,
      menuId,
      isActive: true,
      name: "servicecharge",
    });

    const percentage =
      variant.serviceChargePercentage || serviceCharge?.value || 0;
    serviceChargeAmount = (percentage / 100) * totalDishTotal;

    if (variant.isServiceChargeRemoved) {
      serviceChargeAmount = 0;
    }

    const gst = variant.isDiscountApplied ? variant.gst : totalGst;
    const newGst = gst;

    const totalDis = calculateTotalDiscount(
      variant.discount,
      variant.claimedCoins,
      variant.couponDiscount,
    );

    const newTotal = calculateFinalTotal(
      totalDishTotal,
      totalDis,
      newGst,
      serviceChargeAmount,
      0,
      variant.tips,
    );

    const totalWithoutRoundOff = calculateFinalTotalWithoutRoundOff(
      totalDishTotal,
      totalDis,
      newGst,
      serviceChargeAmount,
      0,
      variant.tips,
    );

    const { type, value } = getRoundOff(totalWithoutRoundOff);

    // Update table session
    variant = await updateSplitTableSession(
      variant._id.toString(),
      {
        gst: Number(newGst.toFixed(2)),
        total: newTotal,
        serviceCharge: Number(serviceChargeAmount?.toFixed(2)),
        billGeneratedBy: variant.generatedBy || "system",
        subTotal: totalDishTotal,
        items: cartItems,
        billPrintCount: (variant.billPrintCount || 0) + 1,
        totalGst: Number(totalGst?.toFixed(2)),
        serviceChargePercentage:
          variant.serviceChargePercentage || serviceCharge?.value || 0,
        billInvoice: billInvoice,
        roundOffType: type,
        roundOffAmount: value,
      },
      session,
    );
    if (!variant) {
      throw new Error("Failed to update split table session");
    }
    billVariants.push({
      customerName: billingUserName || variant.customerName,
      customerPhone: billingUserPhone || variant.phoneNumbers?.[0] || "",
      tableName: variant.tableName,
      couponId: variant.couponId,
      discountAppliedOn: variant.discountAppliedOn,
      reasonOfDiscount: variant.reasonOfDiscount,
      reasonOfServiceCharge: variant.reasonOfServiceCharge,
      serviceChargeAppliedBy,
      serviceChargeRemovedBy,
      discountAppliedBy,
      discountRemovedBy,

      billItems,
      subTotal: totalDishTotal,
      gst: Number(newGst.toFixed(2)),
      discount: variant.discount,
      claimedCoins: variant.claimedCoins,
      couponDiscount: variant.couponDiscount,
      serviceCharge: serviceChargeAmount,
      tips: variant.tips,
      total: newTotal,
      billId: originalTableSessionId,
      variantId: variant._id.toString(),
      variantName: variant.variantName,
      isPaid: variant.isPaid,
      serviceChargePercentage:
        variant.serviceChargePercentage || serviceCharge?.value || 0,
      roundOffType: type,
      roundOffAmount: value,
    });
  }

  return billVariants;
};

const applyDiscountToVariantBill = async ({
  variantId,
  value,
  discountAppliedOn,
  reasonOfDiscount,
  discountAppliedBy,
  itemIds,
  session,
}: {
  variantId: string;
  value: number;
  discountAppliedOn: "ON_DISH" | "ON_BILL";
  reasonOfDiscount: string;
  discountAppliedBy: string;
  itemIds: string[];
  session: ClientSession;
}) => {
  const splitTableSession = await SplitBillTableSession.findById(variantId);
  if (!splitTableSession) {
    throw new Error("Variant not found");
  }

  const cartItems = splitTableSession.items as CartItem[];

  let discountAmount = 0;
  let newSubTotal = splitTableSession.subTotal;
  let itemGst = 0;
  let saveGstAfterDiscount = 0;

  if (discountAppliedOn === "ON_BILL") {
    const dis = (value / 100) * newSubTotal;

    // Calculate discount on the bill
    discountAmount = Math.min(
      dis,
      newSubTotal -
        splitTableSession.claimedCoins -
        splitTableSession.couponDiscount,
    );
    newSubTotal -= discountAmount;
  }

  if (discountAppliedOn === "ON_DISH") {
    const { totalDishTotal, totalGst } = calculateSplitBillDishIds(
      cartItems,
      itemIds,
    );

    const dishDis = (value / 100) * totalDishTotal;
    discountAmount = Math.min(
      dishDis,
      splitTableSession.subTotal -
        splitTableSession.claimedCoins -
        splitTableSession.couponDiscount,
    );
    newSubTotal -= discountAmount;

    const { itemGstAfterDiscount } = splitCalculateItemUpdatedGstAfterDiscount(
      cartItems,
      Number(value.toFixed(2)),
      itemIds.length > 0 ? itemIds : [],
    );

    const { itemGstAfter } = splitCalculateItemUpdated(
      cartItems,
      Math.min(
        100,
        splitTableSession.coinPercentage || splitTableSession.couponPercentage,
      ),
      itemIds.length > 0 ? itemIds : [],
    );
    saveGstAfterDiscount = itemGstAfterDiscount;

    if (value >= 100) {
      // itemGst = tableSession.totalGst - totalGst;
      itemGst = itemGstAfter;
    } else {
      itemGst = itemGstAfterDiscount + itemGstAfter;
    }
  }

  const totalDiscountPercenatge = Math.min(
    100,
    value +
      splitTableSession.coinPercentage +
      splitTableSession.couponPercentage,
  );
  const items = splitTableSession.items as CartItem[];

  const { newGst } = calculateUpdatedGstAfterDiscount(
    items,
    Number(totalDiscountPercenatge.toFixed(2)),
    discountAppliedOn === "ON_DISH"
      ? itemIds && itemIds.length > 0
        ? itemIds
        : []
      : [],
    discountAppliedOn === "ON_DISH" ? itemGst : 0,
  );

  // Calculate final total
  const totalDis = calculateTotalDiscount(
    discountAmount,
    splitTableSession.claimedCoins,
    splitTableSession.couponDiscount,
  );
  const newTotal = calculateFinalTotal(
    splitTableSession.subTotal,
    totalDis,
    itemGst ? itemGst : newGst,
    splitTableSession.serviceCharge,
    0,
    splitTableSession.tips,
  );

  // Update session after applying the discount
  const update = await updateSplitTableSession(
    splitTableSession._id.toString(),
    {
      gst: itemGst ? Number(itemGst.toFixed(2)) : Number(newGst.toFixed(2)),
      total: newTotal,
      reasonOfDiscount,
      discountAppliedOn,
      discountAppliedBy,
      isDiscountApplied: true,
      discountRemovedBy: null,
      discount: discountAmount,
      discountPercentage:
        discountAppliedOn === "ON_BILL" ? Number(value.toFixed(2)) : 0,
      itemIds: itemIds ? itemIds : [],
      itemGst: itemGst ? Number(itemGst.toFixed(2)) : 0,
      itemGstAfterDiscount: Number(saveGstAfterDiscount.toFixed(2)),
    },
    session,
  );

  if (!update) {
    throw new Error("Failed to update split table session");
  }

  return true;
};

const applyCoinToVariantBill = async (
  variantId: string,
  value: number,
  session: ClientSession,
) => {
  const splitTableSession =
    await SplitBillTableSession.findById(variantId).session(session);
  if (!splitTableSession) {
    throw new Error("Variant not found");
  }

  if (splitTableSession.couponDiscount > 0) {
    throw new Error("Cannot apply coins when coupon discount is applied");
  }

  const coins = Math.min(
    value,
    splitTableSession.subTotal -
      splitTableSession.discount -
      splitTableSession.couponDiscount,
  );

  const totalDiscountPercenatge = Math.min(
    100,
    splitTableSession.discountPercentage +
      Number(((value / splitTableSession.subTotal) * 100).toFixed(2)) +
      splitTableSession.couponPercentage,
  );

  const items = splitTableSession.items as CartItem[];
  const { newGst } = calculateUpdatedGstAfterDiscount(
    items,
    Number(totalDiscountPercenatge.toFixed(2)),
    splitTableSession.itemIds || [],
    splitTableSession.itemGstAfterDiscount || 0,
  );

  const totalDis = calculateTotalDiscount(
    splitTableSession.discount,
    coins,
    splitTableSession.couponDiscount,
  );
  const newTotal = calculateFinalTotal(
    splitTableSession.subTotal,
    totalDis,
    newGst,
    splitTableSession.serviceCharge,
    0,
    splitTableSession.tips,
  );

  const updateSpliBillTableSession = await updateSplitTableSession(
    splitTableSession._id.toString(),
    {
      gst: Number(newGst.toFixed(2)),
      total: newTotal,
      isDiscountApplied: true,
      claimedCoins: coins,
      coinPercentage: Number(
        ((coins / splitTableSession.subTotal) * 100).toFixed(2),
      ),
    },
    session,
  );

  if (!updateSpliBillTableSession) {
    throw new Error("Failed to update split bill table session");
  }

  return true;
};

const applyCouponToVariantBill = async (
  variantId: string,
  couponId: string,

  session: ClientSession,
) => {
  const splitTableSession = await SplitBillTableSession.findById(variantId);
  if (!splitTableSession) {
    throw new Error("Variant not found");
  }
  let couponDiscount = 0;

  const coupon = await Couponz.findById(couponId);

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  if (splitTableSession.claimedCoins > 0) {
    throw new Error("Coins already claimed for this table");
  }

  const couponType = coupon?.config?.discountType;

  if (couponType === "PERCENTAGE") {
    const percentValue =
      ((coupon?.config?.value || 0) / 100) * (splitTableSession?.subTotal || 0);
    couponDiscount = Math.min(
      percentValue,
      coupon?.config?.upto || Number.POSITIVE_INFINITY,
    );
  } else {
    couponDiscount = coupon?.config?.value as number;
  }

  couponDiscount = Math.min(
    couponDiscount,
    splitTableSession.subTotal -
      splitTableSession.discount -
      splitTableSession.claimedCoins,
  );

  const totalDiscountPercenatge = Math.min(
    100,
    splitTableSession.discountPercentage +
      splitTableSession.coinPercentage +
      +Number(((couponDiscount / splitTableSession.subTotal) * 100).toFixed(2)),
  );

  const items = splitTableSession.items as CartItem[];
  const { newGst } = calculateUpdatedGstAfterDiscount(
    items,
    Number(totalDiscountPercenatge.toFixed(2)),
    splitTableSession.itemIds || [],
    splitTableSession.itemGstAfterDiscount || 0,
  );
  const totalDis = calculateTotalDiscount(
    splitTableSession.discount,
    splitTableSession.claimedCoins,
    couponDiscount,
  );
  const newTotal = calculateFinalTotal(
    splitTableSession.subTotal,
    totalDis,
    newGst,
    splitTableSession.serviceCharge,
    0,
    splitTableSession.tips,
  );

  const updateSplitBillTableSession = await updateSplitTableSession(
    splitTableSession._id.toString(),
    {
      gst: Number(newGst.toFixed(2)),
      total: newTotal,
      isDiscountApplied: true,
      couponDiscount: Number(couponDiscount?.toFixed(2)),
      couponId,
    },
    session,
  );

  if (!updateSplitBillTableSession) {
    throw new Error("Failed to update split bill table session");
  }

  return true;
};

const removeDiscountFromVariantBill = async (
  variantId: string,
  reasonOfDiscount: string,
  discountRemovedBy: string,
  session: ClientSession,
) => {
  const splitTableSession = await SplitBillTableSession.findById(variantId);
  if (!splitTableSession) {
    throw new Error("Variant not found");
  }

  const totalDiscountPercenatge = Math.min(
    100,
    0 + splitTableSession.coinPercentage + splitTableSession.couponPercentage,
  );

  const items = splitTableSession.items as CartItem[];
  const { newGst } = calculateUpdatedGstAfterDiscount(
    items,
    Number(totalDiscountPercenatge.toFixed(2)),
    [],
    0,
  );

  const totalDis = calculateTotalDiscount(
    0,
    splitTableSession.claimedCoins,
    splitTableSession.couponDiscount,
  );
  const newTotal = calculateFinalTotal(
    splitTableSession.subTotal,
    totalDis,
    newGst,
    splitTableSession.serviceCharge,
    0,
    splitTableSession.tips,
  );

  const isDiscountApplied =
    splitTableSession.claimedCoins > 0 || splitTableSession.couponDiscount > 0;

  const updateSplitTable = await updateSplitTableSession(
    splitTableSession._id.toString(),
    {
      gst: Number(newGst.toFixed(2)),
      total: newTotal,
      reasonOfDiscount,
      isDiscountApplied,
      discount: 0,
      discountAppliedBy: null,
      discountRemovedBy,
      newDishGst: 0,
      discountPercentage: 0,
      itemIds: [],
      itemGst: 0,
    },
    session,
  );

  if (!updateSplitTable) {
    throw new Error("Failed to update split bill table session");
  }

  return true;
};

const removeCoinFromVariantBill = async (
  variantId: string,
  session: ClientSession,
) => {
  const splitTableSession = await SplitBillTableSession.findById(variantId);
  if (!splitTableSession) {
    throw new Error("Variant not found");
  }

  const isDiscountApplied =
    splitTableSession.discount > 0 || splitTableSession.couponDiscount > 0;

  const totalDiscountPercenatge = Math.min(
    100,
    splitTableSession.discountPercentage +
      0 +
      splitTableSession.couponPercentage,
  );

  const items = splitTableSession.items as CartItem[];
  const { newGst } = calculateUpdatedGstAfterDiscount(
    items,
    Number(totalDiscountPercenatge.toFixed(2)),
    splitTableSession.itemIds || [],
    splitTableSession.itemGstAfterDiscount || 0,
  );

  const totalDis = calculateTotalDiscount(
    splitTableSession.discount,
    0,
    splitTableSession.couponDiscount,
  );
  const newTotal = calculateFinalTotal(
    splitTableSession.subTotal,
    totalDis,
    newGst,
    splitTableSession.serviceCharge,
    0,
    splitTableSession.tips,
  );

  const updateSplitTable = await updateSplitTableSession(
    splitTableSession._id.toString(),
    {
      gst: Number(newGst.toFixed(2)),
      total: newTotal,
      isDiscountApplied,
      claimedCoins: 0,
      coinPercentage: 0,
    },
    session,
  );

  if (!updateSplitTable) {
    throw new Error("Failed to update split bill table session");
  }
  return true;
};

const removeCouponFromVariantBill = async (
  variantId: string,

  session: ClientSession,
) => {
  const splitTableSession = await SplitBillTableSession.findById(variantId);
  if (!splitTableSession) {
    throw new Error("Variant not found");
  }
  const isDiscountApplied =
    splitTableSession.discount > 0 || splitTableSession.claimedCoins > 0;

  const totalDiscountPercenatge = Math.min(
    100,
    splitTableSession.discountPercentage + splitTableSession.coinPercentage + 0,
  );

  const items = splitTableSession.items as CartItem[];
  const { newGst } = calculateUpdatedGstAfterDiscount(
    items,
    Number(totalDiscountPercenatge.toFixed(2)),
    splitTableSession.itemIds || [],
    splitTableSession.itemGstAfterDiscount || 0,
  );

  const totalDis = calculateTotalDiscount(
    splitTableSession.discount,
    splitTableSession.claimedCoins,
    0,
  );
  const newTotal = calculateFinalTotal(
    splitTableSession.subTotal,
    totalDis,
    newGst,
    splitTableSession.serviceCharge,
    0,
    splitTableSession.tips,
  );

  const updateSplitTable = await updateSplitTableSession(
    splitTableSession._id.toString(),
    {
      gst: Number(newGst.toFixed(2)),
      total: newTotal,
      couponId: null,
      isDiscountApplied,
      couponDiscount: 0,
      couponPercentage: 0,
    },
    session,
  );

  if (!updateSplitTable) {
    throw new Error("Failed to update split bill table session");
  }

  return true;
};

export {
  applyCoinToVariantBill,
  applyCouponToVariantBill,
  applyDiscountToVariantBill,
  checkOfflinePaymentRequest,
  checkOriginBillIsSplit,
  checkVariantIsPaid,
  isOriginBillChanged,
  removeCoinFromVariantBill,
  removeCouponFromVariantBill,
  removeDiscountFromVariantBill,
  returnSplitBillVariants,
  returnSplitBillVariantsForItemWise,
  variantIsPaid,
};
