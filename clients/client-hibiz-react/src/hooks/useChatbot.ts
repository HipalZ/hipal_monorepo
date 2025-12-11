import useBusinessData from "@/components/store/useBusinessData";
import { useError } from "@/components/store/useError";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type GoogleSheetSubmitPayload = {
  spreadsheetId: string;
  range: string;
  cells: { key: string; value: string }[];
  businessId: string;
  sessionKey: string;
};

export const useSubmitGoogleSheet = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: submitLoading, mutateAsync: submitToSheet } = useMutation({
    mutationFn: async (payload: GoogleSheetSubmitPayload) => {
      const { spreadsheetId, range, cells, businessId, sessionKey } = payload;

      const headerRow = cells.map((cell) => cell.key || "");
      const response = await apiRpc.google_sheets.submit.$post({
        json: {
          businessId,
          sessionKey,
          spreadsheetId,
          range: range || "Sheet1!A1",
          values: [headerRow],
        },
      });

      const result = await response.json();
      if (!response.ok || result?.success === false || result?.err === true) {
        throw new Error(
          result.error || result.message || "Failed to append to Google Sheet",
        );
      }

      return result;
    },

    onSuccess: (data) => {
      toast.success("✅ Successfully added dynamic data to Google Sheet!");
      queryClient.invalidateQueries({ queryKey: ["googleSheetsList"] });
    },

    onError: (error: Error) => {
      console.error("❌ Google Sheet append failed:", error.message);
      setError(error.message);
      setOpenErrorModal(true);
    },
  });

  return { submitLoading, submitToSheet };
};

export const fetchAllChatbots = async (businessId: string) => {
  try {
    const response = await apiRpc.wa_chatbot.allchatbots.$get({
      query: { businessId },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chatbots: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (err) {
    console.error("Error fetching chatbots:", err);
    return [];
  }
};

export function useAllChatbots() {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  return useQuery({
    queryKey: ["allChatbots"],
    queryFn: () => fetchAllChatbots(businessId),
    enabled: !!businessId,
  });
}

// export const fetchChatbotAnalyticsSummary = async (chatbotId: string) => {
//   const response = await apiRpc.wa_chatbot_analytics[":chatbotId"].summary.$get(
//     {
//       param: {
//         chatbotId,
//       },
//     },
//   );
//   if (!response.ok) {
//     throw new Error(`Failed to fetch chatbot analytics: ${response.status}`);
//   }
//   const result = await response.json();
//   return result.data || {};
// };

export const fetchChatbotSessions = async (chatbotId: string) => {
  const response = await apiRpc.wa_chatbot_analytics[
    ":chatbotId"
  ].sessions.$get({
    param: {
      chatbotId,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch chatbot analytics: ${response.status}`);
  }
  const result = await response.json();
  return result.data || {};
};

// export function useChatbotAnalytics(chatbotId: string) {
//   return useQuery({
//     queryKey: ["chatbotAnalytics", chatbotId],
//     queryFn: () => fetchChatbotAnalyticsSummary(chatbotId),
//     enabled: !!chatbotId,
//   });
// }

export function useChatbotSessions(chatbotId: string) {
  return useQuery({
    queryKey: ["chatbotSessions", chatbotId],
    queryFn: () => fetchChatbotSessions(chatbotId),
    enabled: !!chatbotId,
  });
}
