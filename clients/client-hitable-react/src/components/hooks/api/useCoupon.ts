import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import {
  createPayloadWithVariant,
  getBillQueryKey,
} from "../../utils/api.utils";
import type {
  AddCouponPayload,
  RemoveCouponPayload,
  ApiResponse,
} from "../../types/api.types";
import type { IBillData } from "@/components/types/hiClientzData.ts";
import toast from "react-hot-toast";
import { useError } from "@/components/store/useError.ts";

export const useAddCoupon = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: addingCouponLoader, mutateAsync: addingCoupon } =
    useMutation({
      mutationFn: async (payload: Omit<AddCouponPayload, "variantId">) => {
        const finalPayload = createPayloadWithVariant(payload, currentBill);
        const response = await apiRpc.pos.add_coupon.$post({
          json: finalPayload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData: ApiResponse = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(extraData.message || "Failed to add coupon");
          setOpenErrorModal(true);
          toast.error("Failed to add coupon");
          return;
        }
        if (data.status === 200 || data.status === 201) {
          toast.success("Coupon added successfully");
          const queryKey = getBillQueryKey(currentBill);
          queryClient.invalidateQueries({ queryKey });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error adding coupon");
        setOpenErrorModal(true);
        toast.error("Error adding coupon");
      },
    });

  return {
    addingCouponLoader,
    addingCoupon,
  };
};

export const useRemoveCoupon = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: removingCouponLoader, mutateAsync: removingCoupon } =
    useMutation({
      mutationFn: async (payload: Omit<RemoveCouponPayload, "variantId">) => {
        const finalPayload = createPayloadWithVariant(payload, currentBill);
        const response = await apiRpc.pos.remove_coupon.$post({
          json: finalPayload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData: ApiResponse = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(extraData.message || "Failed to remove coupon");
          setOpenErrorModal(true);
          toast.error("Failed to remove coupon");
          return;
        }
        if (data.status === 200 || data.status === 201) {
          toast.success("Coupon removed successfully");
          const queryKey = getBillQueryKey(currentBill);
          queryClient.invalidateQueries({ queryKey });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error removing coupon");
        setOpenErrorModal(true);
        toast.error("Error removing coupon");
      },
    });

  return {
    removingCouponLoader,
    removingCoupon,
  };
};
