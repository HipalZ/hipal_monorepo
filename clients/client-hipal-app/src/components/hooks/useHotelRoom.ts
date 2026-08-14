import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { expelIfSessionOut } from "./sessionGuard";

interface IHotelRoomData {
  businessId: string;
  roomName: string;
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
    },
    onError: (error) => {
      console.error("Error creating alert:", error);
    },
  });

  return { creatingAlert, createAlert, alertError, alertSuccess };
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
      },
    );
    const res = await response.json();
    return res.data ?? ([] as ILinkHotels[]);
  };

  const { isLoading: fetchingRestaurants, data: restaurantData } = useQuery({
    queryKey: ["getAllLinkRestautants", businessId],
    queryFn: getLinkRestaurant,
    enabled: !!businessId,
  });

  return { fetchingRestaurants, restaurantData };
};

export const useGetAllChats = (payload: IHotelRoomData) => {
  const getChats = async () => {
    const roomResponse = await apiRpc.hotel.rooms.fetch_room.$get({
      query: payload,
    });
    if (!roomResponse.ok) return [];
    const roomData = await roomResponse.json();
    const response = await apiRpc.hotel.alert.room_chat.$get({
      query: {
        roomId: roomData?.data?._id,
      },
    });
    const res = await response.json();
    return res.data;
  };

  const { data: chatData } = useQuery({
    queryKey: ["getChats", payload],
    queryFn: getChats,
    enabled: !!payload.roomName,
    refetchInterval: 10000,
  });

  return { chatData };
};

export const useSendChat = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutateAsync: sendChat, isPending: sendingChat } = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiRpc.hotel.alert.chat_complain.$post({
        json: payload,
      });
      if (expelIfSessionOut(response, router)) throw new Error("SESSION_OUT");
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
