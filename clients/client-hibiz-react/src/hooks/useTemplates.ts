import axios from '@/axios';
import useBusinessData from '@/components/store/useBusinessData';
import { useMessageRecipientsStore } from '@/components/store/useMessageRecipientsStore';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import useWhatsapp, { Step, TemplateSteps, type WalletTransaction } from '@/components/store/useWhatsapp';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import type { LinkedTemplate } from '@/components/templates/whatsappTemplates/linkTemplatePopup';
import type { ICouponzLinks, ISendOptionsPayload, IUserMessage, WhatsAppTemplatePayload } from '@/components/types/businessData';
import { apiRpc } from '@hi/common';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

const extractTemplateError = (data: any, error?: any): string => {
  // Hono Zod issue list
  const issues = data?.error?.issues;
  if (Array.isArray(issues) && issues.length > 0) {
    const i = issues[0];
    const path = Array.isArray(i.path) && i.path.length > 0 ? `${i.path.join('.')}: ` : '';
    return `${path}${i.message || 'Invalid input'}`;
  }
  // Meta-specific
  if (data?.data?.error?.error_user_msg) return data.data.error.error_user_msg;
  if (data?.data?.error?.message) return data.data.error.message;
  // Our own backend
  if (data?.message && (data?.err === true || data?.data == null)) {
    return data.message;
  }
  // Caught error path (network / thrown)
  if (error?.response?.data?.error?.error_user_msg) return error.response.data.error.error_user_msg;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
};

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
      const url = outLetType === 'HOTEL' ? 'hotel/whats_app/templates' : 'whatsapp/template';

      const res = await apiRpc[url].$post({
        json: {
          ...payload,
          businessId: businessId,
        },
      });

      const data = await res.json();
      if (!data) throw new Error('Failed to create template');
      return data;
    },
    onMutate: () => {
      setIsLoading(true); // Set loading before mutation
    },
    onSuccess: (data) => {
      setIsLoading(false);
      if (data?.err || !data?.data || data?.success === false) {
        setShowSuccessPopup(false);
        useWhatsapp.getState().setTemplateError(extractTemplateError(data));
        return;
      }
      useWhatsapp.getState().setTemplateError(null);
      setTemplateId(data?.data?.id);
      setShowSuccessPopup(true);
      setTemplateStatus(data?.data?.status);
      setTemplateData(data?.data);
      setStep(Step.SETUP);
      setTemplateSteps(TemplateSteps.NONE);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: any) => {
      setIsLoading(false);
      useWhatsapp.getState().setTemplateError(extractTemplateError(null, error));
    },
  });

  return { createTemplate };
};

