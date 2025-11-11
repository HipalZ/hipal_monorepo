import { useError } from '@/components/store/useError';
import { apiRpc } from '@hi/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type GoogleSheetSubmitPayload = {
  spreadsheetId: string;
  range: string;
  cells: { key: string; value: string }[];
  storeVariables?: Record<string, any>;
};

export const useSubmitGoogleSheet = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: submitLoading, mutateAsync: submitToSheet } = useMutation({
    mutationFn: async (payload: GoogleSheetSubmitPayload) => {
      const { spreadsheetId, range, cells, storeVariables } = payload;
      const resolvedValues = cells.map((cell) => {
        const variable = cell.value.startsWith('@') ? (storeVariables[cell.value.substring(1)] ?? '') : cell.value;
        return variable;
      });

      const response = await apiRpc.google_sheets.submit.$post({
        json: {
          spreadsheetId,
          range: range || 'Sheet1!A1',
          values: [resolvedValues],
        },
      });

      const result = await response.json();

      if (!response.ok || result?.success === false || result?.err === true) {
        throw new Error(result?.error || result?.message || 'Failed to append to Google Sheet');
      }

      return result;
    },

    onSuccess: (data) => {
      alert('✅ Successfully added dynamic data to Google Sheet!');
      queryClient.invalidateQueries({ queryKey: ['googleSheetsList'] });
    },

    onError: (error: Error) => {
      console.error('❌ Google Sheet append failed:', error.message);
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
    console.error('Error fetching chatbots:', err);
    return [];
  }
};

export function useAllChatbots(businessId: string) {
  return useQuery({
    queryKey: ['chatbots'],
    queryFn: () => fetchAllChatbots(businessId),
    enabled: !!businessId,
  });
}

// export function useChatbotAnalytics(chatbotId: string) {
//   return useQuery({
//     queryKey: ['chatbotAnalytics', chatbotId],
//     queryFn: () => fetchChatbotAnalyticsSummary(chatbotId),
//     enabled: !!chatbotId,
//   });
// }

// export function useChatbotSessions(chatbotId: string) {
//   return useQuery({
//     queryKey: ['chatbotSessions', chatbotId],
//     queryFn: () => fetchChatbotSessions(chatbotId),
//     enabled: !!chatbotId,
//   });
// }
