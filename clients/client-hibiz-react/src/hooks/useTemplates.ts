import axios from "@/axios";
import useBusinessData from "@/components/store/useBusinessData";
import { useMessageRecipientsStore } from "@/components/store/useMessageRecipientsStore";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import useWhatsapp, {
  Step,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import type { LinkedTemplate } from "@/components/templates/whatsappTemplates/linkTemplatePopup";
import type {
  ICouponzLinks,
  ISendOptionsPayload,
  IUserMessage,
  IWalletHistory,
  WhatsAppTemplatePayload,
} from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const businessId = useBusinessData((s) => s.businessData?._id);
  const setIsLoading = useWhatsappTempStore((s) => s.setIsLoading);
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const setStep = useWhatsapp((s) => s.setStep);
  const setShowSuccessPopup = useWhatsapp((s) => s.setShowSuccessPopup);
  const setTemplateStatus = useWhatsapp((s) => s.setTemplateStatus);
  const setTemplateData = useWhatsapp((s) => s.setTemplateData);
  const setTemplateId = useWhatsapp((s) => s.setTemplateId);
  const setTemplateSteps = useWhatsapp((s) => s.setTemplateSteps);

  const { mutateAsync: createTemplate } = useMutation({
    mutationFn: async (payload: WhatsAppTemplatePayload) => {
      if (!businessId) return null;
      const url =
        outLetType === "HOTEL"
          ? "hotel/whats_app/templates"
          : "whatsapp/template";

      const res = await apiRpc[url].$post({
        json: {
          ...payload,
          businessId: businessId,
        },
      });

      const data = await res.json();
      if (!data) throw new Error("Failed to create template");
      return data;
    },
    onMutate: () => {
      setIsLoading(true); // Set loading before mutation
    },
    onSuccess: (data) => {
      setIsLoading(false);
      if (data?.err || !data?.data) {
        setStep(Step.SETUP);
        setTemplateSteps(TemplateSteps.NONE);
        setShowSuccessPopup(false);
        toast.error(
          data?.data?.error?.error_user_msg || "Failed to create template",
        );
        return;
      }
      setTemplateId(data?.data?.id);
      setShowSuccessPopup(true);
      setTemplateStatus(data?.data?.status);
      setTemplateData(data?.data);
      setStep(Step.SETUP);
      setTemplateSteps(TemplateSteps.NONE);
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(
        error.message || "An error occurred while creating the template.",
      );
    },
  });

  return { createTemplate };
};

export const useEditTemplate = () => {
  const queryClient = useQueryClient();
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const { setStep, setShowSuccessPopup, setTemplateStatus, setTemplateSteps } =
    useWhatsapp((s) => ({
      setStep: s.setStep,
      setShowSuccessPopup: s.setShowSuccessPopup,
      setTemplateStatus: s.setTemplateStatus,
      setTemplateSteps: s.setTemplateSteps,
    }));
  const setIsLoading = useWhatsappTempStore((s) => s.setIsLoading);

  const { mutateAsync: editTemplate } = useMutation({
    mutationFn: async (payload: WhatsAppTemplatePayload) => {
      let res;
      if (outLetType === "HOTEL") {
        res = await apiRpc.hotel.whats_app.templates[":templateid"][
          ":businessId"
        ].$put({
          json: payload,
          param: {
            templateid: payload.templateId,
            businessId: payload.businessId,
          },
        });
      } else {
        res = await apiRpc.whatsapp.template[":templateid"][":businessId"].$put(
          {
            json: payload,
            param: {
              templateid: payload.templateId,
              businessId: payload.businessId,
            },
          },
        );
      }

      const data = await res.json();
      if (!data) throw new Error("Failed to update template");
      return data;
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      setIsLoading(false);
      if (data?.err || !data?.data) {
        setStep(Step.SETUP);
        setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
        setShowSuccessPopup(false);
        toast.error(
          data?.data?.error?.error_user_msg || "Failed to update template",
        );
        return;
      }

      setShowSuccessPopup(true);
      setTemplateStatus(data?.data?.status);
      setStep(Step.SETUP);
      setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(
        error.message || "An error occurred while updating the template.",
      );
    },
  });

  return { editTemplate };
};

