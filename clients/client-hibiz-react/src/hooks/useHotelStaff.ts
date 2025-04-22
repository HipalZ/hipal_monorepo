import type { IService } from "@/components/store/hotel/useHotelStaff";
import useStaffStore, {
  useStaffDataStore,
} from "@/components/store/hotel/useHotelStaff";
import { useError } from "@/components/store/useError";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type IHotelRoll =
  | ""
  | "MANAGER"
  | "RECEPTIONIST"
  | "HOUSEKEEPING"
  | "MAINTENANCE"
  | "SECURITY"
  | "FRONT_OFFICE"
  | "CLEANER"
  | "WAITER"
  | "LAUNDRY"
  | "KITCHEN"
  | "ELECTRICIAN"
  | "PLUMBER";

export interface IHotelStaff {
  _id: string;
  name: string;
  phone: string;
  customRole: {
    businessId: string;
    nickName: string;
    role: IHotelRoll;
    _id: string;
  }[];
}

export const useGetAllHotelStaff = (businessId: string) => {
  if (!businessId) return;

  const { setStaffData } = useStaffDataStore();

  const getHotelUsers = async (): Promise<IHotelStaff[]> => {
    const response = await apiRpc.hotel.staff.fetch_staffs.$get({
      query: {
        businessId: businessId,
      },
    });

    const res = await response.json();
    const hotelStaff = res?.data ?? ([] as IHotelStaff[]);
    setStaffData(hotelStaff);
    return hotelStaff ?? ([] as IHotelStaff[]);
  };

  const {
    isLoading: staffLoading,
    data: staffData,
    refetch,
  } = useQuery({
    queryKey: ["getAllHotelStaff", businessId],
    queryFn: getHotelUsers,
    enabled: !!businessId,
    refetchOnWindowFocus: false,
  });

  return { staffLoading, staffData, refetch };
};

export interface IHotel_Roll {
  _id: string;
  businessId: string;
  role: IHotelRoll;
  nickName: string;
}
[];

export const useGetAllHotelStaffRoles = (businessId: string) => {
  const getHotelRoles = async () => {
    if (!businessId) return []; // Handle early return inside the query function
    const response = await apiRpc.hotel.staff.fetch_roles.$get({
      query: {
        businessId: businessId,
      },
    });
    const result = await response.json();
    const hotelRoles = result.data as IHotel_Roll[] | undefined;
    return hotelRoles ?? [];
  };

  const {
    isLoading,
    data: hotelRolesData,
    refetch,
  } = useQuery({
    queryKey: ["getAllHotelStaffRoles", businessId || "default"], // Use a fallback key
    queryFn: getHotelRoles,
    enabled: !!businessId, // Ensure the query runs only when businessId is valid
  });

  return { isLoading, hotelRolesData, refetch };
};

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

export interface IHotelStaffPayload {
  name: string;
  phone: string;
  password?: string;
  nickName: string;
  services: string[];
  role: IHotelRoll;
  businessId: string;
  editId?: string;
  staffId?: string;
}

export const useAddStaffToHotel = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { resetForm, setStaffModal } = useStaffStore();
  const { isPending: addStaffLoader, mutateAsync: addStaff } = useMutation({
    mutationFn: async (payload: IHotelStaffPayload) => {
      const response = await apiRpc.hotel.staff.add_staff.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        toast.error("Failed to add staff");
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Staff already exists");
        return toast.error("Staff already exists");
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["getAllHotelStaff", variables.businessId],
        });
        resetForm();
        setStaffModal(false);
        return;
      }
      toast.success("Staff added successfully");
    },
    onError: (data) => {
      console.log(data);
    },
  });

  return { addStaffLoader, addStaff };
};

export const useUpdateStaffToHotel = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { resetForm, setStaffModal } = useStaffStore();
  const { isPending: updateStaffLoader, mutateAsync: updateStaff } =
    useMutation({
      mutationFn: async (payload: IHotelStaffPayload) => {
        const response = await apiRpc.hotel.staff.edit_staff.$put({
          json: payload,
        });
        return response;
      },
      onSuccess: (data, variables) => {
        if (data.status === 400 || data.status === 401) {
          toast.error("Failed to update staff");
        }
        if (data.status === 409) {
          setOpenErrorModal(true);
          setError("Staff already exists");
          return toast.error("Staff already exists");
        }
        if (data.status === 200 || data.status === 201) {
          queryClient.invalidateQueries({
            queryKey: ["getAllHotelStaff", variables.businessId],
          });
          resetForm();
          setStaffModal(false);
          return;
        }
        toast.success("Staff updated successfully");
      },
      onError: (data) => {
        console.log(data);
      },
    });

  return { updateStaffLoader, updateStaff };
};
