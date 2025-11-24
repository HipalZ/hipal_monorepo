import { useError } from "@/components/store/useError";
import type {
  ApiResponse,
  ApplyTipsPayload,
} from "@/components/types/api.types";
import type { IBillData } from "@/components/types/hiClientzData";
import {
  createPayloadWithVariant,
  getBillQueryKey,
} from "@/components/utils/api.utils";
import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useAddTips = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: addingTipsLoader, mutateAsync: addingTips } = useMutation({
    mutationFn: async (payload: Omit<ApplyTipsPayload, "variantId">) => {
      const finalPayload = createPayloadWithVariant(payload, currentBill);
      const response = await apiRpc.pos.add_tip.$post({
        json: finalPayload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || "Failed to add tips");
        setOpenErrorModal(true);
        toast.error("Failed to add tips");
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Tips added successfully");
        const queryKey = getBillQueryKey(currentBill);
        queryClient.invalidateQueries({ queryKey });
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error adding tips");
      setOpenErrorModal(true);
      toast.error("Error adding tips");
    },
  });

  return {
    addingTipsLoader,
    addingTips,
  };
};

export const useRemoveTips = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: removingTipsLoader, mutateAsync: removingTips } =
    useMutation({
      mutationFn: async (payload: Omit<ApplyTipsPayload, "variantId">) => {
        const finalPayload = createPayloadWithVariant(payload, currentBill);
        const response = await apiRpc.pos.remove_tip.$post({
          json: finalPayload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData: ApiResponse = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(extraData.message || "Failed to remove tips");
          setOpenErrorModal(true);
          toast.error("Failed to remove tips");
          return;
        }
        if (data.status === 200 || data.status === 201) {
          toast.success("Tips removed successfully");
          const queryKey = getBillQueryKey(currentBill);
          queryClient.invalidateQueries({ queryKey });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error removing tips");
        setOpenErrorModal(true);
        toast.error("Error removing tips");
      },
    });

  return {
    removingTipsLoader,
    removingTips,
  };
};
