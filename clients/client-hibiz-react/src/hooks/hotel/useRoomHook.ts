import { useRoomStore } from "@/components/store/hotel/useRoomStore";
import { useError } from "@/components/store/useError";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useRoomFormStore from "@/components/store/hotel/useRoomFormStore";


export const roomTypeEnum = [
    "SINGLE",
    "DOUBLE",
    "TRIPLE",
    "QUAD",
    "SUITE",
    "DELUXE",
] as const;

export type RoomType = typeof roomTypeEnum[number];

export const hotelStatusEnum = [
    "AVAILABLE",
    "BOOKED",
    "OCCUPIED",
    "MAINTENANCE",
    "CLEANING",
    "RESERVED",
    "BLOCKED",
] as const;

export type HotelStatusEnumType = (typeof hotelStatusEnum)[number];

export interface IHotelRoom {
    _id: string,
    businessId: string,
    availability: boolean,
    name: string,
    tax: number,
    zoneId: string,
    roomType: RoomType,
    pricePerNight: number,
    capacity: number,
    amenities: string[],
    roomStatus: HotelStatusEnumType,
    date: string,
    staffIds: string[],
    authCode: string,
    rating: number,
    size: number,
    description: string,
    images: string[],
    downloadlink: string,
    userIds: string[],
    slug: string,
}

export const useGetAllHotelRooms = (businessId: string) => {
    if (!businessId) return;

    const { setRoomData } = useRoomStore(s => ({
        setRoomData: s.setRoomData
    }))

    const getHotelRooms = async () => {
        const response = await apiRpc.hotel.rooms.fetch_rooms.$get({
            query: {
                businessId: businessId
            }
        })

        const result = await response.json();
        const hotelRooms = result.data ?? [] as IHotelRoom[];
        setRoomData(hotelRooms)
        return hotelRooms ?? [];
    }

    const { isLoading: roomLoading, data: hotelRoomsData, refetch } = useQuery({
        queryKey: ["getAllHotelRooms", businessId],
        queryFn: getHotelRooms,
        enabled: !!businessId,
    })

    return { roomLoading, hotelRoomsData, refetch }
}

export interface IHotelRoomPayload {
    businessId: string,
    availability: boolean,
    name: string,
    tax: number,
    zoneId: string,
    roomType: RoomType,
    pricePerNight: number,
    capacity: number,
    amenities: string[],
    staffIds: string[],
    size: number,
    description: string,
    images: string[],
    userIds: string[],
    roomId?: string,
}

export const useCreateHotelRoom = () => {
    const { setError, setOpenErrorModal } = useError()
    const queryClient = useQueryClient()
    const { resetForm } = useRoomFormStore((state) => ({
        resetForm: state.resetForm,
    }))
    const { setOpenAddRoomModal } = useRoomStore((state) => ({
        setOpenAddRoomModal: state.setOpenAddRoomModal
    }))

    const { isPending: createRoomLoader, mutateAsync: createRoom } = useMutation({
        mutationFn: async (payload: IHotelRoomPayload) => {
            const response = await apiRpc.hotel.rooms.$post({
                json: payload
            })
            return response
        },
        onSuccess: (data, variables) => {
            if (data.status === 400 || data.status === 401) {
                setError(data.message || "Failed to add room")
                setOpenErrorModal(true)
                return toast.error("Failed to add room")
            }
            if (data.status === 409) {
                setError(data.message || "Room already exists")
                setOpenErrorModal(true)
                return toast.error("Room already exists")
            }
            if (data.status === 200 || data.status === 201) {
                resetForm()
                setOpenAddRoomModal(false)
                queryClient.invalidateQueries({ queryKey: ["getAllHotelRooms", variables.businessId] })
                return toast.success("Room added successfully")
            }
        },
        onError: (error) => {
            setError(error.message)
            setOpenErrorModal(true)
        },
    })

    return { createRoomLoader, createRoom }

}

export const useUpdateHotelRoom = () => {
    const { setError, setOpenErrorModal } = useError()
    const queryClient = useQueryClient()

    const { resetForm } = useRoomFormStore((state) => ({
        resetForm: state.resetForm,
    }))
    const { setOpenAddRoomModal } = useRoomStore((state) => ({
        setOpenAddRoomModal: state.setOpenAddRoomModal
    }))

    const { isPending: updateRoomLoader, mutateAsync: updateRoom } = useMutation({
        mutationFn: async (payload: IHotelRoomPayload) => {
            const response = await apiRpc.hotel.rooms.$put({
                json: payload
            })
            const res = await response.json()
            if (!response.ok) {
                throw new Error(res.message || `HTTP error! Status: ${response.status}`);
            }
            return response
        },
        onSuccess: (data, variables) => {
            if (data.status === 200 || data.status === 201) {
                resetForm()
                setOpenAddRoomModal(false)
                queryClient.invalidateQueries({ queryKey: ["getAllHotelRooms", variables.businessId] })
                return toast.success("Room updated successfully")
            }
        },
        onError: (error) => {
            console.log(error)
            setError(error.message)
            setOpenErrorModal(true)
        },
    })

    return { updateRoomLoader, updateRoom }

}