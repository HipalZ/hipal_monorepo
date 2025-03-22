import { useAlertsStore } from "@/components/store/useAlertStore"
import useBusinessData from "@/components/store/useBusinessData"
import { useHiClientZ } from "@/components/store/useHiClientzData"
import { useHotelStore } from "@/components/store/useHotelStore"
import type { Alert, AlertProgress } from "@/components/types/hotelData"
import { apiRpc } from "@hi/common"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
interface IHotelRoomData {
  businessId: string;
  roomName: string;
}

export const useGetAllRooms = () => {
    const businessId = useBusinessData((s) => s.outletInfo?.businessId)
    const getRooms = async () => {
        const response = await apiRpc.hotel.rooms.fetch_rooms.$get({
            query: { businessId },
        })
        const res = await response.json()
        if (response.status === 200 || response.status === 201) {
            return res.data
        }

        return []
    }

    const { isLoading, data: allRooms } = useQuery({
        queryKey: ["allRooms", businessId],
        queryFn: getRooms,
        enabled: !!businessId,
    })
    return { isLoading, allRooms }
}

export const useCheckIn = () => {
    const queryClient = useQueryClient()
    const { roomData, setOpenRoomModal, guestName, phoneNumber, setGuestName, setPhoneNumber } = useHotelStore();
    const checkIn = async () => {
        const response = await apiRpc.hotel.rooms.check_in.$post({
            json: {
                roomId: roomData._id,
                name: guestName,
                phone: phoneNumber,
            }
        })
        const res = await response.json()
        if (response.status === 200 || response.status === 201) {
            queryClient.invalidateQueries({
                queryKey: ["allRooms"],
            })
            toast.success("Guest registered successfully")
            setGuestName("")
            setPhoneNumber("")
            setOpenRoomModal(false)
            return res.data
        }
    }
    return { checkIn }
}

export const useCheckOut = () => {
    const { roomData, reviewUserIds, setOpenRoomModal, setReviewUserIds, setRoomData } = useHotelStore();
    const queryClient = useQueryClient()
    const checkOut = async () => {
        const response = await apiRpc.hotel.rooms.check_out.$post({
            json: {
                roomId: roomData._id,
                userIds: reviewUserIds
            }
        })
        const res = await response.json()
        if (response.status === 200 || response.status === 201) {
            queryClient.invalidateQueries({
                queryKey: ["allRooms"],
            })
            setReviewUserIds([])
            setRoomData({})
            toast.success("Guest checked out successfully")
            setOpenRoomModal(false)
            return res.data
        }
    }

    return { checkOut }
}

export const useRoomAlerts = () => {
    const businessId = useBusinessData((s) => s.outletInfo?.businessId)
    const userId = useHiClientZ((s) => s.captainData._id)
    const { setAlerts } = useAlertsStore()
    const {setHotelAlertsCount} = useHotelStore()
    const roomAlerts = async () => {
        const response = await apiRpc.hotel.alert.fetch_room_alerts.$get({
            query: {
                businessId,
                userId,
            }
        })
        const res = await response.json()
        if (response.status === 200 || response.status === 201) {
            setAlerts(res.data)
            setHotelAlertsCount(res.data.length)
            return res.data
        }
    }

    const { data: alerts, isPending } = useQuery({
        queryKey: ["roomAlerts", businessId, userId],
        queryFn: roomAlerts,
        enabled: !!businessId && !!userId,
        refetchInterval: 5000,
    })

    return { alerts, isPending }
}

export const useAllServices = () => {
    const businessId = useBusinessData((s) => s.outletInfo?.businessId)
    const allServices = async () => {
        const response = await apiRpc.hotel.service.fetch_services.$get({
            query: {
                businessId
            }
        })
        const res = await response.json()
        if (response.status === 200 || response.status === 201) {
            return res.data
        }
    }

    const { data: services, isPending } = useQuery({
        queryKey: ["allServices", businessId],
        queryFn: allServices,
        enabled: !!businessId,
    })

    return { services, isPending }
}

export const useRespondAlerts = () => {
    const queryClient = useQueryClient()
    const userId = useHiClientZ((s) => s.captainData._id)
    const respondAlert = async ({ alertId, action }: { alertId: string, action: AlertProgress }) => {
        const response = await apiRpc.hotel.alert.accept_alert.$post({
            json: {
                alertId,
                userId,
                action,
            }
        })
        const res = await response.json()
        if (response.status === 200 || response.status === 201) {
            queryClient.invalidateQueries({
                queryKey: ["roomAlerts"],
            })
            return res.data
        }
    }

    return { respondAlert }
}

export const useHistoryAlerts = () => {
    const businessId = useBusinessData((s) => s.outletInfo?.businessId)
    const userId = useHiClientZ((s) => s.captainData._id)
    const historyAlerts = async () => {
        const response = await apiRpc.hotel.alert.fetch_alert_history.$get({
            query: {
                businessId,
                userId,
            }
        })
        const res = await response.json()
        if (response.status === 200 || response.status === 201) {
            return res.data as Alert[]
        }
    }
    const { data: historyData, isPending } = useQuery({
        queryKey: ["historyAlerts", businessId, userId],
        queryFn: historyAlerts,
        enabled: !!businessId && !!userId,
    })

    return { historyData, isPending }
}

export const useGetAllChats = (payload:IHotelRoomData) => {
    const getChats = async () => {
      const roomResponse = await apiRpc.hotel.rooms.fetch_room.$get({
        query: payload,
      });
      if(!roomResponse.ok) return []
      const roomData = await roomResponse.json();
      const response = await apiRpc.hotel.alert.room_chat.$get({
        query: {
          roomId:roomData?.data?._id,
        },
      });
      const res = await response.json();
      return res.data;
    };
  
    const {data:chatData} = useQuery({
      queryKey: ["getChats", payload],
      queryFn: getChats,
      enabled: !!payload.roomName,
      refetchInterval: 10000,
    }) 
  
    return  { chatData }
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
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey:["getChats"]
        });
      },
      onError: (error) => {
        console.error("Error sending chat:", error);
      },
    });
  
    return { sendChat, sendingChat };
  }
  
  export const useReviewChat = () => {
    const queryClient = useQueryClient();
    const { mutateAsync: reviewChat, isPending: reviewingChat } = useMutation({
      mutationFn: async (payload: any) => {
        const response = await apiRpc.hotel.rooms.reviews.$post({
          json: payload,
        });
        return response.json();
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey:["getChats"]
        });
      },
      onError: (error) => {
        console.error("Error reviewing chat:", error);
      },
    });
  
    return { reviewChat, reviewingChat };
  }