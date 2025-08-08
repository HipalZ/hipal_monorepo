import {
  Couponz,
  DuesUser,
  NpcUser,
  Order,
  Payment,
  PaymentAlert,
  PendingDues,
  SplitBillTableSession,
  Tax,
  UserSession,
} from "@hi/db-models";
import type { UserSessionSchemaType } from "@hi/db-models/src/validators";
import type { ClientSession } from "mongoose";
import {
  CartItem,
  calculateFinalTotal,
  calculateSplitBillDishIds,
  calculateSplitTotalsFromItems,
  calculateTotalDiscount,
  calculateUpdatedGstAfterDiscount,
  groupSplitItemsByGST,
  itemsGroupedByGst,
  splitCalculateItemUpdated,
  splitCalculateItemUpdatedGstAfterDiscount,
  updateSplitTableSession,
} from "../../utils/bill";

import { nanoid } from "nanoid";
import {
  addCoins,
  calculatedCashbackCoins,
  removeCoins,
} from "../../routes/payments";
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
  return original?.isSplit ?? false;
};

const checkVariantIsPaid = async (originalTableSessionId: string) => {
  const isPaid = await SplitBillTableSession.exists?.({
    originTableSessionId: originalTableSessionId,
    isPaid: true,
  });

  return !!isPaid;
};

const returnSplitBillVariants = async (
  originalTableSessionId: string,
  businessId: string,
  tableName: string,
  session: ClientSession,
) => {
  const fetchVariants = await SplitBillTableSession.find({
    businessId,
    tableName,
    originalTableSessionId,
  }).populate({
    path: "discountAppliedBy discountRemovedBy serviceChargeAppliedBy serviceChargeRemovedBy",
    select: "name phone",
  });

  const billVariants = [];

  for (let variant of fetchVariants) {
    const cartItems = variant.items as Item[];
    if (!cartItems?.length) continue;

    const totalDishTotal = variant.totalDishTotal || 0;
    const totalGst = variant.totalGst || 0;

    const billItems = groupSplitItemsByGST(cartItems);

    const discountAppliedBy = variant.discountAppliedBy?.name || "";
    const discountRemovedBy = variant.discountRemovedBy?.name || "";
    const serviceChargeAppliedBy = variant.serviceChargeAppliedBy?.name || "";
    const serviceChargeRemovedBy = variant.serviceChargeRemovedBy?.name || "";

    // Get service charge
    let serviceChargeAmount = 0;
    const menuId = cartItems[0]?.dish?.menuId;

    if (menuId) {
      const serviceCharge = await Tax.findOne({
        businessId,
        menuId,
        isActive: true,
        name: "servicecharge",
      });

      const percentage = serviceCharge?.value || 0;
      serviceChargeAmount = Math.round((percentage / 100) * totalDishTotal);
    }

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

    // Update table session
    variant = await updateSplitTableSession(
      variant._id.toString(),
      {
        gst: Number(newGst.toFixed(2)),
        total: newTotal,
        serviceCharge: serviceChargeAmount,
        billGeneratedBy: variant.generatedBy || "system",
        subTotal: totalDishTotal,
        items: cartItems,
        totalGst: totalGst,
      },
      session,
    );

    if (!variant) {
      throw new Error("Failed to update split table session");
    }

    billVariants.push({
      customerName: variant.customerName,
      customerPhone: variant.phoneNumbers?.[0] || "",
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
      billId: variant.originTableSessionId,
      variantId: variant._id.toString(),
      variantName: variant.variantName,
      isPaid: variant.isPaid,
    });
  }

  return billVariants;
};

