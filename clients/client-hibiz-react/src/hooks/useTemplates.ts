import { apiRpc } from "@hi/common";
import { APP_ID, WHATSAPP_ID, WHATSAPP_TOKEN } from "@/configs";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/axios";
import toast from "react-hot-toast";
import type { WhatsAppTemplate } from "@/components/types/businessData";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp from "@/components/store/useWhatsapp";

export const useTemplates = () => {
  const { setTemplates } = useWhatsapp((s) => ({
    setTemplates: s.setTemplates,
  }));
  const allTemplatesApi = async () => {
    const config = {
      method: "GET",
      url: `https://graph.facebook.com/v21.0/${WHATSAPP_ID}/message_templates`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
    };
    try {
      const response = await axios(config);
      setTemplates(response?.data?.data);
      return (response?.data?.data as WhatsAppTemplate) || [];
    } catch (error) {
      return error;
    }
  };

  return { allTemplatesApi };
};

export const useCreateTemplate = () => {
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.businessData?._id);
  const createTemplateApi = async (payload: WhatsAppTemplate) => {
    const config = {
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${WHATSAPP_ID}/message_templates`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      data: payload,
    };
    try {
      const response = await axios(config);
      // 200 status code for successful template creation
      if (response.status === 200 && response?.data?.status !== "REJECTED") {
        toast.success("Template created successfully");
        navigate(`/app/business/${businessId}/templates`);
        return response || {};
      }
      toast.error("Error in creating template");
      navigate(`/app/business/${businessId}/templates`);
      return response || {};
    } catch (error) {
      const message = error?.response?.data?.error?.error_user_msg;
      if (message) {
        toast.error(message || "Error in updating template");
        navigate(`/app/business/${businessId}/templates`);
      }
      return error;
    }
  };

  return { createTemplateApi };
};

export const useEditTemplate = () => {
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { templateId } = useWhatsapp((s) => ({
    templateId: s.templateId,
  }));
  const editTemplateApi = async (payload: WhatsAppTemplate) => {
    const config = {
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${templateId}`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      data: payload,
    };
    try {
      const response = await axios(config);
      if (response.status === 200) {
        toast.success("Template updated successfully");
        return response || {};
      }
    } catch (error) {
      const message = error?.response?.data?.error?.error_user_msg;
      if (message) {
        toast.error(message || "Error in updating template");
        navigate(`/app/business/${businessId}/templates`);
      }

      return error;
    }
  };
  return { editTemplateApi };
};

export const useGetTemplate = () => {
  const { setTemplateData } = useWhatsapp((s) => ({
    setTemplateData: s.setTemplateData,
  }));
  const getTemplateApi = async (templateId: string) => {
    const config = {
      method: "GET",
      url: `https://graph.facebook.com/v21.0/${templateId}`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
    };
    try {
      const response = await axios(config);
      setTemplateData(response?.data);
      console.log(response?.data);
      return response?.data || {};
    } catch (error) {
      return error;
    }
  };

  return { getTemplateApi };
};

export const useDeleteTemplate = () => {
  const { templates, setTemplates } = useWhatsapp((s) => ({
    templates: s.templates,
    setTemplates: s.setTemplates,
  }));
  const deleteTemplateApi = async (
    templateId: string,
    templateName: string,
  ) => {
    const config = {
      method: "DELETE",
      url: `https://graph.facebook.com/v21.0/${WHATSAPP_ID}/message_templates?hsm_id=${templateId}&name=${templateName}`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
    };
    try {
      const response = await axios(config);
      if (response.status === 200) {
        toast.success("Template deleted successfully");
        const updatedTemplates = templates.filter(
          (template) => template.id !== templateId,
        );
        setTemplates(updatedTemplates);
        return response || {};
      }
    } catch (error) {
      return error;
    }
  };

  return { deleteTemplateApi };
};

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
  const sendOptions = useCallback(async (payload: any) => {
    const res = await apiRpc.whatsapp.template.campaign.$post({
      json: payload,
    });
    const response = await res.json();
    console.log("response", response);
    if (response?.data?.success) {
      toast.success("Message sent successfully");
    }
    return response;
  }, []);

  return { sendOptions };
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
      query: {
        start: "1111111111",
        end: "1111111111",
      },
    });
    const response = await res.json();
    console.log("response", response);
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
