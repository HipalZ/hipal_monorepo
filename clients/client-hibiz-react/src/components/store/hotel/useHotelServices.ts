import { useError } from "@/components/store/useError";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export interface IService {
  _id: string;
  name: string;
  image: string;
  availability?: boolean;
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

export const useAddCategory = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: addCategoryLoader, mutateAsync: addCategory } =
    useMutation({
      mutationFn: async (payload: ICategoryPayload) => {
        const response = await apiRpc.hotel.service.add_category.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: (data) => {
        if (data.status === 400 || data.status === 401) {
          toast.error("Failed to update category");
        }
        if (data.status === 409) {
          setOpenErrorModal(true);
          setError("Category already exists");
          return toast.error("Category already exists");
        }
        if (data.status === 200 || data.status === 201) {
          toast.success("Category Created");
          queryClient.invalidateQueries({
            queryKey: ["getServiceCategories"],
          });
          return;
        }
      },
      onError: (data) => {
        console.log(data);
      },
    });

  return { addCategoryLoader, addCategory };
};

export const useAddService = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: addServiceLoader, mutateAsync: addService } = useMutation({
    mutationFn: async (payload: IServicePayload) => {
      const response = await apiRpc.hotel.service.add_service.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 400 || data.status === 401) {
        toast.error("Failed to update category");
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Service already exists");
        return toast.error("Service already exists");
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Category Created");
        queryClient.invalidateQueries({
          queryKey: ["getServiceCategories"],
        });
        return;
      }
    },
    onError: (data) => {
      console.log(data);
    },
  });

  return { addServiceLoader, addService };
};
