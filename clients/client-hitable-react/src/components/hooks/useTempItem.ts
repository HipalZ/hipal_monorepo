// hooks/useCreateTempItem.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import { useError } from "@/components/store/useError"; // same pattern as your SplitBill hook

export type CreateTempItemPayload = {
  staffId: string;
  businessId: string;
  tableName: string;
  itemName: string;
  itemPrice: number;
  itemQuantity: number;
  kitchenId?: string;
  gst?: number;
};

export function useCreateTempItem(opts?: {
  onSuccess?: (json: any, variables: CreateTempItemPayload) => void;
  onError?: (err: unknown) => void;
}) {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTempItemPayload) => {
      return apiRpc.kot.open_item.$post({ json: payload });
    },
    onSuccess: async (res, variables) => {
      const json = await res.json();

      if (
        res.status === 400 ||
        res.status === 401 ||
        res.status === 409 ||
        res.status === 422
      ) {
        const msg = json?.message || "Failed to create temp item";
        setError(msg);
        setOpenErrorModal(true);
        return;
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(json?.message || "Temp item added");
        opts?.onSuccess?.(json, variables);
        return;
      }

      setError(json?.message || `Unexpected status: ${res.status}`);
      setOpenErrorModal(true);
    },
    onError: (err: any) => {
      setError(
        err?.message || "Something went wrong while creating the temp item.",
      );
      setOpenErrorModal(true);
      opts?.onError?.(err);
    },
  });
}
