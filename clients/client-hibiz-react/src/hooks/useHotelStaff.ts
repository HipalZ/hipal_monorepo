import type { IService } from "@/components/store/hotel/useHotelStaff";
import useStaffStore, {
  useStaffDataStore,
} from "@/components/store/hotel/useHotelStaff";
import { useError } from "@/components/store/useError";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

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
export interface IHotelStaffCustomRolePermissions {
  normal_settle: boolean;
  force_settle: boolean;
  resolve_table: boolean;
  free_table: boolean;
  sale_summary: boolean;
  bill: boolean;
  order_accept: boolean;
  place_order: boolean;
  offline_settle: boolean;
}

export interface IHotelStaffCustomRole {
  _id: string;
  businessId: string;
  role: IHotelRoll;
  permissions: IHotelStaffCustomRolePermissions;
  permissionGroupIds: string[];
  permissionIds: string[];
  bookMark: boolean;
  isDeleted: boolean;
  serviceIds: string[];
}

export interface IHotelStaff {
  _id: string;
  name: string;
  phone: string;
  customRole: IHotelStaffCustomRole[];
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
    queryKey: ["getAllHotelStaffRoles", businessId || "default"],
    queryFn: getHotelRoles,
    enabled: !!businessId,
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

export const useGetCatServices = (businessId: string) => {
  if (!businessId) return { hotelServicesData: [] };

  const getCatServices = async () => {
    const response = await apiRpc.hotel.service.fetch_service_category.$get({
      query: {
        businessId,
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
    queryKey: ["getCatServices", businessId],
    queryFn: getCatServices,
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

export const useDeleteStaffFromHotel = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const businessId = useParams().hotelId;
  const { isPending: deleteStaffLoader, mutateAsync: deleteStaff } =
    useMutation({
      mutationFn: async (staffId: string) => {
        const response = await apiRpc.hotel.staff.delete_staff.$delete({
          json: {
            staffId,
            businessId: businessId as string,
          },
        });
        return response;
      },
      onSuccess: (data) => {
        if (data.status === 400 || data.status === 401) {
          toast.error("Failed to delete staff");
        }
        if (data.status === 409) {
          setOpenErrorModal(true);
          setError("Staff already exists");
          return toast.error("Staff already exists");
        }
        if (data.status === 200 || data.status === 201) {
          queryClient.invalidateQueries({
            queryKey: ["getAllHotelStaff", businessId],
          });
          toast.success("Staff deleted successfully");
          return;
        }
      },
      onError: (data) => {
        console.log(data);
      },
    });

  return { deleteStaffLoader, deleteStaff };
};

export type Levels = 1 | 2 | 3;

export interface IStaffHotelLevel {
  _id: string;
  name: string;
  phone: string;
}
export interface IHotelStaffLevel {
  _id: string;
  level: Levels;
  nextLevelTime: number;
  staffIds: IStaffHotelLevel[];
  businessId: string;
}

export const useFetchLevels = () => {
  const businessId = useParams<string>().hotelId;
  if (!businessId) return { gettingLevels: false, levelsData: [] };
  const gettingLevelsData = async () => {
    const response = await apiRpc.hotel.staff_level.fetch_levels.$get({
      query: {
        businessId: businessId || "",
      },
    });
    const res = await response.json();
    const levels = (res?.data as IHotelStaffLevel[]) || [];
    return levels;
  };

  const { isLoading: gettingLevels, data: levelsData } = useQuery({
    queryKey: ["getHotelStaffLevels", businessId],
    queryFn: gettingLevelsData,
    enabled: !!businessId,
  });

  return { gettingLevels, levelsData };
};

export interface IStaffAddingToLevelPayload {
  staffIds: string[];
  businessId: string;
  level: Levels;
  nextLevelTime: number;
}

export const useSaveStaffToLevel = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: saveStaffLoader, mutateAsync: saveStaff } = useMutation({
    mutationFn: async (payload: IStaffAddingToLevelPayload) => {
      const response = await apiRpc.hotel.staff_level.add_level.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        toast.error("Failed to add staff to level");
      }
      if (data.status === 409) {
        setOpenErrorModal(true);
        setError("Staff already exists");
        return toast.error("Staff already exists");
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["getHotelStaffLevels", variables.businessId],
        });
        toast.success("Staff added to level successfully");
        return;
      }
    },
    onError: (data) => {
      console.log(data);
    },
  });

  return { saveStaffLoader, saveStaff };
};

interface IStaffRemoveFromLevel {
  staffIds: string[];
  levelId: string;
}

export const useRemoveStaffFromLevel = () => {
  const { setError, setOpenErrorModal } = useError();
  const businessId = useParams<string>().hotelId;
  const queryClient = useQueryClient();
  const { isPending: removeStaffLoader, mutateAsync: removeStaff } =
    useMutation({
      mutationFn: async (payload: IStaffRemoveFromLevel) => {
        const response = await apiRpc.hotel.staff_level.remove_staff.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: (data) => {
        if (data.status === 400 || data.status === 401) {
          toast.error("Failed to remove staff from level");
        }
        if (data.status === 409) {
          setOpenErrorModal(true);
          setError("Staff already exists");
          return toast.error("Staff already exists");
        }
        if (data.status === 200 || data.status === 201) {
          queryClient.invalidateQueries({
            queryKey: ["getHotelStaffLevels", businessId],
          });
          toast.success("Staff removed from level successfully");
          return;
        }
      },
      onError: (data) => {
        console.log(data);
      },
    });

  return { removeStaffLoader, removeStaff };
};

export interface IStaffUpdateLevel {
  staffIds?: string[];
  levelId: string;
  nextLevelTime?: number;
  businessId: string;
}

export const useUpdateStaffToHotelLevel = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: updateStaffLoader, mutateAsync: updateStaffToLevel } =
    useMutation({
      mutationFn: async (payload: IStaffUpdateLevel) => {
        const response = await apiRpc.hotel.staff_level.update_level.$put({
          json: payload,
        });
        return response;
      },
      onSuccess: (data, variables) => {
        if (data.status === 400 || data.status === 401) {
          toast.error("Failed to update staff level");
        }
        if (data.status === 409) {
          setOpenErrorModal(true);
          setError("Staff already exists");
          return toast.error("Staff already exists");
        }
        if (data.status === 200 || data.status === 201) {
          queryClient.invalidateQueries({
            queryKey: ["getHotelStaffLevels", variables.businessId],
          });
          toast.success("Staff level updated successfully");
          return;
        }
      },
      onError: (data) => {
        console.log(data);
      },
    });

  return { updateStaffLoader, updateStaffToLevel };
};
