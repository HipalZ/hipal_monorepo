import axios from "@/axios";
import useBusinessData from "@/components/store/useBusinessData";
import { useMessageRecipientsStore } from "@/components/store/useMessageRecipientsStore";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import useWhatsapp, {
  Step,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import type {
  ICouponzLinks,
  ISendOptionsPayload,
  IUserMessage,
  IWalletHistory,
  MainResponseHandling,
  WhatsAppTemplatePayload,
} from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const businessId = useBusinessData((s) => s.businessData?._id);
  const setIsLoading = useWhatsappTempStore((s) => s.setIsLoading);
  const {
    setStep,
    setShowSuccessPopup,
    setTemplateStatus,
    setTemplateData,
    setTemplateId,
    setTemplateSteps,
  } = useWhatsapp((s) => ({
    setStep: s.setStep,
    setShowSuccessPopup: s.setShowSuccessPopup,
    setTemplateStatus: s.setTemplateStatus,
    setTemplateData: s.setTemplateData,
    setTemplateId: s.setTemplateId,
    setTemplateSteps: s.setTemplateSteps,
  }));

  const createTemplate = async (payload: WhatsAppTemplatePayload) => {
    // API call to create template
    if (!businessId) return null;
    const res = await apiRpc.whatsapp.template.$post({
      json: {
        ...payload,
        businessId: businessId,
      },
    });

    const data = (await res.json()) as MainResponseHandling;
    setIsLoading(false);
    if (data?.err || res.status === 400) {
      setStep(Step.SETUP);
      setTemplateSteps(TemplateSteps.NONE);
      setShowSuccessPopup(false);
      return toast.error(
        data?.data?.error?.error_user_msg || "Failed to create template",
      );
    }
    // Handle success response
    setTemplateId(data?.data?.id);
    setShowSuccessPopup(true);
    setTemplateStatus(data?.data?.status);
    setTemplateData(data?.data);
    setStep(Step.SETUP);
    setTemplateSteps(TemplateSteps.NONE);
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    return data;
  };

  return { createTemplate };
};

export const useEditTemplate = () => {
  const queryClient = useQueryClient();
  const { setStep, setShowSuccessPopup, setTemplateStatus, setTemplateSteps } =
    useWhatsapp((s) => ({
      setStep: s.setStep,
      setShowSuccessPopup: s.setShowSuccessPopup,
      setTemplateStatus: s.setTemplateStatus,
      setTemplateSteps: s.setTemplateSteps,
    }));
  const setIsLoading = useWhatsappTempStore((s) => s.setIsLoading);
  const editTemplate = async (payload: WhatsAppTemplatePayload) => {
    // API call to edit template
    const res = await apiRpc.whatsapp.template[":templateid"][
      ":businessId"
    ].$put({
      json: payload,
      param: { templateid: payload.templateId, businessId: payload.businessId },
    });

    const data = await res.json();
    setIsLoading(false);
    // Handle error response
    if (data?.err || res.status === 400) {
      setStep(Step.SETUP);
      setTemplateSteps(TemplateSteps.NONE);
      setShowSuccessPopup(false);
      toast.error(
        data?.data?.error?.error_user_msg || "Failed to update template",
      );
      return null;
    }
    setShowSuccessPopup(true);
    setTemplateStatus(data?.data?.status);
    setStep(Step.SETUP);
    setTemplateSteps(TemplateSteps.NONE);
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    return data;
  };

  return { editTemplate };
};

