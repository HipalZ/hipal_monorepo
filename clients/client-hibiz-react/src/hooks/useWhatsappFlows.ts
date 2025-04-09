import { apiRpc } from "@hi/common";
import { useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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

const clientId = "1166415764661953";
const clientSecret = "25204b889d580b90cd842b2502bddf88";
const redirectUri = "";

export const useExchangeToken = () => {
  const {
    mutateAsync: exchangeToken,
    isPending,
    data,
    error,
  } = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(
          redirectUri,
        )}&code=${code}`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to exchange token");
      }

      return result;
    },
  });

  return {
    exchangeToken,
    isPending,
    data,
    error,
  };
};
