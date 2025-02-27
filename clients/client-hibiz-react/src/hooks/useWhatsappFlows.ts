import { apiRpc } from "@hi/common";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { IWhatsAppFlows } from "@/components/types/businessData";
import useBusinessData from "@/components/store/useBusinessData";

export const useGetFlows = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const businessId = businessData?._id;

  const getFlows = useCallback(async () => {
    if (!businessId) return [];

    const flows = await apiRpc.whatsapp_flow[":businessId"].$get({
      param: {
        businessId,
      },
    });

    const flowData = await flows.json();
    return (flowData.data as IWhatsAppFlows[]) || [];
  }, [businessId]);

  const { data: flowsData, isLoading: flowsLoading } = useQuery({
    queryKey: ["whatsAppFlows", businessId],
    queryFn: getFlows,
    enabled: !!businessId,
  });

  return {
    flowsData,
    flowsLoading,
  };
};
