import type { IDuesPersonsData } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export const useAllDueUsers = (businessId: string) => {
  const getAllUsers = async () => {
    const response = await apiRpc.dues[":businessId"].$get({
      param: {
        businessId: businessId,
      },
    });
    const res = await response.json();
    return res.data as IDuesPersonsData[];
  };

  const { isLoading, data } = useQuery({
    queryKey: ["allDueUsers", businessId],
    queryFn: getAllUsers,
    enabled: !!businessId,
  });

  return { isLoading, data };
};

export const useGetAllModes = (
  businessId: string,
  showPaymentMode: boolean,
) => {
  const { isLoading, data: paymentMode } = useQuery({
    queryKey: ["getAllModes"],
    queryFn: async () => {
      const response = await apiRpc.upi_mode.all[":businessId"].$get({
        param: {
          businessId: businessId || "",
        },
      });
      const res = await response.json();
      return (res?.data as IMode[]) || [];
    },
    enabled: !!businessId && !!showPaymentMode,
    staleTime: 1000 * 60,
  });

  return {
    isLoading,
    paymentMode,
  };
};
