import type { IDuesPersonsData } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export const useAllNpcUsers = (businessId: string) => {
  if(businessId === "") return ;
  const getAllUsers = async () => {
    const response = await apiRpc.npc[":businessId"].$get({
      param: {
        businessId: businessId,
      },
    });
    const res = await response.json();
    let npcData = res.data as IDuesPersonsData[];
    npcData = npcData.filter(npc => npc.userId !== null);
    return npcData ?? [] as IDuesPersonsData[];
  };

  const { isLoading, data } = useQuery({
    queryKey: ["allNpcUsers", businessId],
    queryFn: getAllUsers,
    enabled: !!businessId,
  });

  return { isLoading, data };
};
