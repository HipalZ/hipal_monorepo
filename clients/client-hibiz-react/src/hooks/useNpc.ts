import type { IDuesPersonsData } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useApiErrorHandler } from "./useApiErrorHandler";

export const useAllNpcUsers = (businessId: string) => {
  const { handleEnvelope } = useApiErrorHandler();
  if (businessId === "") return;
  const getAllUsers = async () => {
    const response = await apiRpc.npc[":businessId"].$get({
      param: {
        businessId: businessId,
      },
    });
    const res = await handleEnvelope(response);

    let npcData = res as IDuesPersonsData[];
    npcData = npcData.filter((npc) => npc.userId !== null);
    return npcData ?? ([] as IDuesPersonsData[]);
  };

  const { isLoading, data } = useQuery({
    queryKey: ["allNpcUsers", businessId],
    queryFn: getAllUsers,
    enabled: !!businessId,
  });

  return { isLoading, data };
};
