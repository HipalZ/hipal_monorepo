import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import useBusinessDetails from "../store/useBusinessDetails";
import { usePaymentStore } from "../store/usePaymentStore";
import { useCouponz } from "../store/useCouponz";
import useCouponTemp from "../store/useCouponTemp";
import { toast } from "react-toastify";
import { useCallback } from "react";

export const useMerchantDetails = () => {
  const businessId = useBusinessDetails((s) => s.businessDetails?.businessId);
  const { setAvailedCoupon } = useCouponz((s) => ({
    setAvailedCoupon: s.setAvailedCoupon,
  }));
  const { setApplyCouponz } = useCouponTemp((s) => ({
    setApplyCouponz: s.setApplyCouponz,
  }));

  const setMerchantDetails = usePaymentStore((s) => s.setMerchantDetails);
  const setClaimedCoins = usePaymentStore((s) => s.setClaimedCoins);
  const setClaimCouponz = usePaymentStore((s) => s.setClaimCouponz);
  const setTips = usePaymentStore((s) => s.setTips);
  const setSelectedTip = usePaymentStore((s) => s.setSelectedTip);
  const setCustomTip = usePaymentStore((s) => s.setCustomTip);

  const getMerchantKeySecret = useCallback(async () => {
    const res = await apiRpc.settings[":businessId"].getMerchantKeySecret.$get({
      param: {
        businessId: businessId || "",
      },
    });
    const response = await res.json();
    if (res.status === 200) {
      setMerchantDetails({
        businessId: businessId || "",
        razorpayMerchantId: response?.data?.razorpayMerchantId,
        razorpayKeyId: response?.data?.razorpayKeyId,
      });
      // by default setting to zero instead of previous stale data
      setClaimedCoins(0);
      setClaimCouponz(0);
      setTips(0);
      setSelectedTip("");
      setCustomTip("");
      setAvailedCoupon({});
      setApplyCouponz(false);
    } else if (res.status === 404) {
      toast.error(
        "Online Pay is not available for this business, pay through offline mode",
      );
    }

    return response?.data;
  }, [
    businessId,
    setMerchantDetails,
    setClaimedCoins,
    setClaimCouponz,
    setTips,
    setSelectedTip,
    setCustomTip,
    setAvailedCoupon,
    setApplyCouponz,
  ]);

  useQuery({
    queryKey: ["getMerchantKeySecret", businessId],
    queryFn: getMerchantKeySecret,
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });
};
