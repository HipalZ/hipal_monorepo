import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useError } from "@/components/store/useError";
import toast from "react-hot-toast";

// Types for period configuration
export type CouponAllocation = {
  couponId: string;
  remaining: number;
  _id?: string;
};

export type PeriodConfig = {
  _id: string;
  businessDayConfigId: string;
  period: number;
  baseCharge: number;
  redeemableCoverCharge: number;
  isOpen: boolean;
  couponAllocations: CouponAllocation[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  archived_at: null | string;
};

export type PeriodConfigsResponse = {
  dayWise: Record<string, Record<string, PeriodConfig>>;
  periodWise: Record<string, Record<string, PeriodConfig>>;
};

export interface IndividualDayPeriodConfigs {
  _id: string;
  businessDayConfigId: string;
  period: number;
  baseCharge: number;
  redeemableCoverCharge: number;
  isOpen: boolean;
  couponAllocations: CouponAllocation[];
  createdAt: string;
  updatedAt: string;
  archived_at: null | string;
}

export type PeriodConfigsData = {
  status: number;
  data: PeriodConfigsResponse;
  message: string;
};

export type PeriodConfigData = {
  status: number;
  data: PeriodConfig;
  message: string;
};

// Payload types
export type UpdatePeriodPayload = {
  baseCharge?: number;
  redeemableCoverCharge?: number;
  isOpen?: boolean;
  couponAllocations?: CouponAllocation[];
};

/**
 * Hook for fetching all period configurations
 */
export const useGetBusinessPeriodConfigs = (businessId: string) => {
  const queryKey = ["businessPeriodConfigs", businessId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await apiRpc.bookings["business-period-config"].periods[
        ":businessId"
      ].$get({
        param: { businessId },
        json: {},
      });
      return result.json() as PeriodConfigsData;
    },
    enabled: !!businessId,
  });
};

export const useGetIndividualDayPeriodConfigs = (
  businessId: string,
  dayOfWeek: number,
) => {
  const day = dayOfWeek.toString();
  const queryKey = ["IndividualDayPeriodConfigs", businessId, day];
  const {
    isLoading,
    data: IndividualDayData,
    refetch: callIndividual,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await apiRpc.bookings["business-period-config"].periods[
        ":businessId"
      ][":dayOfWeek"].$get({
        param: { businessId, dayOfWeek: day },
        json: {},
      });
      const data = await result.json();
      return data.data as IndividualDayPeriodConfigs[];
    },
    enabled: !!businessId && !!day,
  });
  return { isLoading, IndividualDayData, callIndividual };
};

/**
 * Hook for updating a period configuration
 */
export const useUpdatePeriodConfig = () => {
  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError();

  const { isPending: isUpdating, mutateAsync } = useMutation({
    mutationFn: async ({
      businessId,
      dayOfWeek,
      period,
      payload,
    }: {
      businessId: string;
      dayOfWeek: number;
      period: number;
      payload: UpdatePeriodPayload;
    }) => {
      // Ensure payload.couponAllocations is properly formatted
      if (payload.couponAllocations) {
        // Remove any _id fields from couponAllocations as they might cause issues with the API
        payload.couponAllocations = payload.couponAllocations.map(
          (allocation) => ({
            couponId: allocation.couponId,
            remaining: allocation.remaining,
          }),
        );
      }

      const response = await apiRpc.bookings["business-period-config"].period[
        ":businessId"
      ][":dayOfWeek"][":period"].$patch({
        param: {
          businessId,
          dayOfWeek: dayOfWeek.toString(),
          period: period.toString(),
        },
        json: payload,
      });
      return response.json() as PeriodConfigData;
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Period update failed");
        return toast.error("Period update failed");
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Period configuration conflict");
        return toast.error("Period configuration conflict");
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["IndividualDayPeriodConfigs", variables.businessId,variables.dayOfWeek],
        });
        return toast.success("Period configuration updated successfully");
      }
    },
    onError: (error) => {
      console.error("Failed to update period configuration:", error);
      toast.error("Failed to update period configuration");
    },
  });

  return { isUpdating, updatePeriod: mutateAsync };
};

/**
 * Hook for toggling a period's open/closed status
 */
export const useTogglePeriod = () => {
  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError();

  const { isPending: isToggling, mutateAsync } = useMutation({
    mutationFn: async ({
      businessId,
      dayOfWeek,
      period,
    }: {
      businessId: string;
      dayOfWeek: number;
      period: number;
    }) => {
      const response = await apiRpc.bookings["business-period-config"][
        "toggle-period"
      ][":businessId"][":dayOfWeek"][":period"].$patch({
        param: {
          businessId,
          dayOfWeek: dayOfWeek.toString(),
          period: period.toString(),
        },
        json: {},
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Period toggle failed");
        return toast.error("Period toggle failed");
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["businessPeriodConfigs", variables.businessId],
        });
        return;
      }
    },
    onError: (error) => {
      console.error("Failed to toggle period:", error);
      toast.error("Failed to toggle period");
    },
  });

  return { isToggling, togglePeriod: mutateAsync };
};

/**
 * Hook for toggling all periods for a day
 */
export const useToggleAllPeriodsForDay = () => {
  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError();

  const { isPending: isToggling, mutateAsync } = useMutation({
    mutationFn: async ({
      businessId,
      dayOfWeek,
    }: {
      businessId: string;
      dayOfWeek: number;
    }) => {
      const response = await apiRpc.bookings["business-period-config"][
        "toggle-all-periods"
      ][":businessId"][":dayOfWeek"].$patch({
        param: {
          businessId,
          dayOfWeek: dayOfWeek.toString(),
        },
        json: {},
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Failed to toggle all periods");
        return toast.error("Failed to toggle all periods");
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["businessPeriodConfigs", variables.businessId],
        });
        return toast.success("All periods toggled successfully");
      }
    },
    onError: (error) => {
      console.error("Failed to toggle all periods:", error);
      toast.error("Failed to toggle all periods");
    },
  });

  return { isToggling, toggleAllPeriodsForDay: mutateAsync };
};

/**
 * Hook for bulk updating periods
 */
export const useBulkUpdatePeriods = () => {
  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError();

  const { isPending: isUpdating, mutateAsync } = useMutation({
    mutationFn: async ({
      businessId,
      payload,
    }: {
      businessId: string;
      payload: {
        dayOfWeek: number;
        period: number;
        updates: UpdatePeriodPayload;
      }[];
    }) => {
      const response = await apiRpc.bookings["business-period-config"].bulk[
        ":businessId"
      ].$patch({
        param: {
          businessId,
        },
        json: payload,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Bulk update failed");
        return toast.error("Bulk update failed");
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["businessPeriodConfigs", variables.businessId],
        });
        return toast.success("Periods updated successfully");
      }
    },
    onError: (error) => {
      console.error("Failed to bulk update periods:", error);
      toast.error("Failed to bulk update periods");
    },
  });

  return { isUpdating, bulkUpdatePeriods: mutateAsync };
};
