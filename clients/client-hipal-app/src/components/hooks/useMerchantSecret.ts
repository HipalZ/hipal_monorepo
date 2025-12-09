import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { usePaymentStore } from "../store/usePaymentStore";
import { useCouponz } from "../store/useCouponz";
import useCouponTemp from "../store/useCouponTemp";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { flushSync } from "react-dom";

export const useMerchantDetails = (businessId: string) => {
  const { setAvailedCoupon } = useCouponz((s) => ({
    setAvailedCoupon: s.setAvailedCoupon,
  }));
  const { setApplyCouponz } = useCouponTemp((s) => ({
    setApplyCouponz: s.setApplyCouponz,
  }));
  const {
    setMerchantDetails,
    setClaimedCoins,
    setClaimCouponz,
    setTips,
    setSelectedTip,
    setCustomTip,
  } = usePaymentStore((s) => ({
    setMerchantDetails: s.setMerchantDetails,
    setClaimedCoins: s.setClaimedCoins,
    setClaimCouponz: s.setClaimCouponz,
    setTips: s.setTips,
    setSelectedTip: s.setSelectedTip,
    setCustomTip: s.setCustomTip,
  }));
  const getMerchantKeySecret = useCallback(async () => {
    const res = await apiRpc.settings[":businessId"].getMerchantKeySecret.$get({
      param: {
        businessId: businessId || "",
      },
    });
    const response = await res.json();
    if (res.status === 200) {
      flushSync(() => {
        setMerchantDetails({
          businessId: businessId || "",
          razorpayMerchantId: response?.data?.razorpayMerchantId,
          razorpayKeyId: response?.data?.razorpayKeyId,
        });
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
