"use client";

import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useError } from "../../store/useError";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { toast } from "react-toastify";

interface IUseApplyJewelleryCoinzPayload {
  coinsClaimed: number;
  orderId: string;
}

export const useApplyJewelleryCoinz = () => {
  const queryClient = useQueryClient();
  const setError = useError((s) => s.setError);
  const setOpenError = useError((s) => s.setOpenErrorModal);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: IUseApplyJewelleryCoinzPayload) => {
      const res = await apiRpc.jewellery.payments.discounts.coins.add.$post({
        json: payload,
      });

      // 🔑 Parse here instead of later
      const response = await res.json();
      return { status: res.status, body: response };
    },
    onSuccess: ({ status, body }) => {
      if (status === 200 || status === 201) {
        toast.success("Coinz applied successfully");
        queryClient.invalidateQueries({ queryKey: ["jewelleryOrder"] });
        return;
      }
      if (status === 400 || status === 404) {
        toast.error("Failed to apply coinz");
        setOpenError(true);
        setError(body?.message || "Failed to apply coinz");
      }
      if (status === 401 || status === 403) {
        setOpenError(true);
        setError("You are not authorized to perform this action");
        setCheckLogin(true);
      }
      if (status === 409) {
        setOpenError(true);
        setError("Coinz already applied");
      }
    },
    onError: (error: any) => {
      setOpenError(true);
      setError(error?.message || "Something went wrong");
    },
  });

  return { isApplyingCoinz: isPending, applyJewelleryCoinz: mutateAsync };
};

interface IUseRemoveJewelleryCoinzPayload {
  orderId: string;
}
export const useRemoveJewelleryCoinz = () => {
  const setError = useError((s) => s.setError);
  const setOpenError = useError((s) => s.setOpenErrorModal);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: IUseRemoveJewelleryCoinzPayload) => {
      const res = await apiRpc.jewellery.payments.discounts.coins.remove.$post({
        json: payload,
      });
      const response = await res.json();
      return { status: res.status, body: response };
    },
    onSuccess: ({ status, body }) => {
      if (status === 200 || status === 201) {
        toast.success("Coinz Removed successfully");
        queryClient.invalidateQueries({ queryKey: ["jewelleryOrder"] });
        return;
      }
      if (status === 400 || status === 404) {
        toast.error("Failed to remove coinz");
        setOpenError(true);
        setError(response.message || "Failed to remove coinz");
      }
      if (status === 401 || status === 403) {
        setOpenError(true);
        setError("You are not authorized to perform this action");
        setCheckLogin(true);
      }
      if (status === 409) {
        setOpenError(true);
        setError("Coinz not applied");
      }
    },
    onError: (error: any) => {
      setOpenError(true);
      setError(error?.message || "Something went wrong");
    },
  });
  return { isRemovingCoinz: isPending, removeJewelleryCoinz: mutateAsync };
};
