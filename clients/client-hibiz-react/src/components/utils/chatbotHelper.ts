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

  /* ---------------------------------------------------------
     CREATE CHATBOT
  --------------------------------------------------------- */
  const { isPending: createLoader, mutateAsync: createChatbot } = useMutation({
    mutationFn: async (payload) => {
      const response = await apiRpc.wa_chatbot.$post({ json: payload });
      const body = await response.json();

      return { status: response.status, ...body };
    },

    onSuccess: (data) => {
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError(data?.message);
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Chatbot Successfully Created");
        queryClient.invalidateQueries({ queryKey: ["allChatbots"] });
      }
    },
    onError: (data) => {
      console.log(data);
      toast.error("Something went wrong");
    },
  });

  /* ---------------------------------------------------------
     UPDATE CHATBOT
  --------------------------------------------------------- */
  const { isPending: updateLoader, mutateAsync: updateChatbot } = useMutation({
    mutationFn: async ({ chatbotId, payload }) => {
      const response = await apiRpc.wa_chatbot[chatbotId].$put({
        json: payload,
      });
      const body = await response.json(); // ✅ Parse JSON

      return { status: response.status, ...body };
    },

    onSuccess: (data) => {
      if (data.status === 404) {
        setOpenErrorModal(true);
        setError(data?.message);
        return;
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError(data?.message);
        return;
      }
      if (data.status === 200) {
        toast.success("Chatbot Updated Successfully");
        queryClient.invalidateQueries({ queryKey: ["allChatbots"] });
      }
    },
    onError: (err) => {
      console.log(err);
      toast.error("Failed to update chatbot");
    },
  });

  const { mutateAsync: updateChatbotStatus } = useMutation({
    mutationFn: async ({
      chatbotId,
      businessId,
      status,
    }: { chatbotId: string; businessId: string; status: string }) => {
      const response = await apiRpc.wa_chatbot.status[chatbotId].$put({
        json: { businessId, status },
      });

      const body = await response.json();
      return { status: response.status, ...body };
    },
    onSuccess: (res) => {
      if (!res.err) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["allChatbots"] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to update chatbot status");
    },
  });

  return {
    createLoader,
    updateLoader,
    createChatbot,
    updateChatbot,
    updateChatbotStatus,
  };
};