export const useEditTemplate = () => {
  const queryClient = useQueryClient();
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const { setStep, setShowSuccessPopup, setTemplateStatus, setTemplateSteps } = useWhatsapp((s) => ({
    setStep: s.setStep,
    setShowSuccessPopup: s.setShowSuccessPopup,
    setTemplateStatus: s.setTemplateStatus,
    setTemplateSteps: s.setTemplateSteps,
  }));
  const setIsLoading = useWhatsappTempStore((s) => s.setIsLoading);

  const { mutateAsync: editTemplate } = useMutation({
    mutationFn: async (payload: WhatsAppTemplatePayload) => {
      let res;
      if (outLetType === 'HOTEL') {
        res = await apiRpc.hotel.whats_app.templates[':templateid'][':businessId'].$put({
          json: payload,
          param: {
            templateid: payload.templateId,
            businessId: payload.businessId,
          },
        });
      } else {
        res = await apiRpc.whatsapp.template[':templateid'][':businessId'].$put({
          json: payload,
          param: {
            templateid: payload.templateId,
            businessId: payload.businessId,
          },
        });
      }

      const data = await res.json();
      if (!data) throw new Error('Failed to update template');
      return data;
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      setIsLoading(false);
      if (data?.err || !data?.data || data?.success === false) {
        setShowSuccessPopup(false);
        useWhatsapp.getState().setTemplateError(extractTemplateError(data));
        return;
      }
      useWhatsapp.getState().setTemplateError(null);
      setShowSuccessPopup(true);
      setTemplateStatus(data?.data?.status);
      setStep(Step.SETUP);
      setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: any) => {
      setIsLoading(false);
      useWhatsapp.getState().setTemplateError(extractTemplateError(null, error));
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
      toast.success('Template linked successfully');
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
    if (outLetType === 'HOTEL') {
      const res = await apiRpc.hotel.whats_app.templates.$get({
        query: { businessId },
      });
      const response = await res.json();
      setAllTemplates(response?.data);
      return response?.data || {};
    }
    const res = await apiRpc.whatsapp.template.all[':businessId'].$get({
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
    const res = await apiRpc.hotel.hotel_service_template_mapping[':businessId'].service_names.$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    return response?.data || [];
  };

  const { data: serviceNames = [] } = useQuery({
    queryKey: ['serviceNames', businessId],
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

  const uploadMedia = async (): Promise<{ handle: string }> => {
    const cached = useWhatsapp.getState().mediaHandle;
    if (cached) return { handle: cached };

    if (!imageFiles) {
      return { handle: '' };
    }
    if (!businessId) {
      throw new Error('Missing businessId');
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFiles);
      const res = await axios.post(`/whatsapp/media-upload/${businessId}`, formData, {
        maxBodyLength: Number.POSITIVE_INFINITY,
        maxContentLength: Number.POSITIVE_INFINITY,
      });
      if (res.data?.err || !res.data?.data?.handle) {
        throw new Error(res.data?.message || 'Media upload failed');
      }
      const handle = res.data.data.handle as string;
      useWhatsapp.getState().setMediaHandle(handle);
      if (res.data.data.url) {
        useWhatsapp.getState().setImagePreview(res.data.data.url);
      }
      return { handle };
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMediaPassFile = async (file: File | Blob): Promise<{ url: string }> => {
    if (!file) throw new Error('No file provided for upload');
    if (!businessId) throw new Error('Missing businessId');

    try {
      setIsUploading(true);
      const imageId = crypto.randomUUID();
      const storageFormData = new FormData();
      storageFormData.append('fileData', file);
      storageFormData.append('fileName', `${imageId}`);
      storageFormData.append('bucketName', 'assets');

      const storageResponse = await axios.post('https://storage.hipalz.com/upload', storageFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (storageResponse.status !== 200 && storageResponse.status !== 201) {
        throw new Error('Failed to upload to Hipalz storage');
      }

      const uploadedUrl = storageResponse.data.url;
      setImageUrl(uploadedUrl);
      setIsUploading(false);
      return {
        url: uploadedUrl,
      };
    } catch (error) {
      setIsUploading(false);
      console.error('Upload failed:', error);
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
  const clearMessageRecipientsStore = useMessageRecipientsStore((s) => s.clearMessageRecipientsStore);
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
        toast.error(response?.message || 'Failed to send message');
      } else {
        toast.success('Message sent successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['walletHistory'] });
      clearMessageRecipientsStore();
      setTemplateSteps(TemplateSteps.NONE);
      setStep(Step.SETUP);
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
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
    const res = await apiRpc.whatsapp.template.analytics[':businessId'].$get({
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
    const res = await apiRpc.whatsapp.whatsapp_wallet[':businessId'].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    setWalletBalance(response?.data?.currentBalance);
    return response;
  }, [businessId, setWalletBalance]);

  const getWalletHistory = useCallback(
    async (opts?: { from?: number; to?: number }) => {
      if (!businessId) return;
      const query: Record<string, string> = {};
      if (opts?.from != null) query.from = String(opts.from);
      if (opts?.to != null) query.to = String(opts.to);
      const res = await apiRpc.whatsapp.whatsapp_wallet.history[':businessId'].$get({
        param: {
          businessId,
        },
        query,
      });
      const response = (await res.json()) as unknown as {
        data: WalletTransaction[];
      };
      setWalletHistory(response?.data ?? []);
      return response;
    },
    [businessId, setWalletHistory],
  );

  return { getWalletBalance, getWalletHistory };
};

export const useCouponzLinks = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setCouponzLinks } = useWhatsapp((s) => ({
    setCouponzLinks: s.setCouponzLinks,
  }));

  const getCouponzLinks = useCallback(async () => {
    const res = await apiRpc.whatsapp.coupon_link[':businessId'].$get({
      param: {
        businessId,
      },
    });
    const response: { data: ICouponzLinks[]; err: boolean; message: string } = await res.json();
    setCouponzLinks(response?.data);
    return response;
  }, [businessId, setCouponzLinks]);

  return { getCouponzLinks };
};

export const useSendWhatsappMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: IUserMessage) => {
      const res = await apiRpc.whatsapp['send-messages'].$post({
        json: payload,
      });
      const response = await res.json();
      return response;
    },
    onSuccess: (response, variables) => {
      if (response.err) {
        toast.error(response?.message || 'Failed to send message');
      } else {
        toast.success('Message sent successfully');
      }
      queryClient.invalidateQueries({
        queryKey: ['fetchUserChatsInfinite', variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    },
  });
};

export const useDeleteChats = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, ownerId }: { userId: string; ownerId: string }) => {
      await apiRpc.whatsapp['user-messages'][':userId'][':ownerId'].$delete({
        param: {
          userId,
          ownerId,
        },
        json: {},
      });
    },
    onSuccess: () => {
      toast.success('Chats deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['fetchUserChats'] });
      // queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
    onError: () => {
      toast.error('Failed to delete chats');
    },
  });
};

export const useFetchAllUsers = () => {
  const { setUsers } = useWhatsappTempStore((s) => ({
    setUsers: s.setUsers,
  }));
  const businessId = useBusinessData((s) => s.businessData?._id);
  const fetchAllUserMessages = async () => {
    const response = await apiRpc.subscribers.all[':businessId'].$get({
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
    queryKey: ['fetchSubscribersInfinite', businessId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiRpc.subscribers.all[':businessId'].$get({
        param: { businessId },
        query: {
          page: pageParam.toString(),
          limit: '20',
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
    queryKey: ['fetchUserChatsInfinite', selectedUser?._id],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiRpc.whatsapp['user-messages'][':userId'][':ownerId'][':businessId'].$get({
        param: {
          userId: selectedUser?._id?.toString(),
          ownerId,
          businessId,
        },
        query: {
          page: pageParam.toString(),
          limit: '20',
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
    const response = await apiRpc.subscribers['subscriber-phone'][':businessId'][':phone'].$get({
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
  const setCheckReg = useWhatsappTempStore((s) => s.setCheckReg);
  const setWhatsAppEnabled = useWhatsappTempStore((s) => s.setWhatsAppEnabled);

  const { setWhatzappStatus } = useWhatsappTempStore((s) => ({
    setWhatzappStatus: s.setWhatzappStatus,
  }));
  const checkRegistration = useCallback(async () => {
    const response = await apiRpc.whatsapp.fetch_waba[':businessId'].$get({
      param: {
        businessId: businessId,
      },
    });
    const res = await response.json();
    const enabled = res?.data?.whatsAppEnabled ?? res?.data?.whatsapp_enabled ?? res?.data?.whatsappEnabled ?? false;
    setWhatsAppEnabled(enabled === true);

    if (enabled !== true) {
      setWhatzappFormEnabled(false);
      setWhatzappStatus(false);
      setCheckReg(true);
      return res;
    }

    if (response.status === 200) {
      setWhatzappFormEnabled(true);
      setWhatzappStatus(res?.data?.status);
    } else {
      setWhatzappFormEnabled(false);
      setWhatzappStatus(res?.data?.status);
    }
    setCheckReg(true);
    return res;
  }, [businessId, setWhatzappFormEnabled, setWhatzappStatus, setWhatsAppEnabled, setCheckReg]);
  const { isLoading } = useQuery({
    queryKey: ['fetchWaba', businessId],
    queryFn: checkRegistration,
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
  return { isLoading };
};

export const useCreateRegistration = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setPaymentSuccessFull } = useWhatsapp((s) => ({
    setPaymentSuccessFull: s.setPaymentSuccessFull,
  }));
  const { setStep, displayName, displayNumber, facebookId, facebookPassword, resetFormData } = useWhatsappTempStore((s) => ({
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
        toast.error('Registration failed contact support');
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
  const setAllCampaignsList = useWhatsappTempStore((s) => s.setAllCampaignsList);
  const allCampaignsWithTemplates = async () => {
    try {
      const response = await apiRpc.whatsapp.campaigns[':businessId'][':templateId'].$get({
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
  const fetchCampaignAnalytics = async (campaignId: string, pageNumber: number, status: string) => {
    try {
      const response = await apiRpc.whatsapp.campaign_analytics[':businessId'][':campaignId'].$get({
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
        throw new Error(res.message || 'Failed to create group.');
      }
      return res;
    },
    onSuccess: () => {
      toast.success('Group successfully created!');
      setSelectedPhones([]);
    },
    onError: (error: any) => {
      console.error('Error creating group:', error);
      toast.error('Error creating group. Please try again.');
    },
  });

  return { addGroupMutation };
};

export const useTempAnalyticsById = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setLoadingTemplateId, setSelectedTemplate, setOpenAccordionId } = useWhatsappTempStore((s) => ({
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
          toast.error('Failed to fetch analytics data');
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('An error occurred while fetching analytics data');
      } finally {
        setLoadingTemplateId(null);
      }
    },
    [businessId, setSingleTemplateAnalytics, setLoadingTemplateId, setSelectedTemplate, setOpenAccordionId],
  );

  return { getTemplateAnaylyticsById };
};
