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

  const updatedQuery = menuId
    ? {
        menuId: menuId,
        businessId: businessData?._id,
        parent: "true",
      }
    : {
        businessId: businessData?._id,
        parent: "true",
      };

  const getAllParentCategory = useCallback(async () => {
    if (!businessData?._id) return [];
    const res = await apiRpc.categories.$get({
      query: updatedQuery,
    });
    const data = (await res.json()).data as CategoryType[];
    setCategories(data);
    return data;
  }, [businessData?._id, menuId]);

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

  const updatedQuery = menuId
    ? {
        menuId: menuId,
        businessId: businessData?._id,
        child: "true",
      }
    : {
        businessId: businessData?._id,
        child: "true",
      };

  const getAllChildCategory = useCallback(async () => {
    if (!businessData?._id) return [];
    const res = await apiRpc.categories.$get({
      query: updatedQuery,
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

const DISH_TYPE_MAPPING: Record<string, string> = {
  // VEG variations
  veg: "VEG",
  vegetarian: "VEG",
  v: "VEG",

  // NON_VEG variations
  non_veg: "NON_VEG",
  "non-veg": "NON_VEG",
  "non veg": "NON_VEG",
  nonveg: "NON_VEG",
  "non vegetarian": "NON_VEG",
  meat: "NON_VEG",
  chicken: "NON_VEG",
  mutton: "NON_VEG",
  fish: "NON_VEG",
  seafood: "NON_VEG",

  // EGG variations
  egg: "EGG",
  eggs: "EGG",

  // VEGAN variations
  vegan: "VEGAN",
  "plant based": "VEGAN",
  "plant-based": "VEGAN",

  // ALCOHOL variations
  alcohol: "ALCOHOL",
  alcoholic: "ALCOHOL",
  wine: "ALCOHOL",
  beer: "ALCOHOL",
  cocktail: "ALCOHOL",

  // NON_ALCOHOL variations
  non_alcohol: "NON_ALCOHOL",
  "non-alcohol": "NON_ALCOHOL",
  "non alcohol": "NON_ALCOHOL",
  nonalcohol: "NON_ALCOHOL",
  mocktail: "NON_ALCOHOL",
  "soft drink": "NON_ALCOHOL",

  // GLUTEN_FREE variations
  gluten_free: "GLUTEN_FREE",
  "gluten-free": "GLUTEN_FREE",
  "gluten free": "GLUTEN_FREE",
  glutenfree: "GLUTEN_FREE",
  gf: "GLUTEN_FREE",

  // MIX variations
  mix: "MIX",
  mixed: "MIX",
  combination: "MIX",
  combo: "MIX",
};

// Function to normalize dish types
const normalizeDishType = (dishType: string): string => {
  if (!dishType || typeof dishType !== "string") {
    return "VEG"; // Default fallback
  }

  // Clean the input: remove extra spaces, convert to lowercase
  const cleaned = dishType.trim().toLowerCase().replace(/\s+/g, " ");

  // Check if it's already a valid dish type (case insensitive)
  const validDishTypes = [
    "VEG",
    "NON_VEG",
    "EGG",
    "VEGAN",
    "ALCOHOL",
    "NON_ALCOHOL",
    "GLUTEN_FREE",
    "MIX",
  ];
  const upperCased = cleaned.toUpperCase();
  if (validDishTypes.includes(upperCased)) {
    return upperCased;
  }

  // Try to find a mapping
  if (DISH_TYPE_MAPPING[cleaned]) {
    return DISH_TYPE_MAPPING[cleaned];
  }

  // If no mapping found, return VEG as default
  console.warn(`Unknown dish type: "${dishType}", defaulting to VEG`);
  return "VEG";
};

// Function to normalize dish name
const normalizeDishName = (name: string): string => {
  if (!name || typeof name !== "string") {
    return "";
  }

  return name
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[^\w\s-']/g, "") // Remove special characters except hyphens and apostrophes
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Title case
    .join(" ");
};

// Function to normalize price
const normalizePrice = (price: string | number): number => {
  if (typeof price === "number") {
    return Math.max(0, Math.round(price * 100) / 100); // Round to 2 decimal places, ensure positive
  }

  if (!price || typeof price !== "string") {
    return 0;
  }

  // Remove currency symbols, spaces, and non-numeric characters except decimal point
  const cleaned = price
    .toString()
    .replace(/[₹$€£¥,\s]/g, "") // Remove common currency symbols and spaces
    .replace(/[^\d.]/g, ""); // Keep only digits and decimal point

  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed * 100) / 100);
};

// Function to normalize description
const normalizeDescription = (description: string): string => {
  if (!description || typeof description !== "string") {
    return "";
  }

  return description
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .slice(0, 190); // Limit to 190 characters
};

// Function to normalize portions
const normalizePortions = (portionsString: string): any[] => {
  if (!portionsString || typeof portionsString !== 'string') {
    return []
  }

  try {
    // Handle pipe-separated format: "Regular:299:NON_VEG:true|Large:399:NON_VEG:false"
    const portionStrings = portionsString.split('|').filter(p => p.trim())
    
    return portionStrings.map((portionStr, index) => {
      const [name, price, type, isDefault] = portionStr.split(':').map(s => s.trim())
      
      return {
        name: normalizeDishName(name || `Portion ${index + 1}`),
        price: normalizePrice(price || '0'),
        portionTypes: [normalizeDishType(type || 'VEG')],
        default: isDefault === 'true' || index === 0, // First portion is default if not specified
      }
    }).filter(portion => portion.name.length >= 3 && portion.price > 0)
  } catch (error) {
    console.warn('Failed to parse portions:', portionsString, error)
    return []
  }
}

// Enhanced normalizeAndMapKeys function
const normalizeAndMapKeys = (item: any, keyMap: Record<string, string>) => {
  const normalized: any = {};

  Object.keys(item).forEach((key) => {
    const cleanKey = key.toLowerCase().trim();
    const mappedKey = keyMap[cleanKey] || cleanKey;

    if (item[key] !== null && item[key] !== undefined && item[key] !== "") {
      normalized[mappedKey] = item[key];
    }
  });

  return normalized;
};

export const useBulkUploadDishes = () => {
  const queryClient = useQueryClient()
  const { businessId, menuId } = useParams<{
    businessId: string
    menuId: string
  }>()
  const { setOpenMenu, resetStore, setShowBulkUploadModal } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    resetStore: s.resetStore,
    setShowBulkUploadModal: s.setShowBulkUploadModal,
  }))

  const handleApiResponse = useCallback(
    (res: any) => {
      if (res.status === 400 || res.status === 403) {
        toast.error("Please upload a valid format")
      } else if (res.status === 201 || res.status === 200) {
        toast.success("Dishes uploaded successfully")
        setOpenMenu(false)
        queryClient.invalidateQueries({
          queryKey: ["getAllDishes", businessId],
        })
        resetStore()
        // Close the modal on success
        if (typeof setShowBulkUploadModal === "function") {
          setShowBulkUploadModal(false)
        }
      } else {
        toast.error("An unexpected error occurred")
      }
    },
    [queryClient, setOpenMenu, resetStore, businessId, setShowBulkUploadModal],
  )

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => {
      return new Promise((resolve, reject) => {
        parse(file, {
          header: true,
          complete: async (result) => {
            const keyMap = {
              name: "name",
              "dish name": "name",
              dishname: "name",
              price: "price",
              "dish price": "price",
              dishprice: "price",
              cost: "price",
              dishtypes: "dishTypes",
              "dish types": "dishTypes",
              "dish type": "dishTypes",
              dishtype: "dishTypes",
              type: "dishTypes",
              category: "dishTypes",
              description: "description",
              "dish description": "description",
              dishdescription: "description",
              desc: "description",
              details: "description",
              portions: "portions",
              "dish portions": "portions",
              "portion sizes": "portions",
              sizes: "portions",
            }

            const data = result.data.map((item: any) => normalizeAndMapKeys(item, keyMap)) as DishType[]

            const validData = data
              .filter((item: DishType) => {
                // More robust filtering
                const hasName = item.name && typeof item.name === "string" && item.name.trim().length > 0
                const hasPrice = item.price !== undefined && item.price !== null
                return hasName && hasPrice
              })
              .map((item: DishType) => {
                // Parse portions if provided
                const portions = item.portions ? normalizePortions(item.portions as string) : []

                // Normalize all fields
                const normalizedItem = {
                  ...item,
                  name: normalizeDishName(item.name as string),
                  price: normalizePrice(item.price as string | number),
                  dishTypes: [normalizeDishType(item.dishTypes as string)],
                  description: normalizeDescription(item.description as string),
                  portions: portions,
                  businessId: businessId,
                  menuId: menuId,
                }

                return normalizedItem
              })
              .filter((item: DishType) => {
                // Final validation after normalization
                return item.name.length >= 3 && item.price > 0
              })

            if (validData.length === 0) {
              throw new Error("No valid dishes found in the uploaded file")
            }

            try {
              const res = await apiRpc.dishes[":businessId"].bulkUpload.$post({
                param: {
                  businessId: businessId || "",
                },
                json: validData,
              })

              resolve(res)
            } catch (error) {
              reject(error)
            }
          },
          error: (error) => {
            reject(new Error(`Failed to parse CSV file: ${error.message}`))
          },
        })
      })
    },
    onSuccess: (data) => {
      handleApiResponse(data)
    },
    onError: (error) => {
      toast.error("Failed to upload dishes")
      console.error("Error uploading dishes:", error)
    },
  })

  return { mutate: mutateAsync, isPending }
}
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
        json: {},
      });
      return res.json();
    },
    onSuccess: (data) => {
      handleApiResponse(data);
    },
  });
  return { mutate: mutateAsync, isPending };
};
