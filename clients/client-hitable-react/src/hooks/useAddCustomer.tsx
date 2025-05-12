import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import { useError } from "@/components/store/useError";
import type { ICustomerInformation } from "@/components/types/hiClientzData";

export const useSendOtp = () => {
  const { setError, setOpenErrorModal } = useError();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRpc.users.resendOtp.$post({
        json: {
          phone,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send OTP");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("OTP sent successfully");
    },
    onError: (error: Error) => {
      setOpenErrorModal(true);
      setError(error.message || "Failed to send OTP");
    },
  });

  const sendOtp = async (phone: string) => {
    return await mutateAsync(phone);
  };

  return {
    sendOtp,
    isSendingOtp: isPending,
  };
};

interface VerifyOtpPayload {
  phone: string;
  name: string;
  otp: string;
  tableId: string;
}

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: VerifyOtpPayload) => {
      const response = await apiRpc.pos.link_user_to_bill.$put({
        json: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify OTP");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("OTP verified successfully");
      queryClient.invalidateQueries({ queryKey: ["fetchIndividualTable"] });
    },
  });

  const verifyOtp = async (
    phone: string,
    name: string,
    otp: string,
    tableId: string,
  ) => {
    return await mutateAsync({ phone, name, otp, tableId });
  };

  return {
    verifyOtp,
    isVerifyingOtp: isPending,
  };
};

export const useCustomerInformation = (userIds?: string[]) => {
  const fetchCustomerInfo = async (): Promise<ICustomerInformation[]> => {
    const response = await apiRpc.kot.table_user.$post({
      json: {
        userIds: userIds || [],
      },
    });
    const res = await response.json();
    return (res?.data as ICustomerInformation[]) ?? [];
  };

  return useQuery({
    queryKey: ["getCustomerInformation", userIds],
    queryFn: fetchCustomerInfo,
    enabled: !!userIds?.length,
  });
};
