import useBusinessData from "@/components/store/useBusinessData";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { apiRpc } from "@hi/common";
import type { AddOnType } from "@hi/db-models/src/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useAddOnList = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const { setAddOnTypes } = useCategoryStore((state) => ({
    setAddOnTypes: state.setAddOnTypes,
  }));

  const getAllAddOn = useCallback(async () => {
    if (!businessData?._id) return [];
    const res = await apiRpc.addons.$get({
      query: {
        businessId: businessData._id,
      },
    });
    const data = (await res.json()).data as AddOnType[];
    setAddOnTypes(data);
    return data;
  }, [businessData?._id]);

  const { data: addOns, isLoading } = useQuery({
    queryKey: ["getAllAddOn", businessData?._id],
    queryFn: getAllAddOn,
    enabled: !!businessData?._id,
  });

  return { addOns, isLoading };
};

export const useSaveAddOn = () => {
  const queryClient = useQueryClient();

  const { setOpenMenu, resetStore,setIsLoading } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    resetStore: s.resetStore,
    setIsLoading: s.setIsLoading,
  }));

  const handleApiResponse = useCallback((res) => {
    if (res.err) {
      toast.error(res.message);
      return;
    }
    if (!res.err) {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["getAllAddOn"] });
      resetStore();
      setOpenMenu(false);
    }
  }, []);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: AddOnType) => {
      const response = await apiRpc.addons.$post({
        json: {
          businessId: data.businessId,
          name: data.name,
          dishIds: data.dishIds,
          choices: data.choices,
          choiceType: data.choiceType,
          addOnMaxQuantity: data.addOnMaxQuantity,
          compulsory: data.compulsory,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
  });
  return { mutate: mutateAsync, isPending };
};

export const useUpdateAddon = () => {
  const queryClient = useQueryClient();
  const { setOpenMenu, resetStore } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    resetStore: s.resetStore,
    addOnToggle: s.addOnToggle,
  }));

  const handleApiResponse = useCallback((res) => {
    if (res.err) {
      toast.error(res.message);
      return;
    }
    if (!res.err) {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["getAllAddOn"] });
      resetStore();
      setOpenMenu(false);
    }
  }, []);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: AddOnType) => {
      const response = await apiRpc.addons[":id"].$put({
        json: {
          businessId: data.businessId,
          name: data.name,
          dishIds: data.dishIds,
          choices: data.choices,
          choiceType: data.choiceType,
          availability: data.availability,
          visibility: data.visibility,
          compulsory: data.compulsory,
          addOnMaxQuantity: data.addOnMaxQuantity,
        },
        param: {
          id: data._id,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
  });
  return { mutate: mutateAsync, isPending };
};
