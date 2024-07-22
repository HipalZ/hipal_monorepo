import useBusinessData from "@/components/store/useBusinessData";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { apiRpc } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useParentCategories = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const { setCategories } = useCategoryStore((state) => ({
    setCategories: state.setCategories,
  }));

  const getAllParentCategory = useCallback(async () => {
    if (!businessData?._id) return [];
    const res = await apiRpc.categories.$get({
      query: {
        businessId: businessData._id,
        parent: "true",
      },
    });
    const data = (await res.json()).data as CategoryType[];
    setCategories(data);
    return data;
  }, [businessData?._id]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["getAllParentCategory", businessData?._id],
    queryFn: getAllParentCategory,
    enabled: !!businessData?._id,
  });

  return { categories, isLoading };
};

export const useChildCategories = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const { setSubCategories } = useCategoryStore((state) => ({
    setSubCategories: state.setSubCategories,
  }));

  const getAllChildCategory = useCallback(async () => {
    if (!businessData?._id) return [];
    const res = await apiRpc.categories.$get({
      query: {
        businessId: businessData._id,
        child: "true",
      },
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
      toast.success(res.message);
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
  const { setOpenMenu, resetStore, categoryStep } =
    useMenuPageStore((s) => ({
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
      toast.success(res.message);
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
      console.log(payload);
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
