import { useAlertsStore } from '@/components/store/useAlertStore';
import useBusinessData from '@/components/store/useBusinessData';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useHotelStore } from '@/components/store/useHotelStore';
import useTimings from '@/components/store/useTimings';
import type { Alert, Cart } from '@/components/types/hotelData';
import { apiRpc } from '@hi/common';
import { useMutation, useQuery, useQueryClient, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useError } from '../components/store/useError';
import { playSelectedNotificationSound } from '@/utils/notificationSound';
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
    queryKey: ['allRooms', businessId],
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
      setGuestName(res?.data?.userIds?.[0]?.name || '');
      setPhoneNumber(res?.data?.userIds?.[0]?.phone || '');
      setRoomData(res?.data || {});
      return res.data;
    }
  };
  return { getRoom };
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  const { roomData, setOpenRoomModal, guestName, phoneNumber, setGuestName, setPhoneNumber, selectedSource, setSelectedSource } = useHotelStore();
  const checkIn = async () => {
    const response = await apiRpc.hotel.rooms.check_in.$post({
      json: {
        roomId: roomData._id,
        name: guestName,
        phone: phoneNumber,
        ...(selectedSource && { source: selectedSource }),
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      queryClient.invalidateQueries({
        queryKey: ['allRooms'],
      });
      toast.success('Guest registered successfully');
      setGuestName('');
      setPhoneNumber('');
      setSelectedSource('');
      setOpenRoomModal(false);
      return res.data;
    }
  };
  return { checkIn };
};

export const useCheckOut = () => {
  const { roomData, reviewUserIds, setOpenRoomModal, setReviewUserIds, setRoomData } = useHotelStore();
  const staffUserId = useHiClientZ((s) => s.captainData?._id);
  const queryClient = useQueryClient();
  const checkOut = async () => {
    // check_out now raises the configured turnover services itself, in the same
    // round-trip — no separate /trigger call, so the room can't flash
    // "available" before the cleaning overlay catches up. triggeredBy attributes
    // those tasks to the front-office staffer who did the checkout.
    const response = await apiRpc.hotel.rooms.check_out.$post({
      json: {
        roomId: roomData._id,
        userIds: reviewUserIds,
        triggeredBy: staffUserId,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      queryClient.invalidateQueries({ queryKey: ['allRooms'] });
      setReviewUserIds([]);
      setRoomData({});
      toast.success('Guest checked out successfully');
      setOpenRoomModal(false);
      // The server already raised any turnover tasks; refresh both feeds so the
      // room turns "Cleaning" and the staff task list updates now, rather than
      // waiting for the 30s poll.
      queryClient.invalidateQueries({ queryKey: ['checkoutTasks'] });
      queryClient.invalidateQueries({ queryKey: ['checkoutTasksActive'] });
      return res.data;
    }
    if (response.status === 400) {
      toast.error(res?.message);
    }
  };

  return { checkOut };
};

export type UseRoomAlertsResult = UseQueryResult<Alert[], unknown> & {
  roomAlerts: () => Promise<Alert[]>;
};

/**
 * Play alert sound via Web Audio API.
 * Used as fallback when FCM push notification sound doesn't work,
 * or when device doesn't support FCM at all (no Google Play Services).
 */
export const useRoomAlerts = (): UseRoomAlertsResult => {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  const isHotel = outletType === 'HOTEL';

  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const userId = useHiClientZ((s) => s.captainData?._id);
  const pushToken = useHiClientZ((s) => s.pushToken);

  const { setAlerts } = useAlertsStore();
  const { setHotelAlertsCount } = useHotelStore();

  // Track previous alert count to detect new alerts
  const prevCountRef = useRef(0);

  const roomAlerts = async (): Promise<Alert[]> => {
    if (!businessId || !userId) return [];
    const response = await apiRpc.hotel.alert.fetch_room_alerts.$get({
      query: { businessId, userId },
    });

    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      const data: Alert[] = res?.data ?? [];
      setAlerts(data);
      setHotelAlertsCount(data.length);

      // If no push token (FCM not working) and new alerts appeared, play sound
      if (!pushToken && data.length > prevCountRef.current && prevCountRef.current > 0) {
        playSelectedNotificationSound();
      }
      prevCountRef.current = data.length;

      return data;
    }
    return [];
  };

  const query = useQuery<Alert[], unknown>({
    queryKey: ['roomAlerts', businessId, userId],
    queryFn: roomAlerts,
    enabled: isHotel && !!businessId && !!userId,
    refetchInterval: 11_000,
  });

  return { ...query };
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
    queryKey: ['allServices', businessId],
    queryFn: allServices,
    enabled: !!businessId,
  });

  return { services, isPending };
};