export const useFetchTemplates = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setAllTemplates } = useWhatsappTempStore((s) => ({
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
  const { imageFiles, setImageUrl } = useWhatsapp((s) => ({
    imageFiles: s.imageFiles,
    setImageUrl: s.setImageUrl,
  }));

  const businessId = useBusinessData((s) => s.businessData?._id);

  const [isUploading, setIsUploading] = useState(false);

  const uploadMedia = async (): Promise<{ url: string; handle: string }> => {
    try {
      if (!imageFiles) {
        throw new Error("No image files to upload");
      }

      setIsUploading(true);

      const res = await apiRpc.whatsapp.whatsapp_config[":businessId"].$get({
        param: {
          businessId,
        },
      });

      const response = await res.json();
      console.log("responseala ahe", response);

      // Step 1: Start upload session
      // TODO: CALL API TO APPiD TOKEN
      const sessionResponse = await axios.post(
        `https://graph.facebook.com/v21.0/${response?.data?.appId}/uploads`,
        null,
        {
          params: {
            file_name: imageFiles.name,
            file_length: imageFiles.size,
            file_type: imageFiles.type,
            access_token: response?.data?.token,
          },
          headers: { "Content-Type": "application/json" },
        },
      );

      // Step 2: Upload to custom storage
      const imageId = crypto.randomUUID();
      const storageFormData = new FormData();
      storageFormData.append("fileData", imageFiles);
      storageFormData.append("fileName", `${imageId}`);
      storageFormData.append("bucketName", "assets");

      const storageResponse = await axios.post(
        "https://storage.test.hipalz.com/upload",
        storageFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (storageResponse.status === 201 || storageResponse.status === 200) {
        setImageUrl(storageResponse.data.url);
      }

      // Step 3: Upload the file
      const formData = new FormData();
      formData.append("file", imageFiles);
      formData.append("file_name", imageFiles.name);

      const uploadResponse = await axios.post(
        `https://temp-storage-six.vercel.app/upload?sessionId=${sessionResponse.data.id}`,
        formData,
      );

      setIsUploading(false);

      return {
        url: storageResponse.data.url as string,
        handle: uploadResponse.data.h as string,
      };
    } catch (error) {
      setIsUploading(false);
      console.error("Upload failed:", error);
      throw error;
    }
  };

  return {
    uploadMedia,
    isUploading,
  };
};

export const useSendOptions = () => {
  const queryClient = useQueryClient();
  const { setStep, setTemplateSteps } = useWhatsapp((s) => ({
    setStep: s.setStep,
    setTemplateSteps: s.setTemplateSteps,
  }));
  const clearMessageRecipientsStore = useMessageRecipientsStore(
    (s) => s.clearMessageRecipientsStore,
  );
  return useMutation({
    mutationFn: async (payload: ISendOptionsPayload) => {
      const res = await apiRpc.whatsapp.template.campaign.$post({
        json: payload,
      });
      const response = await res.json();
      return response;
    },
    onSuccess: (response) => {
      if (response.err) {
        toast.error(response?.message || "Failed to send message");
      } else {
        toast.success("Message sent successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["walletHistory"] });
      clearMessageRecipientsStore();
      setTemplateSteps(TemplateSteps.NONE);
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
    setTemplateSteps: s.setTemplateSteps,
    setStep: s.setStep,
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
    if (!businessId) return;
    const res = await apiRpc.whatsapp.whatsapp_wallet.history[
      ":businessId"
    ].$get({
      param: {
        businessId,
      },
    });
    const response: { data: IWalletHistory[] } = await res.json();
    setWalletHistory(response?.data);
    return response;
  }, [businessId, setWalletHistory]);

  return { getWalletBalance, getWalletHistory };
};

export const useCouponzLinks = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setCouponzLinks } = useWhatsapp((s) => ({
    setCouponzLinks: s.setCouponzLinks,
  }));

  const getCouponzLinks = useCallback(async () => {
    const res = await apiRpc.whatsapp.coupon_link[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response: { data: ICouponzLinks[]; err: boolean; message: string } =
      await res.json();
    setCouponzLinks(response?.data);
    return response;
  }, [businessId, setCouponzLinks]);

  return { getCouponzLinks };
};

export const useSendWhatsappMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: IUserMessage) => {
      const res = await apiRpc.whatsapp["send-messages"].$post({
        json: payload,
      });
      const response = await res.json();
      return response;
    },
    onSuccess: (response) => {
      if (response.err) {
        toast.error(response?.message || "Failed to send message");
      } else {
        toast.success("Message sent successfully");
      }
      // queryClient.invalidateQueries({ queryKey: ["fetchUserChats"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
    },
  });
};

export const useDeleteChats = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      ownerId,
    }: { userId: string; ownerId: string }) => {
      await apiRpc.whatsapp["user-messages"][":userId"][":ownerId"].$delete({
        param: {
          userId,
          ownerId,
        },
      });
    },
    onSuccess: () => {
      toast.success("Chats deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["fetchUserChats"] });
      // queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
    onError: () => {
      toast.error("Failed to delete chats");
    },
  });
};

