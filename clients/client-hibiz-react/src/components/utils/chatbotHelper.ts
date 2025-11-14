import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useError } from "../store/useError";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";

export function cleanPayload(obj: any): any {
  if (Array.isArray(obj)) {
    return obj
      .map((v) => cleanPayload(v))
      .filter(
        (v) =>
          v !== "" &&
          v !== null &&
          v !== undefined &&
          !(Array.isArray(v) && v.length === 0) &&
          !(
            typeof v === "object" &&
            !Array.isArray(v) &&
            Object.keys(v).length === 0
          ),
      );
  } else if (typeof obj === "object" && obj !== null) {
    // 🟢 Preserve "sheet" objects — don't deep-clean them away
    if ("sheetName" in obj || "spreadsheetId" in obj || "cells" in obj) {
      console.log("Preserving sheet object:", obj);
      return obj;
    }

    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanPayload(value);
      const shouldKeep =
        cleanedValue !== "" &&
        cleanedValue !== null &&
        cleanedValue !== undefined &&
        !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
        !(
          typeof cleanedValue === "object" &&
          !Array.isArray(cleanedValue) &&
          Object.keys(cleanedValue).length === 0
        );
      if (shouldKeep) cleaned[key] = cleanedValue;
    }
    return cleaned;
  }
  return obj;
}

export const useChatBot = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: createLoader, mutateAsync: createChatbot } = useMutation({
    mutationFn: async (payload) => {
      const response = await apiRpc.wa_chatbot.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 400 || data.status === 401) {
        toast.error("Failed to update category");
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Chatbot already exists");
        return toast.error("Chatbot already exists");
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Chatbot Successfully Created");
        queryClient.invalidateQueries({
          queryKey: ["getServiceCategories"],
        });
        return;
      }
    },
    onError: (data) => {
      console.log(data);
    },
  });

  return { createLoader, createChatbot };
};
