import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router-dom";

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
  const fetchPosConfig = useCallback(async (businessId: string) => {
    try {
      const response = await apiRpc.pos.fetch_pos_config.$get({
        query: { businessId },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();

      if (!res.data || res.err) {
        return null;
      }

      return res.data as PosConfigData;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

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

  const dishPermission = useCallback(async (businessId: string) => {
    try {
      const response =
        await apiRpc.pos_configuration.dish.fetch_dish_pos_config.$get({
          query: { businessId },
        });

      const res = await response.json();
      console.log("sankalesh data", res.data);
      return res.data as DishPermissionData;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

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
