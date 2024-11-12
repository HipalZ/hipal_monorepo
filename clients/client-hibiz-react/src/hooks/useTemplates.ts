import { apiRpc } from "@hi/common";
import { APP_ID, WHATSAPP_TOKEN } from "@/configs";
import { useCallback } from "react";
import axios from "@/axios";
import toast from "react-hot-toast";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp, { Step } from "@/components/store/useWhatsapp";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WhatsAppTemplate } from "@/components/types/businessData";
import { useNavigate } from "react-router-dom";

export const useCreatingTemplate = () => {
  const { setTemplateId } = useWhatsapp((s) => ({
    setTemplateId: s.setTemplateId,
  }));
  const createTemplate = async (payload: any) => {
    const res = await apiRpc.whatsapp.template.$post({
      json: payload,
    });
    const response = await res.json();
    setTemplateId(response?.data?.id);
    return response;
  };

  return { createTemplate };
};

export const useCreateTemplateMutation = () => {
  const queryClient = useQueryClient();
  const setTemplateId = useWhatsapp((s) => s.setTemplateId);
  const setStep = useWhatsapp((s) => s.setStep);

  return useMutation({
    mutationFn: async (payload: WhatsAppTemplate) => {
      const res = await apiRpc.whatsapp.template.$post({
        json: payload,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setTemplateId(data?.data?.id);
      queryClient.invalidateQueries(["templates"]);
      toast.success("Template created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create template");
      setStep(Step.SETUP);
    },
  });
};

export const useEditTemplateMutation = () => {
  const queryClient = useQueryClient();
  const setStep = useWhatsapp((s) => s.setStep);

  return useMutation({
    mutationFn: async (payload: WhatsAppTemplate) => {
      const res = await apiRpc.whatsapp.template[":templateid"].$put({
        json: payload,
        param: {
          templateid: payload.templateId,
        },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["templates"]);
      toast.success("Template updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update template");
      setStep(Step.SETUP);
    },
  });
};

export const useFetchTemplates = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setAllTemplates } = useWhatsapp((s) => ({
    setAllTemplates: s.setAllTemplates,
  }));
  const getTemplates = async () => {
    const res = await apiRpc.whatsapp.template.all[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    setAllTemplates(response?.data);
    return response?.data || {};
  };
  return { getTemplates };
};

export const useMediaUpload = () => {
  const { imageFiles } = useWhatsapp((s) => ({
    imageFiles: s.imageFiles,
  }));

  const uploadMedia = async () => {
    if (!imageFiles) return toast.error("No image files to upload");
    // Step 1: Start upload session
    try {
      const sessionResponse = await axios({
        method: "POST",
        url: `https://graph.facebook.com/v21.0/${APP_ID}/uploads`,
        params: {
          file_name: imageFiles.name,
          file_length: imageFiles.size,
          file_type: imageFiles.type,
          access_token: WHATSAPP_TOKEN,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Step 2: Upload the file
      const formData = new FormData();
      formData.append("file", imageFiles);
      formData.append("file_name", imageFiles.name);

      const uploadResponse = await axios.post(
        `http://localhost:3000/upload?sessionId=${sessionResponse.data.id}`,
        formData,
      );
      console.log("uploadResponse", uploadResponse);
      return uploadResponse?.data?.h;
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Upload failed");
    }
  };

  return { uploadMedia };
};

export const useEditingTemplate = () => {
  const editTemplate = useCallback(async (payload: any) => {
    const res = await apiRpc.whatsapp.template[":templateid"].$put({
      json: payload,
      param: {
        templateid: payload?.templateId,
      },
    });
    const response = await res.json();
    return response;
  }, []);

  return { editTemplate };
};

export const useSendMessages = () => {
  const sendMessage = useCallback(async (payload: any) => {
    const res = await apiRpc.whatsapp.template.campaign.$post({
      json: payload,
    });
    const response = await res.json();
    return response;
  }, []);

  return { sendMessage };
};

export const useSendOptions = () => {
  const setStep = useWhatsapp((s) => s.setStep);
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRpc.whatsapp.template.campaign.$post({
        json: payload,
      });
      const response = await res.json();
      return response;
    },
    onSuccess: (response) => {
      if (response?.data?.success) {
        toast.success("Message sent successfully");
      }

      setStep(Step.SETUP);
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
    },
  });
};

export const useTemplateAnalytics = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setTemplateAnalytics, setTotalData } = useWhatsapp((s) => ({
    setTemplateAnalytics: s.setTemplateAnalytics,
    setTotalData: s.setTotalData,
  }));
  const getTemplateAnalytics = useCallback(async () => {
    const res = await apiRpc.whatsapp.template.analytics[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    const total = response?.data?.slice(0, -1);
    setTemplateAnalytics(total);
    const totalData = response?.data?.slice(-1);
    setTotalData(totalData);
    return response?.data;
  }, [businessId, setTemplateAnalytics, setTotalData]);

  return { getTemplateAnalytics };
};

export const useWalletBalance = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setWalletBalance, setWalletHistory } = useWhatsapp((s) => ({
    setWalletBalance: s.setWalletBalance,
    setWalletHistory: s.setWalletHistory,
  }));
  const getWalletBalance = useCallback(async () => {
    const res = await apiRpc.whatsapp.whatsapp_wallet[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    setWalletBalance(response?.data?.currentBalance);
    return response;
  }, [businessId, setWalletBalance]);

  const getWalletHistory = useCallback(async () => {
    const res = await apiRpc.whatsapp.whatsapp_wallet.history[
      ":businessId"
    ].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    setWalletHistory(response?.data);
    return response;
  }, [businessId, setWalletHistory]);

  return { getWalletBalance, getWalletHistory };
};
