import { useError } from "@/components/store/useError.ts";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useApiErrorHandler } from "./useApiErrorHandler.ts";
export interface PosConfigData {
  _id: string;
  businessId: string;
  posId: string;
  orderMode: string;
  orderVerificationType: "CAPTAIN" | "USER";
  petPoojaId: string;
  restName: string;
  posName: string;
  restId: string;
  defaultTableName: string;
  accessKey?: string;
  authToken?: string;
  secretKey?: string;
  branchId?: string;
  isDeleted: boolean;
}

export const useGetPosConfig = (businessId: string) => {
  const { handleEnvelope } = useApiErrorHandler();

  const fetchPosConfig = useCallback(
    async (businessId: string) => {
      try {
        const response = await apiRpc.pos.fetch_pos_config.$get({
          query: { businessId },
        });

        await handleEnvelope(response);

        const res = await response.json();
        return res.data as PosConfigData;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    [handleEnvelope],
  );

  // Query to Fetch POS Config
  const {
    data: posConfig,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["fetchPosConfig", businessId],
    queryFn: () => fetchPosConfig(businessId || ""),
    enabled: !!businessId,
    retry: false,
  });

  return {
    posConfig,
    isLoading,
    refetch,
  };
};

export interface DishPermissionData {
  _id: string;
  description: boolean;
  images: boolean;
  visibility: boolean;
  recommendationIds: boolean;
  kitchenId: boolean;
}

export const useDishPermission = (isBoolean: boolean) => {
  const businessId = useParams<{ businessId: string }>().businessId;
  const { handleEnvelope } = useApiErrorHandler();
  const dishPermission = useCallback(
    async (businessId: string) => {
      try {
        const response =
          await apiRpc.pos_configuration.dish.fetch_dish_pos_config.$get({
            query: { businessId },
          });

        await handleEnvelope(response);

        const res = await response.json();
        return res.data as DishPermissionData;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    [handleEnvelope],
  );

  const { data: posPermission, isLoading: permissionLoading } = useQuery({
    queryKey: ["dishPermission", businessId],
    queryFn: () => dishPermission(businessId || ""),
    enabled: !!businessId && isBoolean,
  });

  return {
    posPermission,
    permissionLoading,
  };
};

export const usePosSync = () => {
  const businessId = useParams<{ businessId: string }>().businessId;
  const { setError, setOpenErrorModal } = useError();
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutate } = useMutation({
    mutationFn: async (restId: string) => {
      const response = await apiRpc.pos.sync_menu.$post({
        json: {
          businessId: businessId || "",
          restId: restId || "",
        },
      });
      await handleEnvelope(response);
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData?.error?.issues[0]?.message);
        setOpenErrorModal(true);
        return toast.error("Failed to sync POS");
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("POS synced successfully");
        return;
      }
    },
    onError: (error) => {
      setError(error.message);
      setOpenErrorModal(true);
    },
  });
  return {
    isPending,
    mutate,
  };
};

export const usePosSyncWithMenu = () => {
  const businessId = useParams<{ businessId: string }>().businessId;
  const { setError, setOpenErrorModal } = useError();
  const { handleEnvelope } = useApiErrorHandler();
  const { isPending, mutate } = useMutation({
    mutationFn: async (payload: { restId: string; tableName?: string }) => {
      const response = await apiRpc.sync_pos_menu_config.sync.$post({
        json: {
          businessId: businessId || "",
          restId: payload.restId || "",
          tableName: payload.tableName || "1",
        },
      });
      await handleEnvelope(response);
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData?.error?.issues[0]?.message);
        setOpenErrorModal(true);
        return toast.error("Failed to sync POS");
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("POS synced successfully");
        return;
      }
    },
    onError: (error) => {
      setError(error.message);
      setOpenErrorModal(true);
    },
  });
  return {
    isPending,
    mutate,
  };
};
