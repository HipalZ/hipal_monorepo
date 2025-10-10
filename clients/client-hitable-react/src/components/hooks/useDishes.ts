import { apiRpc } from "@hi/common";
import type { DishType } from "@hi/db-models/src/validators";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrderStore } from "@/components/store/useOrderData";
import useBusinessData from "@/components/store/useBusinessData.ts";

export async function putDishData(filteredPayload: any) {
  const dishResponse = await apiRpc.dishes[":id"].$put({
    param: {
      id: filteredPayload._id,
    },
    json: filteredPayload,
  });
  const data = await dishResponse.json();
  return { data, dishResponse };
}

export const useUpdateDish = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: any) => {
      const { data, dishResponse } = await putDishData(payload);
      return { data, dishResponse };
    },
  });

  return { isPending, mutateAsync };
};

export const useDishes = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const setAllDishes = useOrderStore((s) => s.setAllDishes);

  const getAllDishes = async (): Promise<DishType[]> => {
    if (!businessId) return [];
    const dishResponse = await apiRpc.dishes.$get({
      query: {
        businessId: businessId,
      },
    });
    const data = await dishResponse.json();
    setAllDishes(data?.data as DishType[]);
    return data?.data as DishType[];
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery<
    DishType[]
  >({
    queryKey: ["getAllDishes", businessId],
    queryFn: getAllDishes,
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });

  return { data, isLoading, isError, refetch, isFetching };
};
