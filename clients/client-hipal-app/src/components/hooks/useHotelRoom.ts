import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { expelIfSessionOut } from "./sessionGuard";
import type { RoomChat } from "@/components/types/hotelTypes";

interface IHotelRoomData {
  businessId: string;
  roomName: string;
}

interface HotelRoomLookup {
  _id: string;
}

export const useHotelRoomData = () => {
  const { isPending: gettingRoomLoader, mutateAsync: roomPayload } =
    useMutation({
      mutationFn: async (payload: IHotelRoomData) => {
        const response = await apiRpc.hotel.rooms.fetch_room.$get({
          query: payload,
        });
        return response.json();
      },
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
    });

  return { gettingRoomLoader, roomPayload };
};

interface CreateAlertPayload {
  serviceIds: string[];
  businessId: string;
  userId: string;
  roomId: string;
  cart?: any;
}

export const useCreateAlert = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    isPending: creatingAlert,
    mutateAsync: createAlert,
    isError: alertError,
    isSuccess: alertSuccess,
  } = useMutation({
    mutationFn: async (payload: CreateAlertPayload) => {
      const response = await apiRpc.hotel.alert.create_alert.$post({
        json: payload,
      });
      if (expelIfSessionOut(response, router)) throw new Error("SESSION_OUT");
      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log("Alert created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["getChats"] });
    },
    onError: (error) => {
      console.error("Error creating alert:", error);
    },
  });

  return { creatingAlert, createAlert, alertError, alertSuccess };
};

interface EditGuestFoodOrderPayload {
  alertId: string;
  userId: string;
  cart: any[];
}

export const useEditGuestFoodOrder = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutateAsync: editGuestFoodOrder, isPending: editingGuestFoodOrder } =
    useMutation({
      mutationFn: async (payload: EditGuestFoodOrderPayload) => {
        const response = await (apiRpc.hotel.alert as any).guest_edit_alert_cart.$put({
          json: payload,
        });
        if (expelIfSessionOut(response, router)) throw new Error("SESSION_OUT");
        const result = await response.json();
        if (!response.ok || result?.err) {
          throw new Error(result?.message || "Unable to update order");
        }
        return result;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["getChats"] });
      },
    });

  return { editGuestFoodOrder, editingGuestFoodOrder };
};
export interface ILinkHotels {
  _id: string;
  name: string;
  customLink: string;
  logo: string;
}
export const useGetAllLinkRestautants = (businessId: string) => {
  const getLinkRestaurant = async () => {
    const response = await apiRpc.hotel.restaurant.fetch_hotel_restaurants.$get(
      {
        query: {
          businessId: businessId,
        },
      }
    );
    const res = await response.json();
    return res.data ?? ([] as ILinkHotels[]);
  };

  const { isLoading: fetchingRestaurants, data: restaurantData } = useQuery({
    queryKey: ["getAllLinkRestautants", businessId],
    queryFn: getLinkRestaurant,
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });

  return { fetchingRestaurants, restaurantData };
};

export const useGetAllChats = (
  payload: IHotelRoomData,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) => {
  const isEnabled = (options?.enabled ?? true) && !!payload.roomName;

  const getRoom = async (): Promise<HotelRoomLookup | null> => {
    if (!payload.businessId || !payload.roomName) return null;

    const roomResponse = await apiRpc.hotel.rooms.fetch_room.$get({
      query: payload,
    });
    if (!roomResponse.ok) return null;
    const roomData = await roomResponse.json();
    return (roomData?.data as HotelRoomLookup | undefined) ?? null;
  };

  const { data: roomData } = useQuery<HotelRoomLookup | null>({
    queryKey: ["hotelRoom", payload.businessId, payload.roomName],
    queryFn: getRoom,
    enabled: isEnabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  const roomId = roomData?._id;

  const getChats = async (): Promise<RoomChat[]> => {
    if (!roomId) return [];

    const response = await apiRpc.hotel.alert.room_chat.$get({
      query: {
        roomId,
      },
    });
    const res = await response.json();
    return (res.data as RoomChat[] | undefined) ?? [];
  };

  const { data: chatData = [] } = useQuery<RoomChat[]>({
    queryKey: ["getChats", payload.businessId, roomId],
    queryFn: getChats,
    enabled: isEnabled && !!roomId,
    refetchInterval: options?.refetchInterval ?? false,
  });

  return { chatData };
};

export const useSendChat = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: sendChat, isPending: sendingChat } = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiRpc.hotel.alert.chat_complain.$post({
        json: payload,
      });
      const result = await response.json();
      if (!response.ok || result?.err) {
        throw new Error(result?.message || "Unable to send complaint");
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["getChats"],
      });
    },
    onError: (error) => {
      console.error("Error sending chat:", error);
    },
  });

  return { sendChat, sendingChat };
};

export const useReviewChat = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutateAsync: reviewChat, isPending: reviewingChat } = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiRpc.hotel.rooms.reviews.$post({
        json: payload,
      });
      if (expelIfSessionOut(response, router)) throw new Error("SESSION_OUT");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["getChats"],
      });
    },
    onError: (error) => {
      console.error("Error reviewing chat:", error);
    },
  });

  return { reviewChat, reviewingChat };
};
