import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import type { CouponType } from "@hi/db-models/src/validators";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

export const useGetAllCoupons = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const businessId = businessData?._id;

  const getAllCoupon = useCallback(async () => {
    if (!businessId) return [];

    const res = await apiRpc.couponz.all[":businessId"].$get({
      param: {
        businessId,
      },
    });

    const data = (await res.json()).data as CouponType[];
    console.log(data);
    return data;
  }, [businessId]);

  const {
    data: coupons,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getAllCoupon", businessId],
    queryFn: getAllCoupon,
    enabled: !!businessId,
  });

  return {
    coupons,
    isLoading,
    error,
  };
};
