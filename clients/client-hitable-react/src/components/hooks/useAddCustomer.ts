import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import toast from "react-hot-toast";
import { getBillQueryKey } from "@/components/utils/api.utils";

export interface AddCustomerPayload {
  businessId: string;
  tableName: string;
  customerName: string;
  phone?: string;
  variantId?: string; // only if bill has variant
}

const validatePayload = (payload: AddCustomerPayload) => {
  const name = (payload.customerName || "").trim();

  if (name.length < 2 || name.length > 25) {
    throw new Error("Customer name must be between 2 and 25 characters.");
  }

  // Allow letters, spaces and dots
  if (!/^[A-Za-z\s.]+$/.test(name)) {
    throw new Error("Name can only contain letters, spaces and dots.");
  }

  if (!payload.businessId) {
    throw new Error("Business ID is missing.");
  }

  if (!payload.tableName) {
    throw new Error("Table name is missing.");
  }

  if (payload.phone && !/^\d{10}$/.test(payload.phone)) {
    throw new Error("Phone number must be exactly 10 digits.");
  }
};

export const useAddCustomer = () => {
  const { handleEnvelope } = useApiErrorHandler();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddCustomerPayload) => {
      validatePayload(payload);

      // 🔁 Adjust this endpoint to your actual RPC route
      const response = await apiRpc.pos.bill.user.$post({
        json: payload,
      });

      const data = await handleEnvelope(response);
      console.log("Add Customer Response:", data);
      return data;
    },
    onSuccess: () => {
      toast.success("Customer added successfully");
      const queryKey = ["getTableBill"];
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err?.message || "Failed to add customer");
    },
  });
};