export const useLinkTemplate = () => {
  const setIsLoading = useWhatsappTempStore((s) => s.setIsLoading);
  const { mutateAsync: linkTemplate } = useMutation({
    mutationFn: async (payload: LinkedTemplate[]) => {
      const res = await apiRpc.hotel.hotel_service_template_mapping.$post({
        json: {
          data: payload,
        },
      });
      const response = await res.json();
      return response;
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Template linked successfully");
    },
  });

  return { linkTemplate };
};

export const useFetchTemplates = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const { setAllTemplates } = useWhatsappTempStore((s) => ({
    setAllTemplates: s.setAllTemplates,
  }));

  const getTemplates = async () => {
    if (outLetType === "HOTEL") {
      const res = await apiRpc.hotel.whats_app.templates.$get({
        query: { businessId },
      });
      const response = await res.json();
      setAllTemplates(response?.data);
      return response?.data || {};
    }
    const res = await apiRpc.whatsapp.template.all[":businessId"].$get({
      param: { businessId },
    });
    const response = await res.json();
    setAllTemplates(response?.data);
    return response?.data || {};
  };

  return { getTemplates };
};

export const useServiceNames = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);

  const getServiceNames = async () => {
    const res = await apiRpc.hotel.hotel_service_template_mapping[
      ":businessId"
    ].service_names.$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    return response?.data || [];
  };

  const {
    data: serviceNames = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["serviceNames", businessId],
    queryFn: getServiceNames,
    enabled: !!businessId,
  });

  return { serviceNames };
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
        "https://graph.facebook.com/v21.0/1166415764661953/uploads",
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
        handle: uploadResponse.data.h as string,
      };
    } catch (error) {
      setIsUploading(false);
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const uploadMediaPassFile = async (
    file: File | Blob,
  ): Promise<{ url: string; handle: string }> => {
    if (!file) throw new Error("No file provided for upload");
    if (!businessId) throw new Error("Missing businessId");

    try {
      setIsUploading(true);
      const imageId = crypto.randomUUID();
      const storageFormData = new FormData();
      storageFormData.append("fileData", file);
      storageFormData.append("fileName", `${imageId}`);
      storageFormData.append("bucketName", "assets");

      const storageResponse = await axios.post(
        "https://storage.test.hipalz.com/upload",
        storageFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (storageResponse.status !== 200 && storageResponse.status !== 201) {
        throw new Error("Failed to upload to Hipalz storage");
      }

      const uploadedUrl = storageResponse.data.url;
      setImageUrl(uploadedUrl);
      setIsUploading(false);
      return {
        url: uploadedUrl,
      };
    } catch (error) {
      setIsUploading(false);
      console.error("Upload failed:", error);
      throw error;
    }
  };

  return {
    uploadMedia,
    uploadMediaPassFile,
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
    onSuccess: (response, variables) => {
      if (response.err) {
        toast.error(response?.message || "Failed to send message");
      } else {
        toast.success("Message sent successfully");
      }
      queryClient.invalidateQueries({
        queryKey: ["fetchUserChatsInfinite", variables.userId]
      });
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
        json: {},
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

export const useFetchSubscribersInfinite = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  return useInfiniteQuery({
    queryKey: ["fetchSubscribersInfinite", businessId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiRpc.subscribers.all[":businessId"].$get({
        param: { businessId },
        query: {
          page: pageParam.toString(),
          limit: "20",
        },
      });
      const data = await response.json();
      return data;
    },
    getNextPageParam: (lastPage: any) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!businessId,
  });
};

export const useFetchUserChatsInfinite = () => {
  const { selectedUser } = useWhatsappTempStore((s) => ({
    selectedUser: s.selectedUser,
  }));
  const businessId = useBusinessData((s) => s.businessData?._id);
  const ownerId = useOwnerLogin((s) => s.user?._id);

  return useInfiniteQuery({
    queryKey: ["fetchUserChatsInfinite", selectedUser?._id],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiRpc.whatsapp["user-messages"][":userId"][
        ":ownerId"
      ][":businessId"].$get({
        param: {
          userId: selectedUser?._id?.toString(),
          ownerId,
          businessId,
        },
        query: {
          page: pageParam.toString(),
          limit: "20",
        },
      });
      const data = await response.json();
      return data;
    },
    getNextPageParam: (lastPage: any) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!selectedUser?._id,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
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
  const setWhatzappFormEnabled = useWhatsapp((s) => s.setWhatzappFormEnabled);
  const checkReg = useWhatsappTempStore((s) => s.checkReg);
  const setCheckReg = useWhatsappTempStore((s) => s.setCheckReg);

  const { setWhatzappStatus } = useWhatsappTempStore((s) => ({
    setWhatzappStatus: s.setWhatzappStatus,
  }));
  const checkRegistration = useCallback(async () => {
    if (checkReg) return {};
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
  }, [
    businessId,
    setWhatzappFormEnabled,
    setWhatzappStatus,
    setCheckReg,
    checkReg,
  ]);
  const { isLoading } = useQuery({
    queryKey: ["fetchWaba", businessId],
    queryFn: checkRegistration,
    enabled: !!businessId && !checkReg,
  });
  return { isLoading };
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

export const useAllCampaignsWithTemplates = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const selectedTemplate = useWhatsappTempStore((s) => s.selectedTemplate);
  const setAllCampaignsList = useWhatsappTempStore(
    (s) => s.setAllCampaignsList,
  );
  const allCampaignsWithTemplates = async () => {
    try {
      const response = await apiRpc.whatsapp.campaigns[":businessId"][
        ":templateId"
      ].$get({
        param: {
          businessId,
          templateId: selectedTemplate?.templateId || selectedTemplate?.id,
        },
      });

      const res = await response.json();
      setAllCampaignsList(res?.data);
      return res;
    } catch (e) {
      console.log(e);
    }
  };

  return { allCampaignsWithTemplates };
};

export const useCampaignAnalytics = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const setCampaignsData = useWhatsappTempStore((s) => s.setCampaignsData);
  const fetchCampaignAnalytics = async (
    campaignId: string,
    pageNumber: number,
    status: string,
  ) => {
    try {
      const response = await apiRpc.whatsapp.campaign_analytics[":businessId"][
        ":campaignId"
      ].$get({
        param: {
          businessId,
          campaignId: campaignId,
        },
        query: {
          pageNumber: pageNumber?.toString(),
          status: status,
        },
      });
      const res = await response.json();
      setCampaignsData(res?.data);
      return res?.data;
    } catch (e) {
      console.log(e);
    }
  };

  return { fetchCampaignAnalytics };
};

export const useAddGroup = () => {
  const setSelectedPhones = useWhatsappTempStore((s) => s.setSelectedPhones);
  const addGroupMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiRpc.groups.add_wa_users.$post({
        json: payload,
      });
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Failed to create group.");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Group successfully created!");
      setSelectedPhones([]);
    },
    onError: (error: any) => {
      console.error("Error creating group:", error);
      toast.error("Error creating group. Please try again.");
    },
  });

  return { addGroupMutation };
};

