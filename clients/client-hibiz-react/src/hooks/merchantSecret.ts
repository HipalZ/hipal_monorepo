import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useCallback } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp from "@/components/store/useWhatsapp";

export const useMerchantDetails = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setMerchantDetails } = useWhatsapp((s) => ({
    setMerchantDetails: s.setMerchantDetails,
  }));

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
    } else if (res.status === 404) {
      toast.error(
        "Online Pay is not available for this business, pay through offline mode",
      );
    }

    return response?.data;
  }, [businessId, setMerchantDetails]);

  useQuery({
    queryKey: ["getMerchantKeySecret", businessId],
    queryFn: getMerchantKeySecret,
    enabled: !!businessId,
  });
};