const returnSplitBillVariantsForItemWise = async (
  originalTableSessionId: string,
  businessId: string,
  tableName: string,
  session: ClientSession,
) => {
  const fetchVariants = await SplitBillTableSession.find({
    businessId,
    tableName,
    originalTableSessionId,
  }).populate({
    path: "discountAppliedBy discountRemovedBy serviceChargeAppliedBy serviceChargeRemovedBy",
    select: "name phone",
  });

  const billVariants = [];

  for (let variant of fetchVariants) {
    const cartItems = variant.items as CartItem[];
    if (!cartItems?.length) continue;

    const { totalDishTotal, totalGst } =
      calculateSplitTotalsFromItems(cartItems);

    const billItems = itemsGroupedByGst(cartItems);

    const discountAppliedBy = variant.discountAppliedBy?.name || "";
    const discountRemovedBy = variant.discountRemovedBy?.name || "";
    const serviceChargeAppliedBy = variant.serviceChargeAppliedBy?.name || "";
    const serviceChargeRemovedBy = variant.serviceChargeRemovedBy?.name || "";

    // Get service charge
    let serviceChargeAmount = 0;
    const menuId = cartItems[0]?.dish?.menuId;

    if (menuId) {
      const serviceCharge = await Tax.findOne({
        businessId,
        menuId,
        isActive: true,
        name: "servicecharge",
      });

      const percentage = serviceCharge?.value || 0;
      serviceChargeAmount = Math.round((percentage / 100) * totalDishTotal);
    }

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

    // Update table session
    variant = await updateSplitTableSession(
      variant._id.toString(),
      {
        gst: Number(newGst.toFixed(2)),
        total: newTotal,
        serviceCharge: serviceChargeAmount,
        billGeneratedBy: variant.generatedBy || "system",
        subTotal: totalDishTotal,
        items: cartItems,
        billPrintCount: (variant.billPrintCount || 0) + 1,
        totalGst: totalGst,
      },
      session,
    );
    if (!variant) {
      throw new Error("Failed to update split table session");
    }
    billVariants.push({
      customerName: variant.customerName,
      customerPhone: variant.phoneNumbers?.[0] || "",
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
      billId: variant.originTableSessionId,
      variantId: variant._id.toString(),
      variantName: variant.variantName,
      isPaid: variant.isPaid,
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
    const dis = Math.round((value / 100) * newSubTotal);

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

    const dishDis = Math.round((value / 100) * totalDishTotal);
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
  const splitTableSession = await SplitBillTableSession.findById(variantId);
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
      couponDiscount,
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

export const handleNormalBillSettlement = async ({
  table,

  captain,
  paymentMode,
  settleModes,
  businessLoyalty,
  npcUser,
  duesUserId,
  npcUserId,

  session,
  variantId,
}: {
  table: any;

  captain: any;
  paymentMode: any;
  settleModes: any[];
  businessLoyalty: any;
  npcUser?: any;
  duesUserId?: string;
  npcUserId?: string;

  variantId?: string;
  session: ClientSession;
}) => {
  const splitBillTableSession = await SplitBillTableSession.findById(variantId);
  if (!splitBillTableSession) {
    throw new Error("Split bill session not found");
  }
  const uniqueOrderId = nanoid(15);

  let modifyTotal = 0;
  if (["npc", "dues", "complementary"].includes(paymentMode?.name)) {
    modifyTotal = 0;
  } else {
    modifyTotal = splitBillTableSession?.total || 0;

    if (settleModes.length > 1) {
      for (const settle of settleModes) {
        if (settle.name === "complementary") {
          modifyTotal -= settle.amount ?? 0;
        }
      }
    }
  }

  const saveOrder = await Order.create(
    [
      {
        total: ["npc", "complementary"].includes(paymentMode?.name)
          ? 0
          : splitBillTableSession?.total || 0,
        currency: "INR",
        receipt: uniqueOrderId,
        userId:
          paymentMode?.name === "npc"
            ? npcUser?.userId
            : splitBillTableSession?.customerIds?.[0] || captain._id,
        claimedCoins: splitBillTableSession?.claimedCoins || 0,
        tableName: table?.name,
        tips: splitBillTableSession?.tips || 0,
        billValue: splitBillTableSession?.subTotal || 0,
        businessId: table?.businessId,
        order_id: uniqueOrderId,
        discount: splitBillTableSession?.discount || 0,
        couponDiscount: splitBillTableSession?.couponDiscount || 0,
        gst: splitBillTableSession?.gst || 0,
        date: Date.now(),
      },
    ],
    { session },
  );

  const order = saveOrder[0];

  // Loyalty handling
  const cashBack = await calculatedCashbackCoins(
    order.businessId.toString(),
    Number(order.billValue),
    Number(order.claimedCoins),
  );

  if (
    order.claimedCoins > 0 &&
    !["complementary", "npc"].includes(paymentMode?.name)
  ) {
    await removeCoins(
      Number(order.claimedCoins),
      order.tableName,
      businessLoyalty?.loyaltyId?.toString() || "",
      order._id.toString(),
      order.userId.toString(),
      session,
    );
  }

  const finalCashBack = await addCoins(
    cashBack,
    order.userId.toString(),
    order._id.toString(),
    order.tableName || "",
    order.businessId.toString(),
    businessLoyalty?.loyaltyId?.toString() || "",
    session,
  );

  const createPayment = await Payment.create(
    [
      {
        businessId: table?.businessId,
        order_id: order._id,
        total: order.total,
        mode: settleModes.length > 1 ? "split" : paymentMode?.name,
        status: "SUCCESS",
        paymentMode: settleModes.length > 1 ? "split" : paymentMode?.name,
        userId: order.userId,
        claimedCoins: order.claimedCoins,
        billValue: order.billValue,
        tips: order.tips,
        tableName: order.tableName,
        earnCoins: finalCashBack,
        razorpayEventId: nanoid(15),
        razorpayOrderId: nanoid(15),
        razorpayPaymentId: nanoid(15),
        settleType: "NORMAL_SETTLE",
        comment: "NORMAL SETTLE",
        posBillId: splitBillTableSession?._id,
        tax: ["npc", "complementary"].includes(paymentMode?.name)
          ? 0
          : splitBillTableSession?.gst,
        serviceCharge: ["npc", "complementary"].includes(paymentMode?.name)
          ? 0
          : splitBillTableSession?.serviceCharge,
        waiterName: captain?.name,
        splitModes: settleModes,
        date: Date.now(),
        discount: splitBillTableSession?.discount,
        couponDiscount: splitBillTableSession?.couponDiscount,
        billId: splitBillTableSession?._id.toString(),
        billItems: splitBillTableSession?.items || [],
        isSplitBillVariant: true,
      },
    ],
    { session },
  );

  // Dues or NPC tracking
  if (duesUserId && paymentMode?.name === "dues") {
    await PendingDues.create(
      [
        {
          billId: createPayment[0]._id,
          businessId: order.businessId,
          date: Date.now(),
          duesUserId,
          isSettled: false,
        },
      ],
      { session },
    );

    await DuesUser.findByIdAndUpdate(
      duesUserId,
      {
        $inc: {
          totalDuesAmount: order.total,
        },
      },
      { session },
    );
  }

  if (npcUserId && paymentMode?.name === "npc") {
    await NpcUser.findByIdAndUpdate(
      npcUserId,
      {
        $inc: {
          totalNpcAmount: order.billValue,
        },
      },
      { session },
    );
  }

  await UserSession.findOneAndUpdate(
    {
      businessId: splitBillTableSession.businessId,
      tableName: splitBillTableSession.tableName,
    },
    {
      $inc: {
        variantsCounts: -1,
      },
    },
    { session, new: true },
  );

  return true;
};

const processOfflineOrderPayment = async ({
  order,

  alert,
  settleModes,
  paymentMode,
  npcUserId,
  duesUserId,
  loyaltySettings,
  waiterName,
  session,
}: {
  order: any;
  alert: any;
  settleModes: any[];
  paymentMode: any;
  npcUserId?: string;
  duesUserId?: string;
  loyaltySettings: any;
  waiterName: string;
  session: ClientSession;
}) => {
  let finalCashBack = 0;

  const splitBillTableSession = await SplitBillTableSession.findById(
    order.variantId,
  ).session(session);

  if (!splitBillTableSession) {
    throw new Error("Split bill session not found");
  }

  const npcUser = npcUserId
    ? await NpcUser.findById(npcUserId).session(session)
    : null;

  if (!["complementary", "npc"].includes(paymentMode?.name)) {
    let cashBack = await calculatedCashbackCoins(
      order.businessId.toString(),
      Number(order.billValue),
      Number(order.claimedCoins),
    );

    if (loyaltySettings?.loyaltyId && order.claimedCoins > 0) {
      await removeCoins(
        Number(order.claimedCoins),
        order.tableName,
        loyaltySettings.loyaltyId.toString(),
        order._id.toString(),
        order.userId.toString(),
        session,
      );

      if (order.cashbackAvailable === false) {
        cashBack = 0;
      }
    }

    finalCashBack = await addCoins(
      cashBack,
      order.userId.toString(),
      order._id.toString(),
      order.tableName || "",
      order.businessId.toString(),
      loyaltySettings?.loyaltyId.toString() || "",
      session,
    );
  }

  let modifyTotal = ["npc", "dues", "complementary"].includes(paymentMode?.name)
    ? 0
    : order.total;

  if (settleModes.length > 1) {
    for (const settle of settleModes) {
      if (settle.name === "complementary") {
        modifyTotal -= settle.amount ?? 0;
      }
    }
  }

  const payment = await Payment.create(
    [
      {
        businessId: alert.businessId,
        order_id: order._id,
        total: modifyTotal,
        mode: settleModes.length > 1 ? "split" : paymentMode?.name,
        status: "SUCCESS",
        paymentMode: settleModes.length > 1 ? "split" : paymentMode?.name,
        userId: paymentMode?.name === "npc" ? npcUser?.userId : order.userId,
        claimedCoins: ["npc", "complementary"].includes(paymentMode?.name)
          ? 0
          : order.claimedCoins,
        billValue: order.billValue,
        tips: order.tips,
        tableName: order.tableName,
        earnCoins: ["npc", "complementary"].includes(paymentMode?.name)
          ? 0
          : finalCashBack,
        razorpayEventId: nanoid(15),
        razorpayOrderId: nanoid(15),
        razorpayPaymentId: nanoid(15),
        couponId: order.couponId,
        channelId: order.channelId,
        billId: splitBillTableSession?._id.toString(),
        tax: ["npc", "complementary"].includes(paymentMode?.name)
          ? 0
          : splitBillTableSession?.gst,
        serviceCgarge: ["npc", "complementary"].includes(paymentMode?.name)
          ? 0
          : splitBillTableSession?.serviceCharge,
        splitModes: settleModes,
        waiterName,
        date: Date.now(),
        discount: splitBillTableSession?.discount,
        couponDiscount: splitBillTableSession?.couponDiscount,
        billItems: splitBillTableSession?.items || [],
      },
    ],
    { session },
  );

  // Handle dues
  if (duesUserId && paymentMode?.name === "dues") {
    await PendingDues.create(
      [
        {
          billId: payment[0]._id,
          businessId: order.businessId,
          date: Date.now(),
          duesUserId,
          isSettled: false,
        },
      ],
      { session },
    );

    await DuesUser.findByIdAndUpdate(
      duesUserId,
      { $inc: { totalDuesAmount: order.total } },
      { session },
    );
  }

  // Handle NPC
  if (npcUserId && paymentMode?.name === "npc") {
    await NpcUser.findByIdAndUpdate(
      npcUserId,
      { $inc: { totalNpcAmount: order.total } },
      { session },
    );
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
  processOfflineOrderPayment,
  removeCoinFromVariantBill,
  removeCouponFromVariantBill,
  removeDiscountFromVariantBill,
  returnSplitBillVariants,
  returnSplitBillVariantsForItemWise,
};
