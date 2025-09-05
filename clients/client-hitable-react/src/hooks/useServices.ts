import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export interface IService {
  serviceIds?: {
    _id: string;
    name: string;
    availability: boolean;
  }[];
  _id: string;
  availability: boolean;
  name: string;
  businessId: string;
  categoryId: string;
}

export const useGetAllHotelServices = (businessId: string) => {
  if (!businessId) return;

  const getHotelServices = async () => {
    const response = await apiRpc.hotel.service.fetch_services.$get({
      query: {
        businessId: businessId,
      },
    });

    const result = await response.json();
    const hotelServices = result.data as IService[];
    return hotelServices ?? [];
  };

  const {
    isLoading,
    data: hotelServicesData,
    refetch,
  } = useQuery({
    queryKey: ["getAllHotelServices", businessId],
    queryFn: getHotelServices,
    enabled: !!businessId,
  });

  return { isLoading, hotelServicesData, refetch };
};
