import useBusinessData from "@/components/store/useBusinessData";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { apiRpc } from "@hi/common";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { parse } from "papaparse";
import { useParams } from "react-router-dom";

export const useParentCategories = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const menuId = useParams<{ menuId: string }>().menuId;
  const { setCategories } = useCategoryStore((state) => ({
    setCategories: state.setCategories,
  }));

  const updatedQuery = menuId ? {
    menuId: menuId,
    businessId: businessData?._id,
    parent: "true",
  } : {
    businessId: businessData?._id,
    parent: "true",
  }

  const getAllParentCategory = useCallback(async () => {
    if (!businessData?._id) return [];
    const res = await apiRpc.categories.$get({
      query: updatedQuery
    });
    const data = (await res.json()).data as CategoryType[];
    setCategories(data);
    return data;
  }, [businessData?._id,menuId]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["getAllParentCategory", businessData?._id],
    queryFn: getAllParentCategory,
    enabled: !!businessData?._id,
  });

  return { categories, isLoading };
};

export const useChildCategories = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const menuId = useParams<{ menuId: string }>().menuId;
  const { setSubCategories } = useCategoryStore((state) => ({
    setSubCategories: state.setSubCategories,
  }));

  const updatedQuery = menuId ? {
    menuId: menuId,
    businessId: businessData?._id,
    child: "true",
  } : {
    businessId: businessData?._id,
    child: "true",
  }

  const getAllChildCategory = useCallback(async () => {
    if (!businessData?._id) return [];
    const res = await apiRpc.categories.$get({
      query: updatedQuery
    });
    const data = (await res.json()).data as CategoryType[];
    setSubCategories(data);
    return data;
  }, [businessData?._id]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["getAllChildCategory", businessData?._id],
    queryFn: getAllChildCategory,
    enabled: !!businessData?._id,
  });

  return { categories, isLoading };
};

export const useSaveCategory = () => {
  const queryClient = useQueryClient();
  const { setOpenMenu, resetStore, selectedCategory } = useMenuPageStore(
    (s) => ({
      setOpenMenu: s.setOpenMenu,
      resetStore: s.resetStore,
      selectedCategory: s.selectedCategory,
    }),
  );

  const handleApiResponse = useCallback((res) => {
    if (res.err) {
      toast.error(res.message);
      return;
    }
    if (res) {
      toast.success("Saved successfully");
      setOpenMenu(false);
      if (selectedCategory === "MAIN_CATEGORY") {
        queryClient.invalidateQueries({ queryKey: ["getAllParentCategory"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["getAllChildCategory"] });
      }
      resetStore();
    }
  }, []);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRpc.categories.$post({
        json: payload,
      });
      return res.json();
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
  });
  return { mutate: mutateAsync, isPending };
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { setOpenMenu, resetStore, categoryStep } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    resetStore: s.resetStore,
    selectedPage: s.selectedPage,
    categoryStep: s.categoryStep,
  }));

  const handleApiResponse = useCallback((res) => {
    if (res.err) {
      toast.error(res.message);
      return;
    }
    if (!res.err) {
      toast.success("Updated successfully");
      setOpenMenu(false);
      if (categoryStep === "EDIT_MAIN_CATEGORY") {
        queryClient.invalidateQueries({ queryKey: ["getAllParentCategory"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["getAllChildCategory"] });
      }
      resetStore();
    }
  }, []);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRpc.categories[":id"].$put({
        json: payload,
        param: {
          id: payload._id,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
  });
  return { mutate: mutateAsync, isPending };
};

export const normalizeAndMapKeys = (
  obj: any,
  keyMap: { [key: string]: string },
) => {
  const normalizeKey = (key: string) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[\s-_]+/g, " ")
      .toLowerCase()
      .replace(/\s+/g, "");
  };

  return Object.keys(obj).reduce((acc, key) => {
    const normalizedKey = normalizeKey(key);
    const newKey = keyMap[normalizedKey] || key;
    acc[newKey] = obj[key];
    return acc;
  }, {} as any);
};

export const useBulkUploadDishes = () => {
  const queryClient = useQueryClient();
  const businessData = useBusinessData((state) => state.businessData);
  const { setOpenMenu, resetStore } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    resetStore: s.resetStore,
  }));

  const handleApiResponse = useCallback(
    (res: any) => {
      if (res.status === 400 || res.status === 403) {
        toast.error("Please upload a valid format");
      } else if (res.status === 201 || res.status === 200) {
        toast.success("Dishes uploaded successfully");
        setOpenMenu(false);
        queryClient.invalidateQueries({
          queryKey: ["getAllDishes", businessData?._id],
        });
        resetStore();
      } else {
        toast.error("An unexpected error occurred");
      }
    },
    [queryClient, setOpenMenu, resetStore, businessData?._id],
  );

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => {
      return new Promise((resolve, reject) => {
        parse(file, {
          header: true,
          complete: async (result) => {
            const keyMap = {
              name: "name",
              price: "price",
              dishtypes: "dishTypes",
              "dish types": "dishTypes",
              description: "description",
            };

            const data = result.data.map((item: any) =>
              normalizeAndMapKeys(item, keyMap),
            ) as DishType[];

            const validData = data
              .filter(
                (item: DishType) => item.name && Object.keys(item).length > 0,
              )
              .map((item: DishType) => ({
                ...item,
                dishTypes: [item.dishTypes],
                businessId: businessData?._id,
                name: item.name,
                description: item.description?.slice(0, 190),
              }));

            const formData = new FormData();
            formData.append("data", JSON.stringify(validData));
            const dishes = JSON.parse(
              formData.get("data") as string,
            ) as DishType[];
            try {
              const res = await apiRpc.dishes[":businessId"].bulkUpload.$post({
                param: {
                  businessId: businessData?._id,
                },
                json: dishes,
              });

              resolve(res);
            } catch (error) {
              reject(error);
            }
          },
        });
      });
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
    onError: (error) => {
      toast.error("Failed to upload dishes");
      console.error("Error uploading dishes:", error);
    },
  });

  return { mutate: mutateAsync, isPending };
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { setOpenMenu, resetStore, categoryStep, setIsCatDelete } =
    useMenuPageStore((s) => ({
      setOpenMenu: s.setOpenMenu,
      resetStore: s.resetStore,
      categoryStep: s.categoryStep,
      isCatDelete: s.isCatDelete,
      setIsCatDelete: s.setIsCatDelete,
    }));

  const handleApiResponse = useCallback((res) => {
    if (res.err) {
      toast.error(res.message);
      return;
    }
    if (!res.err) {
      toast.success("Deleted successfully");
      setOpenMenu(false);
      setIsCatDelete(false);
      if (categoryStep === "EDIT_MAIN_CATEGORY") {
        queryClient.invalidateQueries({ queryKey: ["getAllParentCategory"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["getAllChildCategory"] });
      }
      resetStore();
    }
  }, []);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRpc.categories[":id"].$delete({
        param: {
          id,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
  });
  return { mutate: mutateAsync, isPending };
};
