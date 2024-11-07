import axios from "@/axios";
import useBusinessData from "@/components/store/useBusinessData";
import useWhatsapp from "@/components/store/useWhatsapp";
import type { WhatsAppTemplate } from "@/components/types/businessData";
import { WHATSAPP_ID, WHATSAPP_TOKEN } from "@/configs";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
  const createTemplate = async (payload: any) => {
    const res = await apiRpc.whatsapp.template.$post({
      json: payload,
    });
    const response = await res.json();
    console.log("response", response);
  };

  return { createTemplate };
};
