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

export const useSaveCoupon = () => {
  const resetFunction = useCouponsStore((s) => s.resetCouponState);
  const setSelectedPage = useCouponsStore((s) => s.setSelectedPage);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiRpc.couponz.$post({
        json: payload,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.err) {
        toast.success("Coupon saved successfully!");
        setSelectedPage("MANAGE");
        resetFunction();
      }
    },
    onError: (error) => {
      toast.error("Failed to save coupon!");
      console.error("Error in saving coupon:", error);
    },
  });

  return { saveCoupon: mutateAsync, isPending };
};

export const useEditCoupon = () => {
  const resetFunction = useCouponsStore((s) => s.resetCouponState); // Reset the coupon state after success
  const setSelectedPage = useCouponsStore((s) => s.setSelectedPage); // Redirect to another page after success

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({
      payload,
      couponId,
    }: { payload: any; couponId: string }) => {
      const response = await apiRpc.couponz[":couponId"].$put({
        param: {
          couponId,
        },
        json: payload,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.err) {
        toast.success("Coupon updated successfully!");
        setSelectedPage("MANAGE");
        resetFunction();
      } else {
        toast.error(data.message || "Failed to update coupon!");
      }
    },
    onError: (error) => {
      toast.error("Failed to update coupon!");
      console.error("Error in updating coupon:", error);
    },
  });

  return { editCoupon: mutateAsync, isPending };
};
