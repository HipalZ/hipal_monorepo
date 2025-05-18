import { useError } from "@/components/store/useError";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface IService {
  _id: string;
  name: string;
  image: string;
  availability?: boolean;
}

interface IServiceCategory {
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

export const useUpdateHotelService = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: updateServiceLoading, mutateAsync: updateService } =
    useMutation({
      mutationFn: async (payload: UpdateServicePayload) => {
        const response = await apiRpc.hotel.service.edit_service.$put({
          json: payload,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData?.error?.message || "Failed to update service",
          );
        }

        return response;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["getServiceCategories", variables.businessId],
        });
      },
      onError: (error: Error) => {
        setError(error.message);
        setOpenErrorModal(true);
      },
    });

  return { updateServiceLoading, updateService };
};

interface IFetchEscalatedReports {
  businessId: string;
  pageNumber: number;
  timeStampStart: number;
  timeStampEnd: number;
}

export const useFetchEscalatedReports = (payload: IFetchEscalatedReports) => {
  const { businessId, pageNumber, timeStampStart, timeStampEnd } = payload;
  const fetchEscalatedReports = async () => {
    const response = await apiRpc.hotel.report.fetch_escalated_reports.$post({
      json: {
        businessId,
        page: pageNumber,
        limit: 20,
        from: timeStampStart,
        to: timeStampEnd,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || "Failed to fetch reports");
    }

    const data = await response.json();
    return data?.data || [];
  };

  const { isLoading: escalatedReportsLoading, data: escalationData } = useQuery(
    {
      queryKey: [
        "fetchEscalatedReports",
        businessId,
        pageNumber,
        timeStampStart,
        timeStampEnd,
      ],
      queryFn: fetchEscalatedReports,
      enabled:
        !!businessId && !!timeStampStart && !!timeStampEnd && !!pageNumber,
    },
  );

  return { escalatedReportsLoading, escalationData };
};