export const useRespondAlerts = () => {
  const queryClient = useQueryClient();
  const userId = useHiClientZ((s) => s.captainData._id);

  const { mutateAsync: respondAlert } = useMutation({
    mutationFn: async ({ alertId, action, reasonOfRejection }: { alertId: string; action: string; reasonOfRejection: string }) => {
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
        queryKey: ['roomAlerts'],
      });
    },
  });

  return { respondAlert };
};

export const useDismissMessageAlert = () => {
  const queryClient = useQueryClient();
  const userId = useHiClientZ((s) => s.captainData._id);

  const { mutateAsync: dismissAlert, isPending } = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await apiRpc.hotel.alert.dismiss_message_alert.$post({
        json: { alertId, userId },
      });
      const res = await response.json();
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomAlerts'] });
    },
  });

  return { dismissAlert, isDismissing: isPending };
};

export const useAcknowledgeWakeUpAlert = () => {
  const queryClient = useQueryClient();
  const userId = useHiClientZ((s) => s.captainData._id);

  const { mutateAsync: acknowledgeWakeUpAlert, isPending } = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await apiRpc.hotel.alert.acknowledge_wake_up_alert.$post({
        json: { alertId, userId },
      });
      const res = await response.json();
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomAlerts'] });
    },
  });

  return { acknowledgeWakeUpAlert, isAcknowledgingWakeUp: isPending };
};

export const useHistoryAlerts = () => {
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const userId = useHiClientZ((s) => s.captainData._id);
  const historyAlerts = async () => {
    const response = await apiRpc.hotel.alert.fetch_alert_history.$get({
      query: {
        businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
        userId,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      return res.data as Alert[];
    }
  };
  const { data: historyData, isPending } = useQuery({
    queryKey: ['historyAlerts', businessId, userId, timeStampStart, timeStampEnd],
    queryFn: historyAlerts,
    enabled: !!businessId && !!userId && !!timeStampStart && !!timeStampEnd,
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
    queryKey: ['getChats', payload],
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
        queryKey: ['getChats'],
      });
    },
    onError: (error) => {
      console.error('Error sending chat:', error);
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
        queryKey: ['getChats'],
      });
    },
    onError: (error) => {
      console.error('Error reviewing chat:', error);
    },
  });

  return { reviewChat, reviewingChat };
};

export const useEscalatedAlerts = () => {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  const { setHotelEscalationCount, setEscalatedData } = useHotelStore();
  const captainData = useHiClientZ((s) => s.captainData);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const customRoles = captainData?.customRole ?? [];

  const roleName = useMemo(() => {
    const match = customRoles.find((r) => String(r?.businessId) === String(businessId));
    return (match?.role ?? '').toString().trim().toUpperCase();
  }, [customRoles, businessId]);

  const escalatedAlerts = async () => {
    if (!businessId || !captainData?._id) return [];

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

    return [];
  };

  const roleNamesAllowed = ['MANAGER', 'FRONT_OFFICE'];

  const isEnabled = outletType === 'HOTEL' && Boolean(businessId && captainData?._id) && roleNamesAllowed.includes(roleName);

  useQuery({
    queryKey: ['escalatedAlerts'],
    queryFn: escalatedAlerts,
    enabled: isEnabled,
    refetchInterval: 13000,
  });
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
        throw new Error('Failed to update source');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['allRooms'],
      });
      toast.success('Source updated successfully');
    },
    onError: () => {
      toast.error('Failed to update source');
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
      toast.success('cart edited successfully');
    },
    onError: () => {
      toast.error('Failed to edit alert cart');
    },
  });

  return { editCart, editingCart };
};

interface CreateAlertPayload {
  serviceIds: string[];
  businessId: string;
  userId: string;
  roomId: string;
  cart?: any;
  /** Staff who raised it on the guest's behalf; omitted when the guest self-raises. */
  raisedByStaff?: string;
}

export const useCreateAlert = () => {
  const { setError, setOpenErrorModal } = useError();
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
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || 'Failed to split bill');
        setOpenErrorModal(true);
        return;
      }
    },
    onError: (error) => {
      console.error('Error creating alert:', error);
      setError(error.message || 'Something went wrong.');
      setOpenErrorModal(true);
    },
  });

  return { creatingAlert, createAlert, alertError, alertSuccess };
};
