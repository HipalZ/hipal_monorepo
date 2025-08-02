import { PaymentAlert, SplitBillTableSession, Tax } from "@hi/db-models";
import type { UserSessionSchemaType } from "@hi/db-models/src/validators";
import {
  calculateFinalTotal,
  calculateSplitBillTotals,
  calculateTotalDiscount,
  groupSplitItemsByGST,
  updateSplitTableSession,
} from "../../utils/bill";

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

const returnSplitBillVariants = async (
  originalTableSessionId: string,
  businessId: string,
  tableName: string,
) => {
  const fetchVariants = await SplitBillTableSession.find({
    businessId: businessId,
    tableName: tableName,
    originTableSessionId: originalTableSessionId,
  }).populate({
    path: "discountAppliedBy discountRemovedBy serviceChargeAppliedBy serviceChargeRemovedBy",
    select: "name phone",
  });
  const billVariants = [];

  for (const variant of fetchVariants) {
    const cartItem = variant.items as Item[];

    const { totalDishTotal, totalGst } = calculateSplitBillTotals(cartItem);

    const billItems = groupSplitItemsByGST(cartItem);

    const discountAppliedBy = variant.discountAppliedBy?.name || "";
    const discountRemovedBy = variant.discountRemovedBy?.name || "";
    const serviceChargeAppliedBy = variant.serviceChargeAppliedBy?.name || "";
    const serviceChargeRemovedBy = variant.serviceChargeRemovedBy?.name || "";

    // Get service charge info
    const serviceCharge = await Tax.findOne({
      businessId,
      menuId: cartItem[0].dish.menuId,
      isActive: true,
      name: "servicecharge",
    });

    const serviceChargePercentage = serviceCharge?.value || 0;

    let serviceChargeAmount = Math.round(
      (serviceChargePercentage / 100) * totalDishTotal,
    );
    if (variant.isServiceChargeRemoved) serviceChargeAmount = 0;

    // Calculate GST
    let newGst = 0;
    const newSubTotal =
      totalDishTotal -
      variant.discount -
      variant.claimedCoins -
      variant.couponDiscount;

    if (variant.isDiscountApplied && variant.discountAppliedOn === "ON_DISH") {
      newGst = (variant.gstPercentage / 100) * newSubTotal;
      newGst -= variant.newDishGst;
    } else if (variant.isDiscountApplied) {
      newGst = (variant.gstPercentage / 100) * newSubTotal;
    } else {
      newGst = totalGst;
    }

    const totalDis = calculateTotalDiscount(
      variant.discount,
      variant.claimedCoins,
      variant.couponDiscount,
    );

    // Final total
    const newTotal = calculateFinalTotal(
      totalDishTotal,
      totalDis,
      newGst,
      serviceChargeAmount,
      0,
      variant.tips,
    );

    // Update table session with new values
    const update = await updateSplitTableSession(variant._id.toString(), {
      gst: Number(newGst).toFixed(2),
      total: newTotal,
      serviceCharge: serviceChargeAmount,
      billGeneratedBy: variant?.generatedBy || "datta",
      subTotal: totalDishTotal,
      items: cartItem,
      billPrintCount: variant.billPrintCount + 1,
    });

    const bill = {
      customerName: variant.customerName,
      customerPhone: variant.phoneNumbers?.[0],
      tableName: variant.tableName,
      couponId: variant.couponId,
      discountAppliedOn: variant.discountAppliedOn,
      reasonOfDiscount: variant.reasonOfDiscount,
      reasonOfServiceCharge: variant.reasonOfServiceCharge,
      serviceChargeAppliedBy: serviceChargeAppliedBy,
      serviceChargeRemovedBy: serviceChargeRemovedBy,
      discountAppliedBy: discountAppliedBy,
      discountRemovedBy: discountRemovedBy,

      billItems,
      subTotal: totalDishTotal,
      gst: variant.gst,
      discount: variant.discount,
      claimedCoins: variant.claimedCoins,
      couponDiscount: variant.couponDiscount,
      serviceCharge: variant.serviceCharge,
      tips: variant.tips,
      total: variant.total,
      billId: variant.originTableSessionId,
      variantId: variant._id.toString(),
      variantName: variant.variantName,
    };

    billVariants.push(bill);
  }

  return billVariants;
};

export {
  checkOfflinePaymentRequest,
  checkOriginBillIsSplit,
  isOriginBillChanged,
  returnSplitBillVariants,
};
