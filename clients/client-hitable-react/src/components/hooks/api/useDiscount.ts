import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import {
  createPayloadWithVariant,
  getBillQueryKey,
} from "../../utils/api.utils";
import type {
  DiscountPayload,
  RemoveDiscountPayload,
  ApiResponse,
} from "../../types/api.types";
import type { IBillData } from "@/components/types/hiClientzData.ts";
import { useError } from "@/components/store/useError.ts";
import toast from "react-hot-toast";

export const useAddDiscount = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: addingDiscountLoader, mutateAsync: addingDiscount } =
    useMutation({
      mutationFn: async (payload: Omit<DiscountPayload, "variantId">) => {
        const finalPayload = createPayloadWithVariant(payload, currentBill);
        const response = await apiRpc.pos.add_discount.$post({
          json: finalPayload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData: ApiResponse = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(extraData.message || "Failed to add discount");
          setOpenErrorModal(true);
          toast.error("Failed to add discount");
          return;
        }
        if (data.status === 200 || data.status === 201) {
          toast.success("Discount added successfully");
          const queryKey = getBillQueryKey(currentBill);
          queryClient.invalidateQueries({ queryKey });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error adding discount");
        setOpenErrorModal(true);
        toast.error("Error adding discount");
      },
    });

  return {
    addingDiscountLoader,
    addingDiscount,
  };
};

export const useRemoveDiscount = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: removingDiscountLoader, mutateAsync: removingDiscount } =
    useMutation({
      mutationFn: async (payload: Omit<RemoveDiscountPayload, "variantId">) => {
        const finalPayload = createPayloadWithVariant(payload, currentBill);
        const response = await apiRpc.pos.remove_discount.$post({
          json: finalPayload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData: ApiResponse = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(extraData.message || "Failed to remove discount");
          setOpenErrorModal(true);
          toast.error("Failed to remove discount");
          return;
        }
        if (data.status === 200 || data.status === 201) {
          toast.success("Discount removed successfully");
          const queryKey = getBillQueryKey(currentBill);
          queryClient.invalidateQueries({ queryKey });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error removing discount");
        setOpenErrorModal(true);
        toast.error("Error removing discount");
      },
    });

  return {
    removingDiscountLoader,
    removingDiscount,
  };
};
