import useBusinessData from "@/components/store/useBusinessData";
import useCouponsStore from "@/components/store/useCouponsStore";
import type { ICoupon } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

export interface selectedUsersDetails {
  _id: string;
  name: string;
  phone: string;
}

export const useGetAllCoupons = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const businessId = businessData?._id;

  const getAllCoupon = useCallback(async () => {
    if (!businessId) return [];

    const res = await apiRpc.couponz.all[":businessId"].$get({
      param: {
        businessId,
      },
    });

    const data = (await res.json()).data as ICoupon[];
    return data;
  }, [businessId]);

  const {
    data: coupons,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getAllCoupon", businessId],
    queryFn: getAllCoupon,
    enabled: !!businessId,
  });

  return {
    coupons,
    isLoading,
    error,
  };
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  const { resetStore, setSelectedPage } = useCouponsStore((state) => ({
    resetStore: state.resetCouponState,
    setSelectedPage: state.setSelectedPage,
  }));

  const handleApiResponse = useCallback(
    (res) => {
      if (res.err) {
        toast.error(res.message);
        return;
      }
      if (!res.err) {
        toast.success(res.message);
        setSelectedPage("MANAGE");
        queryClient.invalidateQueries({ queryKey: ["getAllCoupon"] });
        resetStore();
      }
    },
    [queryClient, resetStore],
  );

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (couponId: string) => {
      const res = await apiRpc.couponz[":couponId"].$delete({
        param: {
          couponId,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
    onError: (error) => {
      toast.error(`Error deleting coupon: ${error.message}`);
    },
  });

  return { mutate: mutateAsync, isPending };
};

export const useSaveCoupon = () => {
  const resetFunction = useCouponsStore((s) => s.resetCouponState);
  const setSelectedPage = useCouponsStore((s) => s.setSelectedPage);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiRpc.couponz.$post({
        json: payload,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.err) {
        toast.success("Coupon saved successfully!");
        setSelectedPage("MANAGE");
        resetFunction();
      }
    },
    onError: (error) => {
      toast.error("Failed to save coupon!");
      console.error("Error in saving coupon:", error);
    },
  });

  return { saveCoupon: mutateAsync, isPending };
};

export const useEditCoupon = () => {
  const resetFunction = useCouponsStore((s) => s.resetCouponState); // Reset the coupon state after success
  const setSelectedPage = useCouponsStore((s) => s.setSelectedPage); // Redirect to another page after success

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({
      payload,
      couponId,
    }: { payload: any; couponId: string }) => {
      const response = await apiRpc.couponz[":couponId"].$put({
        param: {
          couponId,
        },
        json: payload,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.err) {
        toast.success("Coupon updated successfully!");
        setSelectedPage("MANAGE");
        resetFunction();
      } else {
        toast.error(data.message || "Failed to update coupon!");
      }
    },
    onError: (error) => {
      toast.error("Failed to update coupon!");
      console.error("Error in updating coupon:", error);
    },
  });

  return { editCoupon: mutateAsync, isPending };
};

export const useSingleUserInfo = (userPhone: string) => {
  const { businessData } = useBusinessData();
  const businessId = businessData?._id;

  const getUserInfo = useCallback(async () => {
    if (!userPhone || !businessId) return;

    const res = await apiRpc.subscribers["subscriber-phone"][":businessId"][
      ":phone"
    ].$get({
      param: {
        businessId,
        phone: userPhone,
      },
    });
    return (await res.json()).data?.userId as selectedUsersDetails;
  }, [userPhone, businessId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getUserInfo", userPhone, businessId],
    queryFn: getUserInfo,
    enabled: !!userPhone && !!businessId,
  });

  return { userInfo: data, isLoading, error };
};

export const getAnalyticsDashBoard = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const businessId = businessData?._id;

  const getAnalytics = useCallback(async () => {
    if (!businessId) return [];

    const res = await apiRpc["coupon-analytics"][":businessId"].$get({
      param: {
        businessId,
      },
    });

    const data = (await res.json()).data;
    return data;
  }, [businessId]);

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getAnalytics", businessId],
    queryFn: getAnalytics,
    enabled: !!businessId,
  });

  return {
    analytics,
    isLoading,
    error,
  };
};

