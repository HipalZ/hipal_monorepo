import { apiRpc } from "@hi/common";
import { useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { IWhatsAppFlows } from "@/components/types/businessData";
import useBusinessData from "@/components/store/useBusinessData";
import { WHATSAPP_TOKEN } from "@/configs";
import axios from "axios";

const GRAPH_BASE_URL = "https://graph.facebook.com/v21.0";
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

export const usePublishFlow = () => {
  const publishFlow = useMutation({
    mutationFn: async (flowId: string) => {
      try {
        const { data } = await axios.post(
          `https://graph.facebook.com/v21.0/${flowId}/publish`,
          {},
          {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
          },
        );
        return data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.error?.message || "Failed to publish flow",
        );
      }
    },
  });

  return {
    publishFlow,
  };
};

export const useSetEndpointURI = () => {
  return useMutation({
    mutationFn: async ({
      flowId,
      endpoint,
    }: { flowId: string; endpoint: string }) => {
      try {
        const { data } = await axios.post(
          `${GRAPH_BASE_URL}/${flowId}/endpoints`,
          {
            uri: endpoint,
            http_method: "POST",
          },
          {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
          },
        );
        return data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.error?.message || "Failed to set endpoint URI",
        );
      }
    },
  });
};

export const useAddPhoneNumber = () => {
  return useMutation({
    mutationFn: async ({
      wabaId,
      phoneNumberId,
    }: { wabaId: string; phoneNumberId: string }) => {
      try {
        const { data } = await axios.post(
          `${GRAPH_BASE_URL}/${wabaId}/phone_numbers`,
          {
            phone_number_id: phoneNumberId,
          },
          {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
          },
        );
        return data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.error?.message || "Failed to add phone number",
        );
      }
    },
  });
};

// 3️⃣ Sign Public Key
export const useSignPublicKey = () => {
  return useMutation({
    mutationFn: async ({
      flowId,
      publicKey,
    }: { flowId: string; publicKey: string }) => {
      try {
        const { data } = await axios.post(
          `${GRAPH_BASE_URL}/${flowId}/public_key`,
          {
            public_key: publicKey,
          },
          {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
          },
        );
        return data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.error?.message || "Failed to sign public key",
        );
      }
    },
  });
};

// 4️⃣ Connect Meta App
export const useConnectMetaApp = () => {
  return useMutation({
    mutationFn: async ({
      flowId,
      appId,
    }: { flowId: string; appId: string }) => {
      try {
        const { data } = await axios.post(
          `${GRAPH_BASE_URL}/${flowId}/apps`,
          {
            app_id: appId,
          },
          {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
          },
        );
        return data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.error?.message || "Failed to connect Meta app",
        );
      }
    },
  });
};

// 5️⃣ Run Health Check
export const useRunHealthCheck = () => {
  return useMutation({
    mutationFn: async (flowId: string) => {
      try {
        const { data } = await axios.post(
          `${GRAPH_BASE_URL}/${flowId}/health_check`,
          {},
          {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            },
          },
        );
        return data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.error?.message || "Health check failed",
        );
      }
    },
  });
};
