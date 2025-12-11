import { useCategoryStore } from "@/components/store/useCategoryStore";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { apiRpc } from "@hi/common";
import type { AddOnType } from "@hi/db-models/src/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

export const useAddOnList = () => {
  const { businessId, menuId } = useParams<{
    businessId?: string;
    menuId: string;
  }>();

  const { setAddOnTypes } = useCategoryStore((state) => ({
    setAddOnTypes: state.setAddOnTypes,
  }));

  const updatedQuery = menuId
    ? {
        menuId: menuId,
        businessId: businessId,
      }
    : {
        businessId: businessId,
      };

  const getAllAddOn = async () => {
    if (!businessId && !menuId) return [];
    const res = await apiRpc.addons.$get({
      query: updatedQuery,
    });
    const data = (await res.json()).data as AddOnType[];
    setAddOnTypes(data);
    return data;
  };

  const { data: addOns, isLoading } = useQuery({
    queryKey: ["getAllAddOn", businessId, menuId],
    queryFn: getAllAddOn,
    enabled: !!businessId && !!menuId,
    staleTime: 5 * 60 * 1000,
  });

  return { addOns, isLoading };
};

export const useSaveAddOn = () => {
  const queryClient = useQueryClient();
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const resetStore = useMenuPageStore((s) => s.resetStore);

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
          menuId: data.menuId,
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
          removeDishIds: data.removeDishIds,
          menuId: data.menuId,
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

export const useDeleteAddon = () => {
  const queryClient = useQueryClient();
  const { setOpenMenu, resetStore, setIsCatDelete } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    resetStore: s.resetStore,
    setIsCatDelete: s.setIsCatDelete,
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
      setIsCatDelete(false);
    }
  }, []);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRpc.addons[":id"].$delete({
        param: {
          id,
        },
        json: {},
      });
      return response.json();
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
  });
  return { mutate: mutateAsync, isPending };
};
