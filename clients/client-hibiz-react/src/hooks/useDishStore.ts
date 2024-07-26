import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { apiRpc } from "@hi/common";
import type { ICategory } from "@/components/types/businessData";
import type {
  AddOnType,
  CategoryType,
  DishType,
} from "@hi/db-models/src/validators";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { useDishesStore } from "@/components/store/useDishesStore";

export const useChildCategories = (dishStep: string) => {
  const { businessId } = useParams<{ businessId?: string }>();

  const getAllChildCategoryData = async (
    businessId: string,
  ): Promise<ICategory[]> => {
    const categoryResponse = await apiRpc.categories.$get({
      query: {
        businessId: businessId,
        child: "true",
      },
    });
    const data = await categoryResponse.json();
    return data?.data as ICategory[];
  };

  const { data, isLoading, isError } = useQuery<ICategory[]>({
    queryKey: [
      "childCategories",
      businessId,
      dishStep === "LINK_CATEGORY_STEP",
    ],
    queryFn: () => getAllChildCategoryData(businessId ?? ""),
    enabled: !!businessId && dishStep === "LINK_CATEGORY_STEP",
  });

  return { data, isLoading, isError };
};

export const useDishStore = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  const { setDishes } = useDishesStore((s) => ({
    setDishes: s.setDishes,
  }));

  const getAllDishes = async (businessId: string): Promise<DishType[]> => {
    const dishResponse = await apiRpc.dishes.$get({
      query: {
        businessId: businessId,
      },
    });
    const data = await dishResponse.json();
    setDishes(data?.data as DishType[]);
    return data?.data as DishType[];
  };

  const { data, isLoading, isError, refetch } = useQuery<DishType[]>({
    queryKey: ["getAlldishes", businessId],
    queryFn: () => getAllDishes(businessId ?? ""),
    enabled: !!businessId,
  });

  return { data, isLoading, isError, refetch };
};

export const useLinkedDishes = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  const { setLinkedDishes, linkedDishes } = useMenuPageStore((s) => ({
    linkedDishes: s.linkedDishes,
    setLinkedDishes: s.setLinkedDishes,
  }));

  const getAllLinkedDishes = async (
    businessId: string,
  ): Promise<CategoryType[]> => {
    const categoryResponse = await apiRpc.categories.menu.$get({
      query: {
        businessId: businessId,
      },
    });
    const data = await categoryResponse.json();
    setLinkedDishes(data?.data as CategoryType[]);
    return data?.data as CategoryType[];
  };

  const { data, isLoading, isError } = useQuery<CategoryType[]>({
    queryKey: ["linkedDishes", businessId],
    queryFn: () => getAllLinkedDishes(businessId ?? ""),
    enabled: !!businessId && linkedDishes.length === 0,
  });
  return { data, isLoading, isError };
};

export const useAddons = (dishStep: string) => {
  const { businessId } = useParams<{ businessId?: string }>();
  const { setAddons } = useMenuPageStore((s) => ({
    setAddons: s.setAddons,
  }));

  const getAllAddons = async (businessId: string): Promise<AddOnType[]> => {
    const addonResponse = await apiRpc.addons.$get({
      query: {
        businessId: businessId,
      },
    });
    const data = await addonResponse.json();
    setAddons(data?.data as AddOnType[]);
    return data?.data as AddOnType[];
  };

  const { data, isLoading, isError } = useQuery<AddOnType[]>({
    queryKey: ["addons", businessId, dishStep === "LINK_ADDON_STEP"],
    queryFn: () => getAllAddons(businessId ?? ""),
    enabled: !!businessId && dishStep === "LINK_ADDON_STEP",
  });

  return { data, isLoading, isError };
};

export async function postDishData(filteredPayload: any): Promise<any> {
  const dishResponse = await apiRpc.dishes.$post({
    json: filteredPayload,
  });
  const data = await dishResponse.json();
  return { data, dishResponse };
}

export async function putDishData(filteredPayload: any): Promise<any> {
  const dishResponse = await apiRpc.dishes[":id"].$put({
    param: {
      id: filteredPayload._id,
    },
    json: filteredPayload,
  });
  const data = await dishResponse.json();
  return { data, dishResponse };
}

export async function deleteDishData(id: string): Promise<any> {
  const dishResponse = await apiRpc.dishes[":id"].$delete({
    param: {
      id: id,
    },
  });
  const data = await dishResponse.json();
  console.log("data", data);
  return { data, dishResponse };
}