export const useTempAnalyticsById = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setLoadingTemplateId, setSelectedTemplate, setOpenAccordionId } =
    useWhatsappTempStore((s) => ({
      setLoadingTemplateId: s.setLoadingTemplateId,
      setSelectedTemplate: s.setSelectedTemplate,
      setOpenAccordionId: s.setOpenAccordionId,
    }));
  const { setSingleTemplateAnalytics } = useWhatsapp((s) => ({
    setSingleTemplateAnalytics: s.setSingleTemplateAnalytics,
  }));
  const getTemplateAnaylyticsById = useCallback(
    async (templateId: string) => {
      setLoadingTemplateId(templateId);
      try {
        const res = await apiRpc.whatsapp.analytics.by_template_id.$get({
          query: {
            templateId,
            businessId,
          },
        });

        const response = await res.json();
        if (res.status === 200 || res.status === 201) {
          setSingleTemplateAnalytics(response?.data);
          setSelectedTemplate(response?.data);
          setOpenAccordionId(templateId);
        } else {
          toast.error("Failed to fetch analytics data");
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("An error occurred while fetching analytics data");
      } finally {
        setLoadingTemplateId(null);
      }
    },
    [
      businessId,
      setSingleTemplateAnalytics,
      setLoadingTemplateId,
      setSelectedTemplate,
      setOpenAccordionId,
    ],
  );

  return { getTemplateAnaylyticsById };
};
