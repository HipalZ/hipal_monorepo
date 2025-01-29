import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useOrderStore, type IDuesPersonsData } from "./useOrderData";

export const useAllDueUsers = (businessId: string) => {
  const settleModes = useOrderStore((s) => s.settleModes);

  const getAllUsers = async () => {
    const settleModeName = settleModes[0]?.name?.toLowerCase();
    let response;

    if (settleModeName === "dues") {
      response = await apiRpc.dues[":businessId"].$get({
        param: { businessId },
      });
    } else if (settleModeName === "npc") {
      response = await apiRpc.npc[":businessId"].$get({
        param: { businessId },
      });
    }

    const res = await response.json();
    return res?.data as IDuesPersonsData[];
  };

  const { isLoading, data } = useQuery({
    queryKey: ["allDueUsers", businessId],
    queryFn: getAllUsers,
    enabled: !!businessId,
  });

  return { isLoading, data };
};
