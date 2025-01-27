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
