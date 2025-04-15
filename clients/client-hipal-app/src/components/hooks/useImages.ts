import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export interface Image {
    name: string
    imageUrl: string
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