import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useError } from "@/components/store/useError";
import { apiRpc } from "@hi/common";

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
        const variable = cell.value.startsWith("@")
          ? storeVariables[cell.value.substring(1)] ?? ""
          : cell.value;
        return variable;
      });

      const response = await apiRpc.google_sheets.submit.$post({
        json: {
          spreadsheetId,
          range: range || "Sheet1!A1",
          values: [resolvedValues],
        },
      });

      const result = await response.json();

      if (!response.ok || result?.success === false || result?.err === true) {
        throw new Error(
          result?.error ||
            result?.message ||
            "Failed to append to Google Sheet",
        );
      }

      return result;
    },

    onSuccess: (data) => {
      alert("✅ Successfully added dynamic data to Google Sheet!");
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
