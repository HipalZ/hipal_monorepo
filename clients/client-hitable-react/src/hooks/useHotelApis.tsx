import { useAlertsStore } from "@/components/store/useAlertStore";
import useBusinessData from "@/components/store/useBusinessData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useHotelStore } from "@/components/store/useHotelStore";
import type { Alert, Cart } from "@/components/types/hotelData";
import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
interface IHotelRoomData {
  businessId: string;
  roomName: string;
}

export const useGetAllRooms = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const getRooms = async () => {
    const response = await apiRpc.hotel.rooms.fetch_rooms.$get({
      query: { businessId },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      return res.data;
    }

    return [];
  };

  const {
    isLoading,
    data: allRooms,
    refetch: refetchRoomsData,
  } = useQuery({
    queryKey: ["allRooms", businessId],
    queryFn: getRooms,
    enabled: !!businessId,
  });
  return { isLoading, allRooms, refetchRoomsData };
};

export const useGetRoom = (roomId: string) => {
  const { setGuestName, setPhoneNumber, setRoomData } = useHotelStore();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const getRoom = async () => {
    const response = await apiRpc.hotel.rooms.fetch_room.$get({
      query: { businessId, roomId },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      setGuestName(res?.data?.userIds?.[0]?.name || "");
      setPhoneNumber(res?.data?.userIds?.[0]?.phone || "");
      setRoomData(res?.data || {});
      return res.data;
    }
  };
  return { getRoom };
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  const {
    roomData,
    setOpenRoomModal,
    guestName,
    phoneNumber,
    setGuestName,
    setPhoneNumber,
    selectedSource,
    setSelectedSource,
  } = useHotelStore();
  const checkIn = async () => {
    const response = await apiRpc.hotel.rooms.check_in.$post({
      json: {
        roomId: roomData._id,
        name: guestName,
        phone: phoneNumber,
        source: selectedSource,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      queryClient.invalidateQueries({
        queryKey: ["allRooms"],
      });
      toast.success("Guest registered successfully");
      setGuestName("");
      setPhoneNumber("");
      setSelectedSource("");
      setOpenRoomModal(false);
      return res.data;
    }
  };
  return { checkIn };
};

export const useCheckOut = () => {
  const {
    roomData,
    reviewUserIds,
    setOpenRoomModal,
    setReviewUserIds,
    setRoomData,
  } = useHotelStore();
  const queryClient = useQueryClient();
  const checkOut = async () => {
    const response = await apiRpc.hotel.rooms.check_out.$post({
      json: {
        roomId: roomData._id,
        userIds: reviewUserIds,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      queryClient.invalidateQueries({
        queryKey: ["allRooms"],
      });
      setReviewUserIds([]);
      setRoomData({});
      toast.success("Guest checked out successfully");
      setOpenRoomModal(false);
      return res.data;
    }
  };

  return { checkOut };
};

export const useRoomAlerts = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { tableId } = useParams();
  const userId = useHiClientZ((s) => s.captainData._id);
  const { setAlerts } = useAlertsStore();
  const { setHotelAlertsCount } = useHotelStore();

  const roomAlerts = async () => {
    const response = await apiRpc.hotel.alert.fetch_room_alerts.$get({
      query: { businessId, userId },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      setAlerts(res.data);
      setHotelAlertsCount(res.data.length);
      return res.data;
    }
    return [];
  };

  const enabled = Boolean(businessId && userId && !tableId);

  const { data: alerts, isPending } = useQuery({
    queryKey: ["roomAlerts", businessId, userId],
    queryFn: roomAlerts,
    enabled,
    refetchInterval: 11000,
  });

  return { alerts, isPending };
};

export const useAllServices = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const allServices = async () => {
    const response = await apiRpc.hotel.service.fetch_services.$get({
      query: {
        businessId,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      return res.data;
    }
  };

  const { data: services, isPending } = useQuery({
    queryKey: ["allServices", businessId],
    queryFn: allServices,
    enabled: !!businessId,
  });

  return { services, isPending };
};

export const useRespondAlerts = () => {
  const queryClient = useQueryClient();
  const userId = useHiClientZ((s) => s.captainData._id);

  const { mutateAsync: respondAlert } = useMutation({
    mutationFn: async ({
      alertId,
      action,
      reasonOfRejection,
    }: { alertId: string; action: string; reasonOfRejection: string }) => {
      const response = await apiRpc.hotel.alert.accept_alert.$post({
        json: {
          alertId,
          userId,
          action,
          reasonOfRejection,
        },
      });
      const res = await response.json();
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(res.message);
      }
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["roomAlerts"],
      });
    },
  });

  return { respondAlert };
};

export const useHistoryAlerts = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const userId = useHiClientZ((s) => s.captainData._id);
  const historyAlerts = async () => {
    const response = await apiRpc.hotel.alert.fetch_alert_history.$get({
      query: {
        businessId,
        userId,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      return res.data as Alert[];
    }
  };
  const { data: historyData, isPending } = useQuery({
    queryKey: ["historyAlerts", businessId, userId],
    queryFn: historyAlerts,
    enabled: !!businessId && !!userId,
  });

  return { historyData, isPending };
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
    refetchInterval: 5000,
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
      return response.json();
    },
    onSuccess: () => {
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
  const { mutateAsync: reviewChat, isPending: reviewingChat } = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiRpc.hotel.rooms.reviews.$post({
        json: payload,
      });
      return response.json();
    },
    onSuccess: () => {
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

export const useEscalatedAlerts = () => {
  const { setHotelEscalationCount, setEscalatedData } = useHotelStore();
  const captainData = useHiClientZ((s) => s.captainData);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const escalatedAlerts = async () => {
    const response = await apiRpc.hotel.alert.fetch_escalation_alerts.$get({
      query: {
        businessId,
        userId: captainData?._id,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      setEscalatedData(res.data);
      setHotelEscalationCount(res.data.length);
      return res.data;
    }
  };
  const isEnabled = Boolean(
    captainData &&
      captainData._id &&
      Array.isArray(captainData.customRole) &&
      captainData.customRole.length > 0 &&
      ["FRONT_OFFICE", "MANAGER"].includes(captainData.customRole[0]?.role),
  );

  useQuery({
    queryKey: ["escalatedAlerts"],
    queryFn: escalatedAlerts,
    enabled: isEnabled,
    refetchInterval: 13000,
  });
  return { escalatedAlerts };
};

type UpdateSourcePayload = {
  source: string;
  roomId: string;
};
export const useUpdateSource = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateSource } = useMutation({
    mutationFn: async (payload: UpdateSourcePayload) => {
      const response = await apiRpc.hotel.rooms.update_room_source.$put({
        json: payload,
      });
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed to update source");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allRooms"],
      });
      toast.success("Source updated successfully");
    },
    onError: () => {
      toast.error("Failed to update source");
    },
  });

  return { updateSource };
};

type EditAlertCartPayload = {
  alertId: string;
  cart: Cart[];
};

export const useEditAlertCart = () => {
  const editAlertCart = async (payload: EditAlertCartPayload) => {
    const response = await apiRpc.hotel.alert.edit_alert_cart.$put({
      json: payload,
    });
    return response.json();
  };
  const { mutateAsync: editCart, isPending: editingCart } = useMutation({
    mutationFn: editAlertCart,
    onSuccess: () => {
      toast.success("cart edited successfully");
    },
    onError: () => {
      toast.error("Failed to edit alert cart");
    },
  });

  return { editCart, editingCart };
};
