import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router-dom";

export interface KitchenData {
  _id: string;
  name: string;
  description: string;
  staffIds: string[];
  dishIds: string[];
  removeDishIds?: string[];
}

export const useGetAllKitchenByBusiness = () => {
  const businessId = useParams<{ businessId: string }>().businessId;
  const fetchKitchensByBusiness = useCallback(async (businessId: string) => {
    try {
      const response = await apiRpc.kitchen.kitchenByBusiness.$get({
        query: {
          businessId: businessId,
        },
      });
      const kitchenByBusiness = await response.json();
      return kitchenByBusiness?.data || ([] as KitchenData[]);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const { isLoading: LoadingKitchensByBusiness, data: kitchenByBusinessData } =
    useQuery<KitchenData[]>({
      queryKey: ["fetchKitchensByBusiness", businessId],
      queryFn: () => fetchKitchensByBusiness(businessId || ""),
      enabled: !!businessId,
    });
  return {
    LoadingKitchensByBusiness,
    kitchenByBusinessData,
  };
};
