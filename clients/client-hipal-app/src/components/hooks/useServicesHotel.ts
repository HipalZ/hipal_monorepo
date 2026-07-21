import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import type { StaticImageData } from "next/image";

// Define the interfaces
export interface IService {
  _id: string;
  name: string;
  image: string;
  availability?: boolean;
  sequence?: number;
  /** Estimated "should be delivered by" time in minutes (already includes acceptance). */
  avgDeliveryTime?: number;
}

export interface IServiceCategory {
  _id: string;
  name: string;
  image: string | StaticImageData;
  serviceIds: IService[];
  description?: string;
  sequence?: number;
}

export const useGetServiceCategories = (businessId?: string) => {
  const fetchServiceCategories = async (): Promise<IServiceCategory[]> => {
    if (!businessId) return [];

    const response = await apiRpc.hotel.service.fetch_service_category.$get({
      query: {
        businessId,
      },
    });

    const data = await response.json();
    const filteredData = (data?.data || []).filter(
      (category: IServiceCategory) => category.serviceIds.length > 0,
    );

    return filteredData || [];
  };

  const {
    isLoading: categoriesLoading,
    data: categoriesData,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["getServiceCategories", businessId],
    queryFn: fetchServiceCategories,
    enabled: !!businessId,
    staleTime: 1000 * 60,
  });

  return { categoriesLoading, categoriesData, refetchCategories };
};
