import { memo } from "react";
import { BillRow } from "./BillRow";
import type { OrderData } from "./types";
import { useRemoveJewelleryCoinz } from "../../hooks/jewellery/useCoinz";
import LoadingSpinner from "../../atoms/progressBar/loadingSpinner";
import { useRemoveJewelleryCoupon } from "../../hooks/jewellery/useJewelleryCoupon";

interface BillBreakdownProps {
  orderData: OrderData;
}

const BillBreakdownComponent = ({ orderData }: BillBreakdownProps) => {
  const safeOrderData = {
    subTotal: orderData?.subTotal ?? 0,
    gst: orderData?.gst ?? 0,
    tips: orderData?.tips ?? 0,
    discount: orderData?.discount ?? 0,
    claimedCoins: orderData?.claimedCoins ?? 0,
    couponDiscount: orderData?.couponDiscount ?? 0,
  };
  const { isRemovingCoinz, removeJewelleryCoinz } = useRemoveJewelleryCoinz();
  const { removeJewelleryCoupon, isRemovingCoupon } =
    useRemoveJewelleryCoupon();

  const resetClaimedCoins = () => {
    removeJewelleryCoinz({
      orderId: orderData._id || "",
    });
  };
  const removeCoupon = () => {
    removeJewelleryCoupon({ orderId: orderData._id || "" });
  };

  if (isRemovingCoinz || isRemovingCoupon) {
    <>
      <LoadingSpinner />
    </>;
  }

  return (
    <div className="space-y-1">
      <BillRow label="Subtotal" value={safeOrderData.subTotal} />

      {safeOrderData.gst > 0 && (
        <BillRow label="GST" value={safeOrderData.gst} />
      )}

      {safeOrderData.tips > 0 && (
        <BillRow label="Tips" value={safeOrderData.tips} />
      )}

      {safeOrderData.discount > 0 && (
        <BillRow
          label="Discount"
          value={safeOrderData.discount}
          isNegative={true}
        />
      )}

      {safeOrderData.claimedCoins > 0 && (
        <BillRow
          label="claimed coin"
          value={safeOrderData.claimedCoins}
          isNegative={true}
          onRemove={() => resetClaimedCoins()}
        />
      )}

      {safeOrderData.couponDiscount > 0 && (
        <BillRow
          label="Coupon Discount"
          value={safeOrderData.couponDiscount}
          isNegative={true}
          onRemove={() => removeCoupon()}
        />
      )}
    </div>
  );
};

export const BillBreakdown = memo(BillBreakdownComponent);
