import { useBusinessDayConfigUIStore } from "@/components/store/booking/businessDayConfigStore";
import useBusinessData from "@/components/store/useBusinessData";
import type { BusinessDayConfig, UpdateBusinessDayConfigPayload } from "@/components/types/business-day-config";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * Hook to fetch all business day configurations for a business
 */
export const useGetBusinessDayConfigs = (businessId: string) => {
  if (!businessId) return { data: [], isLoading: false };

  const { setBusinessDayConfigs } = useBusinessDayConfigUIStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["businessDayConfigs", businessId],
    queryFn: async () => {
      const response = await apiRpc.bookings["business-day-config"].days[':businessId'].$get({
        param: {
          businessId
        }
      });
      const result = await response.json();

      if (result.status === 200) {
        setBusinessDayConfigs(result.data);
        return result.data as BusinessDayConfig[];
      }

      return [];
    },
    enabled: !!businessId
  });

  return {
    data: data || [],
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook to toggle all days open/closed
 */
export const useToggleAllDays = () => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (businessId: string) => {
      const response = await apiRpc.bookings["business-day-config"]["toggle-all-days"][':businessId'].$patch({
        param: {
          businessId
        }
      });
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success("All days toggled successfully");
        queryClient.invalidateQueries({ queryKey: ["businessDayConfigs", variables] });
      } else {
        toast.error("Failed to toggle all days");
      }
    },
    onError: () => {
      toast.error("Failed to toggle all days");
    }
  });

  return {
    isToggling: isPending,
    toggleAllDays: mutateAsync
  };
};

/**
 * Hook to toggle a specific day open/closed
 */
export const useToggleDay = () => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async ({ businessId, dayOfWeek }: { businessId: string; dayOfWeek: number }) => {
      const response = await apiRpc.bookings["business-day-config"]["toggle-day"][':businessId'][':dayOfWeek'].$patch({
        param: {
          businessId,
          dayOfWeek: dayOfWeek.toString()
        }
      });
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success("Day toggled successfully");
        queryClient.invalidateQueries({ queryKey: ["businessDayConfigs", variables.businessId] });
      } else {
        toast.error("Failed to toggle day");
      }
    },
    onError: () => {
      toast.error("Failed to toggle day");
    }
  });

  return {
    isToggling: isPending,
    toggleDay: mutateAsync
  };
};

/**
 * Hook to update a business day configuration
 */
export const useUpdateBusinessDayConfig = () => {
  const queryClient = useQueryClient();
  const { resetEditState } = useBusinessDayConfigUIStore();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async ({
      businessId,
      payload
    }: {
      businessId: string;
      payload: UpdateBusinessDayConfigPayload
    }) => {
      const response = await apiRpc.bookings["business-day-config"][':businessId'].$patch({
        param: {
          businessId
        },
        json: payload
      });
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success("Business day configuration updated successfully");
        queryClient.invalidateQueries({ queryKey: ["businessDayConfigs", variables.businessId] });
        resetEditState();
      } else {
        toast.error("Failed to update business day configuration");
      }
    },
    onError: () => {
      toast.error("Failed to update business day configuration");
    }
  });

  return {
    isUpdating: isPending,
    updateBusinessDayConfig: mutateAsync
  };
};

export const useUpdateCapacity = () => {
  const {businessData,setBusinessData} = useBusinessData((s) => ({
    businessData: s.businessData,
    setBusinessData: s.setBusinessData,
  }))

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async ({ businessId, capacity }: { businessId: string; capacity: number }) => {
      const response = await apiRpc.bookings["booking-business"][":businessId"].capacity.$patch({
        param: {
          businessId,
        },
        json: {
          capacity: capacity,
        },
      })
      return response.json()
    },
    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Business capacity updated successfully")
        setBusinessData({
          ...businessData,
          capacity: data.data.capacity,
        })
      } else {
        toast.error("Failed to update business capacity")
      }
    },
    onError: () => {
      toast.error("Failed to update business capacity")
    },
  })

  return {
    isUpdating: isPending,
    updateCapacity: mutateAsync,
  }
}