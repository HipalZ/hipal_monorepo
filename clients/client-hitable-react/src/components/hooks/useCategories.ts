import { apiRpc } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useOrderStore } from "@/components/store/useOrderData";

export const useCategories = () => {
  const { businessId } = useParams();
  const setAllCategories = useOrderStore((s) => s.setAllCategories);
  const setFirstCat = useOrderStore((s) => s.setFirstCat);

  const getChildCategories = async () => {
    const childCategories = await apiRpc.categories.$get({
      query: {
        businessId: businessId || "",
        dishes: "true",
      },
    });
    const response = await childCategories.json();
    setAllCategories(response.data as CategoryType[]);
    setFirstCat(response.data);
    return response.data as CategoryType[];
  };

  const { isLoading, error, refetch } = useQuery({
    queryKey: ["getChildCategories", businessId],
    queryFn: getChildCategories,
    enabled: !!businessId,
    staleTime: 1000 * 30,
  });

  return { isLoading, error, refetch };
};
