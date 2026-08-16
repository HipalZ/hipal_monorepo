import useBusinessData from '@/components/store/useBusinessData';
import { useError } from '@/components/store/useError';
import type { IOutletInfo } from '@/components/types/businessData';
import { apiRpc } from '@hi/common';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface BusinessSettingPayload {
  businessId: string;
  name: string;
  description?: string;
  address?: string;
  tags?: string[];
  avgPricingForTwo?: number;
  branchName?: string;
  brandName?: string;
  endBillTime?: number;
  endBannerUrl?: string;
  footerDescription?: string;
  fssai?: string;
  gst?: string;
  logoUrl?: string;
  orderEditWindowMinutes?: number;
  phone?: string;
  specialBannerUrl?: string;
  startBillTime?: number;
}

const getBusinessInfo = async (id: string) => {
  const res = await apiRpc.businesses.outletInfo[':businessId'].$get({
    param: {
      businessId: id,
    },
  });
  const response = await res.json();
  const outletInfo = response.data as IOutletInfo;
  if (res.status === 200 || res.status === 201) {
    useBusinessData.getState().setOutletInfo(outletInfo);
  }
};

const getBusinessSettingErrorMessage = (data: unknown) => {
  if (typeof data !== 'object' || data === null) return 'Something went wrong';

  const responseData = data as {
    message?: string;
    error?: {
      issues?: Array<{
        message?: string;
      }>;
    };
  };

  return responseData.error?.issues?.[0]?.message || responseData.message || 'Something went wrong';
};

export const useSaveBusinessSetting = () => {
  const { setError, setOpenErrorModal } = useError();
  const { isPending: saveBusinessSettingLoader, mutateAsync: saveBusinessSetting } = useMutation({
    mutationFn: async (payload: BusinessSettingPayload) => {
      const response = await apiRpc.businesses.outletInfo.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data, variables) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(getBusinessSettingErrorMessage(extraData));
        setOpenErrorModal(true);
        return toast.error('Failed to save business setting');
      }
      if (data.status === 200 || data.status === 201) {
        getBusinessInfo(variables.businessId);
        toast.success('Business setting saved successfully');
        return;
      }
    },
    onError: (error) => {
      setError(error.message);
      setOpenErrorModal(true);
    },
  });

  return { saveBusinessSettingLoader, saveBusinessSetting };
};

export const useUpdateBusinessSetting = () => {
  const { setError, setOpenErrorModal } = useError();
  const { isPending: updateBusinessSettingLoader, mutateAsync: updateBusinessSetting } = useMutation({
    mutationFn: async (payload: BusinessSettingPayload) => {
      const response = await apiRpc.businesses.outletInfo.update[':businessId'].$put({
        param: {
          businessId: payload.businessId,
        },
        json: payload,
      });
      return response;
    },
    onSuccess: async (data, variables) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(getBusinessSettingErrorMessage(extraData));
        setOpenErrorModal(true);
        return toast.error('Failed to update business setting');
      }
      if (data.status === 200 || data.status === 201) {
        getBusinessInfo(variables.businessId);
        toast.success('Business setting updated successfully');
        return;
      }
    },
    onError: (error) => {
      setError(error.message);
      setOpenErrorModal(true);
    },
  });

  return { updateBusinessSettingLoader, updateBusinessSetting };
};