export interface IAnalytics {
  newUsers: number;
  repeatUsers: number;
  successPercentage: number;
  totalClaimed: number;
  totalDiscount: number;
  totalGrabbed: number;
  totalReach: number;
  totalSales: number;
}

export const useIndividualCouponAnalytics = (to: number) => {
  const couponId = useCouponsStore((state) => state.couponId);
  const { couponStartDate } = useCouponsStore();

  console.log("couponStartDate", couponStartDate, to);

  const getIndividualAnalytics = useCallback(async () => {
    const res = await apiRpc["coupon-analytics"].couponDashboard[
      ":couponId"
    ].$get({
      param: {
        couponId,
      },
      query: {
        from: couponStartDate?.toString(),
        to: to.toString(),
      },
    });
    const data = (await res.json()).data as IAnalytics;
    return data;
  }, [couponStartDate, to, couponId]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["getIndividualAnalytics", couponId, couponStartDate, to],
    queryFn: getIndividualAnalytics,
    enabled: !!couponId && !!couponStartDate && !!to,
  });

  return {
    analytics,
    isLoading,
  };
};

export interface IChannel {
  channelId: string;
  name: string;
  isActive: boolean;
  totalReach: number;
  totalGrabbed: number;
  totalSales: number;
}

export const useGetCouponsChannel = () => {
  const couponId = useCouponsStore((state) => state.couponId);
  const businessData = useBusinessData((state) => state.businessData);
  const businessId = businessData?._id;

  const getCouponsChannel = useCallback(async () => {
    if (!couponId || !businessId) return [];

    const res = await apiRpc["coupon-analytics"]["channels-analytics"][
      ":businessId"
    ][":couponId"].$get({
      param: {
        businessId,
        couponId,
      },
    });

    const data = (await res.json()).data as IChannel[];
    return data;
  }, [businessId, couponId]);

  const { data: singleCouponChannel, isLoading } = useQuery({
    queryKey: ["getCouponsChannel", businessId, couponId],
    queryFn: getCouponsChannel,
    enabled: !!couponId && !!businessId,
  });

  return {
    singleCouponChannel,
    isLoading,
  };
};

export interface IChannelDetails {
  _id: string;
  businessId: string;
  isActive: boolean;
  channelId: string;
  date: string;
  link: string;
}

export const useGetChannel = (channelId: string, callTheApi: boolean) => {
  const couponId = useCouponsStore((state) => state.couponId);

  const getChannel = useCallback(async () => {
    if (!channelId) return toast.error("Channel is required");

    const res = await apiRpc["coupon-analytics"]["view-coupon"][":couponId"][
      ":channelId"
    ].$get({
      param: {
        couponId,
        channelId,
      },
    });

    const data = (await res.json()).data as IChannelDetails;
    return data;
  }, [channelId, couponId]);

  const { data: channel, isLoading } = useQuery({
    queryKey: ["getChannel", channelId, couponId],
    queryFn: getChannel,
    enabled: !!channelId && !!couponId && callTheApi,
  });

  return {
    channel,
    isLoading,
  };
};

export const useDisableLink = () => {
  const couponId = useCouponsStore((state) => state.couponId);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      channelId,
      isDisable,
    }: { channelId: string; isDisable: boolean }) => {
      const res = await apiRpc["coupon-analytics"].channels[":couponId"][
        ":channelId"
      ].$put({
        param: {
          couponId,
          channelId,
        },
        json: {
          isActive: isDisable.toString(),
        },
      });

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCouponsChannel"] });
      toast.success("Channel disabled successfully");
    },
    onError: (error) => {
      toast.error("Failed to disable channel");
      console.error("Error in disabling channel:", error);
    },
  });

  return { disableChannel: mutate, isPending };
};
