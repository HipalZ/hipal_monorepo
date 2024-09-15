import useBusinessData from "@/components/store/useBusinessData";
import useCouponsStore from "@/components/store/useCouponsStore";
import { apiRpc } from "@hi/common";
import type { CouponType } from "@hi/db-models/src/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

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

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  const { resetStore, setSelectedPage } = useCouponsStore((state) => ({
    resetStore: state.resetCouponState,
    setSelectedPage: state.setSelectedPage,
  }));

  const handleApiResponse = useCallback(
    (res) => {
      if (res.err) {
        toast.error(res.message);
        return;
      }
      if (!res.err) {
        toast.success(res.message);
        setSelectedPage("MANAGE");
        queryClient.invalidateQueries({ queryKey: ["getAllCoupon"] });
        resetStore();
      }
    },
    [queryClient, resetStore],
  );

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (couponId: string) => {
      const res = await apiRpc.couponz[":couponId"].$delete({
        param: {
          couponId,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
    onError: (error) => {
      toast.error(`Error deleting coupon: ${error.message}`);
    },
  });

  return { mutate: mutateAsync, isPending };
};
