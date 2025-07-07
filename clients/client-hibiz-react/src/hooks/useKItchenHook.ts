import { useError } from "@/components/store/useError.ts";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

export interface KitchenData {
  _id: string;
  name: string;
  description: string;
  staffIds: string[];
  dishIds: string[];
  removeDishIds?: string[];
}

export const useGetAllKitchens = () => {
  const { businessId, menuId } = useParams<{
    businessId?: string;
    menuId?: string;
  }>();

  const fetchKitchens = useCallback(async () => {
    try {
      const response = await apiRpc.kitchen.$get({
        query: {
          businessId,
          menuId,
        },
      });
      const kitchenData = await response.json();
      return kitchenData?.data || ([] as KitchenData[]);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const { isLoading: kitchenLoading, data: kitchenData } = useQuery({
    queryKey: ["fetchKitchens", businessId],
    queryFn: fetchKitchens,
    enabled: !!businessId,
  });

  return {
    kitchenData,
    kitchenLoading,
  };
};

export interface CreateKitchenPayload {
  businessId: string;
  name: string;
  description: string;
  staffIds?: string[];
  dishIds?: string[];
  menuId: string;
}

export const useCreateKitchen = () => {
  const { setError, setOpenErrorModal } = useError((s) => ({
    setError: s.setError,
    setOpenErrorModal: s.setOpenErrorModal,
  }));
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: CreateKitchenPayload) => {
      const response = await apiRpc.kitchen.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Kitchen creation failed");
        toast.error("Kitchen creation failed");
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Kitchen already exists");
        toast.error("Kitchen already exists");
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["fetchKitchens", variables.businessId],
        });
        return toast.success("Kitchen created successfully");
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create kitchen");
    },
  });

  return {
    isPending,
    createKitchen: mutateAsync,
  };
};

export interface UpdatedKitchenPayload {
  kitchenId: string;
  name?: string;
  description?: string;
  staffIds?: string[];
  dishIds?: string[];
  removeDishIds?: string[];
}

export const useUpdateKitchen = () => {
  const { setError, setOpenErrorModal } = useError((s) => ({
    setError: s.setError,
    setOpenErrorModal: s.setOpenErrorModal,
  }));
  const businessId = useParams<{ businessId: string }>().businessId;
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: UpdatedKitchenPayload) => {
      const response = await apiRpc.kitchen.$put({
        json: payload,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true);
        setError("Kitchen update failed");
        toast.error("Kitchen update failed");
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Kitchen already exists");
        toast.error("Kitchen already exists");
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["fetchKitchens", businessId],
        });
        return toast.success("Kitchen updated successfully");
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update kitchen");
    },
  });

  return {
    isPending,
    updateKitchen: mutateAsync,
  };
};

export const useGetIndividualKitchen = (kitchenId: string) => {
  const fetchIndiviualKitchen = useCallback(async (kitchenId: string) => {
    try {
      const response = await apiRpc.kitchen[":kitchenId"].$get({
        param: {
          kitchenId: kitchenId,
        },
      });
      const individualKItchen = await response.json();
      return individualKItchen?.data as KitchenData;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const { isLoading: LoadingKitchen, data: gettingKitchenData } = useQuery({
    queryKey: ["fetchIndiviualKitchen", kitchenId],
    queryFn: () => fetchIndiviualKitchen(kitchenId || ""),
    enabled: !!kitchenId,
  });
  return {
    LoadingKitchen,
    gettingKitchenData,
  };
};