export const useFetchAllUsers = () => {
  const { setUsers } = useWhatsappTempStore((s) => ({
    setUsers: s.setUsers,
  }));
  const businessId = useBusinessData((s) => s.businessData?._id);
  const fetchAllUserMessages = async () => {
    const response = await apiRpc.subscribers.all[":businessId"].$get({
      param: { businessId },
    });
    const userMessages = await response.json();
    setUsers(userMessages?.data);
    return userMessages;
  };

  return { fetchAllUserMessages };
};

export const useFetchUserChats = () => {
  const { setUserChat, selectedUser } = useWhatsappTempStore((s) => ({
    setUserChat: s.setUserChat,
    selectedUser: s.selectedUser,
  }));
  const ownerId = useOwnerLogin((s) => s.user?._id);
  const businessId = useBusinessData((s) => s.businessData?._id);
  const fetchUserChats = async () => {
    const response = await apiRpc.whatsapp["user-messages"][":userId"][
      ":ownerId"
    ][":businessId"].$get({
      param: {
        userId: selectedUser?._id?.toString(),
        ownerId,
        businessId,
      },
    });
    const userMessages = await response.json();
    setUserChat(userMessages?.data);
    return userMessages;
  };

  return { fetchUserChats };
};

export const useSearchUserByPhone = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const searchUserByPhone = async (phone: string) => {
    const response = await apiRpc.subscribers["subscriber-phone"][
      ":businessId"
    ][":phone"].$get({
      param: {
        businessId: businessId,
        phone,
      },
    });
    const user = await response.json();
    return user;
  };

  return { searchUserByPhone };
};

export const useCheckRegistration = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const setCheckReg = useWhatsappTempStore((s) => s.setCheckReg);

  const { setWhatzappFormEnabled, setWhatzappStatus } = useWhatsappTempStore(
    (s) => ({
      setWhatzappFormEnabled: s.setWhatzappFormEnabled,
      setWhatzappStatus: s.setWhatzappStatus,
    }),
  );
  const checkRegistration = useCallback(async () => {
    const response = await apiRpc.whatsapp.fetch_waba[":businessId"].$get({
      param: {
        businessId: businessId,
      },
    });
    const res = await response.json();
    if (response.status === 200) {
      setWhatzappFormEnabled(true);
      setWhatzappStatus(res?.data?.status);
    } else {
      setWhatzappFormEnabled(false);
      setWhatzappStatus(res?.data?.status);
    }
    setCheckReg(true);
    return response.json();
  }, [businessId, setWhatzappFormEnabled, setWhatzappStatus, setCheckReg]);

  return { checkRegistration };
};

export const useCreateRegistration = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setPaymentSuccessFull } = useWhatsapp((s) => ({
    setPaymentSuccessFull: s.setPaymentSuccessFull,
  }));
  const {
    setStep,
    displayName,
    displayNumber,
    facebookId,
    facebookPassword,
    resetFormData,
  } = useWhatsappTempStore((s) => ({
    setStep: s.setStep,
    displayName: s.displayName,
    displayNumber: s.displayNumber,
    facebookId: s.facebookId,
    facebookPassword: s.facebookPassword,
    resetFormData: s.resetFormData,
  }));

  const wabaregistration = async () => {
    try {
      const response = await apiRpc.whatsapp.whatsapp_waba_registration.$post({
        json: {
          displayName: displayName,
          displayNumber: displayNumber,
          facebookId: facebookId,
          facebookPassword: facebookPassword,
          businessId,
        },
      });
      if (response.status === 200) {
        setStep(2);
        setPaymentSuccessFull(false);
        resetFormData();
      }
      if (response.status === 404) {
        toast.error("Registration failed contact support");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return { wabaregistration };
};
