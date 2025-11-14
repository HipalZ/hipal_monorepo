import { useError } from "@/components/store/useError.ts";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import { useApiErrorHandler } from "./useApiErrorHandler.ts";
export interface Password {
  _id: string;
  name: string;
  password: string;
  isActive: boolean;
}

export const useGetAllPasswords = () => {
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const businessId = useParams().businessId as string;

  if (businessId === "") {
    return;
  }

  const fetchAllPasswords = async () => {
    const response = await apiRpc.password_manager.fetch_password.$get({
      query: {
        businessId: businessId,
      },
    });
    await handleEnvelope(response);
    const res = await response.json();
    const passwords = res?.data as Password[];
    return passwords;
  };

  const { isLoading, data: passwords } = useQuery({
    queryKey: ["getAllPasswords", businessId],
    queryFn: fetchAllPasswords,
    enabled: !!businessId,
  });

  return {
    isLoading,
    passwords,
  };
};

export interface UpdateDiscountPasswordPayload {
  discountPasswordId: string;
  password: string;
  isActive?: boolean;
}

export const useUpdateDiscountPassword = () => {
  const businessId = useParams().businessId as string;
  const queryClient = useQueryClient();
  const handleEnvelope = useApiErrorHandler().handleEnvelope;

  const { setError, setOpenErrorModal } = useError();
  const {
    isPending: updatingDiscountPassword,
    mutateAsync: updateDiscountPassword,
  } = useMutation({
    mutationFn: async (payload: UpdateDiscountPasswordPayload) => {
      const response = await apiRpc.password_manager.discount.$put({
        json: payload,
      });
      await handleEnvelope(response);
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError(data.message);
        return toast.error(data.message);
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Discount password already exists");
        return toast.error("Discount password already exists");
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Discount password updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["getAllPasswords", businessId],
        });
        return toast.success("Discount password updated successfully");
      }
    },
    onError: (data) => {
      console.log(data);
    },
  });
  return {
    updateDiscountPassword,
    updatingDiscountPassword,
  };
};

export interface UpdateDeleteKotPasswordPayload {
  deletePasswordId: string;
  password: string;
  isActive?: boolean;
}

export const useUpdateDeleteKotPassword = () => {
  const businessId = useParams().businessId as string;
  const queryClient = useQueryClient();
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const { setError, setOpenErrorModal } = useError();
  const { isPending: updatingKotPassword, mutateAsync: updateKotPassword } =
    useMutation({
      mutationFn: async (payload: UpdateDeleteKotPasswordPayload) => {
        const response = await apiRpc.password_manager.delete_kot.$put({
          json: payload,
        });
        await handleEnvelope(response);
        return response;
      },
      onSuccess: (data) => {
        if (data.status === 400 || data.status === 401) {
          setOpenErrorModal(true);
          setError("Delete KOT password update failed");
          return toast.error("Delete KOT password update failed");
        }
        if (data.status === 409) {
          setOpenErrorModal(true);
          setError("Delete KOT password already exists");
          return toast.error("Delete KOT password already exists");
        }
        if (data.status === 200 || data.status === 201) {
          toast.success("Delete KOT password updated successfully");
          queryClient.invalidateQueries({
            queryKey: ["getAllPasswords", businessId],
          });
          return toast.success("Delete KOT password updated successfully");
        }
      },
      onError: (data) => {
        console.log(data);
      },
    });
  return { updateKotPassword, updatingKotPassword };
};

export interface UpdateServiceChargePasswordPayload {
  serviceChargePasswordId: string;
  password: string;
  isActive?: boolean;
}

export const useUpdateServiceChargePassword = () => {
  const businessId = useParams().businessId as string;
  const queryClient = useQueryClient();
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const { setError, setOpenErrorModal } = useError();
  const {
    isPending: updatingServiceChargePassword,
    mutateAsync: updateServiceChargePassword,
  } = useMutation({
    mutationFn: async (payload: UpdateServiceChargePasswordPayload) => {
      const response = await apiRpc.password_manager.service_charge.$put({
        json: payload,
      });
      await handleEnvelope(response);
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Service Charge password update failed");
        return toast.error("Service Charge password update failed");
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Service Charge password already exists");
        return toast.error("Service Charge password already exists");
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Service Charge password updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["getAllPasswords", businessId],
        });
        return toast.success("Service Charge password updated successfully");
      }
    },
    onError: (data) => {
      console.log(data);
    },
  });
  return { updateServiceChargePassword, updatingServiceChargePassword };
};
