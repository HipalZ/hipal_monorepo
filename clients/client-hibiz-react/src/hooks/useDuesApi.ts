import type { ISettleMode } from "@/components/store/useDues";
import type { IMode } from "@/components/templates/payment/selectPaymentMode";
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
    let duesData = res.data as IDuesPersonsData[];
    duesData = duesData.filter(due => due.userId !== null);
    return duesData as IDuesPersonsData[];
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

export const settleDues = async (
  businessId: string,
  userId: string,
  settleModes: ISettleMode[],
) => {
  const response = await apiRpc.dues.settle_dues.$put({
    json: {
      businessId,
      duesUserId: userId,
      settleModes,
    },
  });
  return response.json();
};
