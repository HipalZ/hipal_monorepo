import useBusinessData from "@/components/store/useBusinessData";
import { useMenuBanner } from "@/components/store/useMenuBanners";
import { apiRpc } from "@hi/common";
import type { MenuBannerType } from "@hi/db-models/src/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useGetAllTimings = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const businessId = businessData?._id;

  const getTimings = useCallback(async () => {
    if (!businessId) return;
    const response = await apiRpc["menu-banner"].all[":businessId"].$get({
      param: { businessId },
    });
    const timingData = await response.json();
    return timingData.data as MenuBannerType[];
  }, [businessId]);

  const {
    data: timings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["timings", businessId],
    queryFn: getTimings,
    enabled: !!businessId,
  });
  return { timings, isLoading, error };
};

export const useGetAllCategoryDataWithDishes = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const businessId = businessData?._id;

  const getAllCategoryData = useCallback(async () => {
    if (!businessId) return;
    const response = await apiRpc.categories.$get({
      query: {
        businessId,
        dishes: "true",
      },
    });
    const categoryData = await response.json();
    return categoryData.data;
  }, [businessId]);

  const {
    data: categoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categoryData", businessId],
    queryFn: getAllCategoryData,
    enabled: !!businessId,
  });
  return { categoryData, isLoading, error };
};

export const useSaveMenuBanner = () => {
  const timingId = useMenuBanner((s) => s.timingId);
  const reset = useMenuBanner((s) => s.reset);
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiRpc["menu-banner"][":bannerId"].$put({
        param: {
          bannerId: timingId,
        },
        json: payload,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.err) {
        toast.success("Menu banner saved successfully");
        queryClient.invalidateQueries({ queryKey: ["timings"] });
        reset();
      }
    },
    onError: (error) => {
      toast.error("Failed to save menu banner");
      console.error("Error in menu banner:", error);
    },
  });
  return { saveMenuBanner: mutateAsync, isPending };
};
