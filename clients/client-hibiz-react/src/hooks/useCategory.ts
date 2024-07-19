// src/hooks/useParentCategories.ts
// Adjust the import path according to your project structure

import useBusinessData from "@/components/store/useBusinessData";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import { apiRpc } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useParentCategories = () => {
    const businessData = useBusinessData((state) => state.businessData);
    const { setCategories } = useCategoryStore(state => ({
        setCategories: state.setCategories
    }));

    const getAllParentCategory = useCallback(async () => {
        if (!businessData?._id) return [];
        const res = await apiRpc.categories.$get({
            query: {
                businessId: businessData._id,
                parent: "true"
            }
        });
        const data = (await res.json()).data as CategoryType[];
        setCategories(data)
        return data;
    }, [businessData?._id]);

    const { data: categories, isLoading } = useQuery({
        queryKey: ["categories", businessData?._id],
        queryFn: getAllParentCategory,
        enabled: !!businessData?._id
    });

    return { categories, isLoading };
};

export const useChildCategories = () => {
    const businessData = useBusinessData((state) => state.businessData);
    const { setSubCategories } = useCategoryStore(state => ({
        setSubCategories: state.setSubCategories
    }));

    const getAllParentCategory = useCallback(async () => {
        if (!businessData?._id) return [];
        const res = await apiRpc.categories.$get({
            query: {
                businessId: businessData._id,
                child: "true"
            }
        });
        const data = (await res.json()).data as CategoryType[];
        setSubCategories(data)
        return data;
    }, [businessData?._id]);

    const { data: categories, isLoading } = useQuery({
        queryKey: ["categories", businessData?._id],
        queryFn: getAllParentCategory,
        enabled: !!businessData?._id
    });

    return { categories, isLoading };
};

export const useSaveCategory = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await apiRpc.categories.$post({
                json: payload
            });
            return res.json();
        },
        onSuccess: (data) => {
            toast.success("Category created successful");
            console.log(data);
        },
        onError: (error) => {
            toast.error("Category name already exists");
        }

    }
    );
};