import { apiRpc } from "@hi/common"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useError } from "@/components/store/useError"
import type { RoomTypeEnum } from "@/components/store/hotel/useRoomTypeStore"
import { useRoomStore } from "@/components/store/hotel/useRoomStore"
import toast from "react-hot-toast"

export interface IRoomType {
    _id: string
    businessId: string
    roomType: RoomTypeEnum
    description?: string
    pricePerNight: number
    size: string
    capacity: number
    images?: string[]
    roomIds?: string[]
    createdAt: string
    updatedAt: string
    downLoadLink?: string
}

interface CreateRoomTypePayload {
    businessId: string
    roomType: RoomTypeEnum
    description?: string
    pricePerNight: number
    size: string
    capacity: number
    images?: string[]
}

interface UpdateRoomTypePayload extends CreateRoomTypePayload {
    roomTypeId: string
}

// Get all room types for a hotel
export const useGetAllRoomTypes = (businessId?: string) => {

    const { setRoomType } = useRoomStore(s => ({
        setRoomType: s.setRoomType
    }))

    const fetchRoomTypes = async (): Promise<IRoomType[]> => {
        if (!businessId) return []

        const response = await apiRpc.hotel.room_type.fetch_room_types.$get({
            query: {
                businessId,
            },
        })

        const data = await response.json()
        const roomTypes = data?.data || []
        setRoomType(roomTypes)
        return roomTypes || []
    }

    const {
        isLoading: roomTypesLoading,
        data: roomTypesData,
        refetch: refetchRoomTypes,
    } = useQuery({
        queryKey: ["getAllRoomTypes", businessId],
        queryFn: fetchRoomTypes,
        enabled: !!businessId,
    })

    return { roomTypesLoading, roomTypesData, refetchRoomTypes }
}

// Create a new room type
export const useCreateRoomType = () => {
    const { setError, setOpenErrorModal } = useError()
    const queryClient = useQueryClient()

    const { isPending: createRoomTypeLoading, mutateAsync: createRoomType } = useMutation({
        mutationFn: async (payload: CreateRoomTypePayload) => {
            const response = await apiRpc.hotel.room_type.add_room_type.$post({
                json: payload,
            })
            return response
        },
        onSuccess: (data, variables) => {
            if (data.status === 400 || data.status === 401) {
                setError(data.message || "Failed to add room type")
                setOpenErrorModal(true)
                return toast.error("Failed to add room type")
            }
            if (data.status === 409) {
                setError(data.message || "Room type already exists")
                setOpenErrorModal(true)
                return toast.error("Room type already exists")
            }
            if (data.status === 200 || data.status === 201) {
                queryClient.invalidateQueries({ queryKey: ["getAllRoomTypes", variables.businessId] })
                return toast.success("Room type added successfully")
            }
        },
        onError: (error: Error) => {
            setError(error.message)
            setOpenErrorModal(true)
        },
    })

    return { createRoomTypeLoading, createRoomType }
}

// Update an existing room type
export const useUpdateRoomType = () => {
    const { setError, setOpenErrorModal } = useError()
    const queryClient = useQueryClient()

    const { isPending: updateRoomTypeLoading, mutateAsync: updateRoomType } = useMutation({
        mutationFn: async (payload: UpdateRoomTypePayload) => {
            const response = await apiRpc.hotel.room_type.update_room_type.$put({
                json: payload,
            })
            return response
        },
        onSuccess: (data, variables) => {

            if (data.status === 400 || data.status === 401) {
                setError(data.message || "Failed to update room type")
                setOpenErrorModal(true)
                return toast.error("Failed to update room type")
            }
            if (data.status === 409) {
                setError(data.message || "Room type already exists")
                setOpenErrorModal(true)
                return toast.error("Room type already exists")
            }
            if (data.status === 200 || data.status === 201) {
                queryClient.invalidateQueries({ queryKey: ["getAllRoomTypes", variables.businessId] })
                return toast.success("Room type updated successfully")
            }
        },
        onError: (error: Error) => {
            setError(error.message)
            setOpenErrorModal(true)
        },
    })

    return { updateRoomTypeLoading, updateRoomType }
}

