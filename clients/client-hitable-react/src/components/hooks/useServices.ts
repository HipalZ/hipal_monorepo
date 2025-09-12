import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export interface IService {
  _id: string;
  name: string;
  image: string;
  availability?: boolean;
  avgCompletionTime?: number;
  avgAcceptanceTime?: number;
}
export interface ICategoryPayload {
  businessId: string;
  name: string;
  image: string;
  availability: boolean;
}

export interface IServiceCategory {
  _id: string;
  name: string;
  image: string;
  serviceIds: IService[];
}

interface UpdateServicePayload {
  name: string;
  businessId: string;
  availability: boolean;
  serviceId: string;
}

export interface IServicePayload {
  name: string;
  businessId: string;
  availability: boolean;
  categoryId: string;
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
    return data?.data || [];
  };

  const {
    isLoading: categoriesLoading,
    data: categoriesData,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["getServiceCategories", businessId],
    queryFn: fetchServiceCategories,
    enabled: !!businessId,
  });

  return { categoriesLoading, categoriesData, refetchCategories };
};
