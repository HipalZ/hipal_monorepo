import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { createPayloadWithVariant } from "../../utils/api.utils";
import type {
  SettleTypePayload,
  ReprintPayload,
  ApiResponse,
} from "../../types/api.types";
import type { IBillData } from "@/components/types/hiClientzData.ts";
import { useError } from "@/components/store/useError.ts";
import toast from "react-hot-toast";

export const useConfirmSettle = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError();

  const { isPending: isConfirming, mutateAsync: confirmSettle } = useMutation({
    mutationFn: async (payload: Omit<SettleTypePayload, "variantId">) => {
      const finalPayload = createPayloadWithVariant(payload, currentBill);
      const response = await apiRpc.pos.settle.$post({
        json: finalPayload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData?.message || "Failed to confirm settle");
        setOpenErrorModal(true);
        toast.error("Failed to confirm settle");
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Settle confirmed successfully");
        return;
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });

  return {
    isConfirming,
    confirmSettle,
  };
};

export const useReprintBill = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: Omit<ReprintPayload, "variantId">) => {
      const finalPayload = createPayloadWithVariant(payload, currentBill);
      const response = await apiRpc.pos.re_print_bill.$post({
        json: finalPayload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || "Failed to reprint bill");
        setOpenErrorModal(true);
        toast.error("Failed to reprint bill");
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Bill reprinted successfully");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });

  return {
    isPrinting: isPending,
    reprintBill: mutateAsync,
  };
};
