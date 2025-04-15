import { apiRpc } from "@hi/common"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

// Interface for a single category
export interface CategoryBucket {
  _id: string
  name: string
  description: string
  businessId?: string
}

// Interface for the API response from fetch_categories
export interface CategoriesResponse {
  data: CategoryBucket[]
  status: number
  message?: string
}

// Interface for the payload to create a category
export interface CategoryPayload {
  name: string
  description: string
  businessId?: string
}

// Interface for API response
export interface ApiResponse {
  status: number
  message?: string
  data?: any
}

// Interface for the return type of useCategories
export interface UseCategoriesResult {
  categories: CategoryBucket[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
  addCategory: (payload: CategoryPayload) => Promise<ApiResponse>
  isAdding: boolean
}

export function useAdminUploadHook(): UseCategoriesResult {
  const queryClient = useQueryClient()

  // Function to fetch all categories
  const fetchCategories = async (): Promise<CategoriesResponse> => {
    try {
      const response = await apiRpc.bucket.category.fetch_categories.$get()
      return response.json()
    } catch (error) {
      console.error("Error fetching categories:", error)
      return { data: [], status: 500, message: "Failed to fetch categories" }
    }
  }

  // Query hook for fetching categories
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["categoriesBucket"],
    queryFn: fetchCategories,
  })

  // Mutation hook for adding a new category
  const { isPending: isAdding, mutateAsync: addCategory } = useMutation({
    mutationFn: async (payload: CategoryPayload): Promise<ApiResponse> => {
      try {
        const response = await apiRpc.bucket.category.add_category.$post({
          json: payload,
        })
        return response
      } catch (error) {
        console.error("Error adding category:", error)
        throw error
      }
    },
    onSuccess: (data) => {
      if (data.status === 200 || data.status === 201) {
        toast.success("Category added successfully")
        queryClient.invalidateQueries({ queryKey: ["categoriesBucket"] })
      } else {
        toast.error(data.message || "Failed to add category")
      }
    },
    onError: (error) => {
      console.error("Error adding category:", error)
      toast.error("Failed to add category")
    },
  })

  return {
    categories: data?.data || [],
    isLoading,
    isError,
    refetch,
    addCategory,
    isAdding,
  }
}

export interface Image {
  name: string
  imageUrl: string
}

// Interface for the API response
export interface ImagesResponse {
  categoryName: string
  images: Image[]
}

// Interface for the API response wrapper
export interface ApiResponse {
  status: number
  message?: string
  error: boolean
  data?: any
}

// Interface for the return type of useImagesByCategory
export interface UseImagesByCategoryResult {
  images: Image[] | undefined
  categoryName: string | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useImagesByCategory(categoryId: string): UseImagesByCategoryResult {
  const fetchImagesByCategory = async (categoryId: string): Promise<ApiResponse> => {
    try {
      if (!categoryId) {
        throw new Error("Category ID is required")
      }

      const response = await apiRpc.bucket.images.fetch_Bucket_images.$get({
        query: {
          categoryId,
        },
      })

      return response.json()
    } catch (error) {
      console.error("Error fetching images:", error)
      toast.error("Failed to load images")
      throw error
    }
  }

  // Query hook for fetching images
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["categoryImages", categoryId],
    queryFn: () => fetchImagesByCategory(categoryId),
    enabled: !!categoryId,
  })

  return {
    images: data?.data?.images,
    categoryName: data?.data?.categoryName,
    isLoading,
    isError,
    refetch,
  }
}

// Interface for the return type of useSaveImagesToBucket

export interface SaveImagePayload {
  name: string
  description?: string
  imageUrl: string
  categoryBucketId: string
  businessId?: string
}

export interface UseSaveImagesToBucketResult {
  saveImageToBucket: (payload: SaveImagePayload) => Promise<ApiResponse>
  isSaving: boolean
}

export function useSaveImagesToBucket(): UseSaveImagesToBucketResult {
  // Mutation hook for saving an image to the bucket
  const { isPending: isSaving, mutateAsync: saveImageToBucket } = useMutation({
    mutationFn: async (payload: SaveImagePayload): Promise<ApiResponse> => {
      try {
        const response = await apiRpc.bucket.images.add_images.$post({
          json: payload,
        })

        return response
      } catch (error) {
        console.error("Error saving image:", error)
        throw error
      }
    },
  })

  return {
    saveImageToBucket,
    isSaving,
  }
}

export interface IBuckets {
  categoryName: string;
  categoryId: string;
  images: Image[];
}

export interface UseGetBucketById {
  buckets: IBuckets[]
  isLoading: boolean
  isError: boolean
  getBuckets: () => void
}
export interface BucketResponseById {
  data: IBuckets[]
  status: number
  message?: string
}

export function useGetBucketByBusinessId(businessId: string): UseGetBucketById {

  const fetchAllCategoriesByBusinessId = async (businessId: string): Promise<BucketResponseById> => {
    try {
      const response = await apiRpc.bucket.images.fetch_bucket_by_business.$get({
        query: {
          businessId: businessId
        }
      })
      return response.json()
    } catch (error) {
      console.error("error fetching bucket")
      return {
        data: [],
        status: 500,
        message: "error fetching buckets"
      }
    }
  }

  const { data, isLoading, isError, refetch: getBuckets } = useQuery({
    queryKey: ["bucketByBusinessId", businessId],
    queryFn: () => fetchAllCategoriesByBusinessId(businessId),
    enabled: !!businessId,
  })
  return {
    buckets: data?.data || [],
    isLoading,
    isError,
    getBuckets
  }
}

export interface AddCategoryByIdPayload {
  name: string
  description?: string
  businessId: string
}

export interface UseAddCategoryByIdResult {
  addCategoryById: (payload: AddCategoryByIdPayload) => Promise<ApiResponse>
  isAdding: boolean
}

export function useAddCategoryById(): UseAddCategoryByIdResult {
  const queryClient = useQueryClient()

  const { isPending: isAdding, mutateAsync: addCategoryById } = useMutation({
    mutationFn: async (payload: AddCategoryByIdPayload): Promise<ApiResponse> => {
      try {
        const response = await apiRpc.bucket.category.add_category.$post({
          json: payload,
        })
        return response
      } catch (error) {
        console.error("Error adding category by ID:", error)
        throw error
      }
    },
    onSuccess: (data,variables) => {
      if (data.status === 200 || data.status === 201) {
        toast.success("Category added successfully")
        queryClient.invalidateQueries({ queryKey: ["bucketByBusinessId",variables.businessId] })
      } else {
        toast.error(data.message || "Failed to add category")
      }
    },
    onError: (error) => {
      console.error("Error adding category by ID:", error)
      toast.error("Failed to add category")
    },
  })

  return {
    addCategoryById,
    isAdding,
  }
}



