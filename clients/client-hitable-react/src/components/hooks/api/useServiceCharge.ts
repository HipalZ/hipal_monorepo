import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import {
  createPayloadWithVariant,
  getBillQueryKey,
} from "../../utils/api.utils";
import type {
  AddServiceChargePayload,
  RemoveServiceChargePayload,
  ApiResponse,
  UpdateServiceChargePayload,
} from "../../types/api.types";
import type { IBillData } from "@/components/types/hiClientzData.ts";
import { useError } from "@/components/store/useError.ts";
import toast from "react-hot-toast";

export const useAddServiceCharge = (currentBill: IBillData | null = null) => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const {
    isPending: addingServiceChargeLoader,
    mutateAsync: addingServiceCharge,
  } = useMutation({
    mutationFn: async (payload: Omit<AddServiceChargePayload, "variantId">) => {
      const finalPayload = createPayloadWithVariant(payload, currentBill);
      const response = await apiRpc.pos.add_service_charge.$post({
        json: finalPayload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || "Failed to add service charge");
        setOpenErrorModal(true);
        toast.error("Failed to add service charge");
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Service charge added successfully");
        const queryKey = getBillQueryKey(currentBill);
        queryClient.invalidateQueries({ queryKey });
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error adding service charge");
      setOpenErrorModal(true);
      toast.error("Error adding service charge");
    },
  });

  return {
    addingServiceChargeLoader,
    addingServiceCharge,
  };
};

export const useRemoveServiceCharge = (
  currentBill: IBillData | null = null,
) => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const {
    isPending: removingServiceChargeLoader,
    mutateAsync: removingServiceCharge,
  } = useMutation({
    mutationFn: async (
      payload: Omit<RemoveServiceChargePayload, "variantId">,
    ) => {
      const finalPayload = createPayloadWithVariant(payload, currentBill);
      const response = await apiRpc.pos.remove_service_charge.$post({
        json: finalPayload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || "Failed to remove service charge");
        setOpenErrorModal(true);
        toast.error("Failed to remove service charge");
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Service charge removed successfully");
        const queryKey = getBillQueryKey(currentBill);
        queryClient.invalidateQueries({ queryKey });
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error removing service charge");
      setOpenErrorModal(true);
      toast.error("Error removing service charge");
    },
  });

  return {
    removingServiceChargeLoader,
    removingServiceCharge,
  };
};

export const useEditServiceCharge = (currentBill: IBillData | null = null) => {
  const setError = useError((s) => s.setError);
  const setOpenErrorModal = useError((s) => s.setOpenErrorModal);

  const queryClient = useQueryClient();

  const {
    isPending: editingServiceChargeLoader,
    mutateAsync: editingServiceCharge,
  } = useMutation({
    mutationFn: async (
      payload: Omit<UpdateServiceChargePayload, "variantId">,
    ) => {
      const finalPayload = createPayloadWithVariant(payload, currentBill);
      const response = await apiRpc.pos.add_service_charge.$post({
        json: finalPayload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || "Failed to edit service charge");
        setOpenErrorModal(true);
        toast.error("Failed to edit service charge");
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Service charge edited successfully");
        const queryKey = getBillQueryKey(currentBill);
        queryClient.invalidateQueries({ queryKey });
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error editing service charge");
      setOpenErrorModal(true);
      toast.error("Error editing service charge");
    },
  });

  return {
    editingServiceChargeLoader,
    editingServiceCharge,
  };
};
