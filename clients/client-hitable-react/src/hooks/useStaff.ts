import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

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


  const getHotelUsers = async (): Promise<IHotelStaff[]> => {
    const response = await apiRpc.hotel.staff.fetch_staffs.$get({
      query: {
        businessId: businessId,
      },
    });

    const res = await response.json();
    const hotelStaff = res?.data ?? ([] as IHotelStaff[]);
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