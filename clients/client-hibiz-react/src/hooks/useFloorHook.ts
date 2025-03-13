import useFloorFormStore, { useFloorStore } from "@/components/store/hotel/useFloorStore"
import { useError } from "@/components/store/useError"
import { apiRpc } from "@hi/common"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

export interface IHotelFloor {
    _id: string,
    name: string,
    tax: number,
    availability: boolean,
    amenities: string[],
    roomIds: string[],
    zoneId?: string,
}

export const useGetAllHotelFloors = (businessId: string) => {
    if (!businessId) return;
    const { setFloorData } = useFloorStore(s => ({
        setFloorData: s.setFloorData
    }))
    const getHotelFloors = async () => {
        const response = await apiRpc.hotel.zones.fetch_zones.$get({
            query: {
                businessId: businessId
            }
        })

        const res = (await response.json())
        const hotelFloors = res?.data as IHotelFloor[]
        setFloorData(hotelFloors)
        return hotelFloors ?? []
    }

    const { isLoading: floorsLoading, data: floorsData, refetch } = useQuery({
        queryKey: ["getAllHotelFloors", businessId],
        queryFn: getHotelFloors,
        enabled: !!businessId,
    })

    return { floorsLoading, floorsData, refetch }
}

export interface IHotelFloorPayload {
    businessId: string,
    name: string,
    tax: number,
    availability: boolean,
    amenities: string[],
    roomIds: string[],
    zoneId?: string,
}

export const useCreateHotelFloor = () => {
    const { setError, setOpenErrorModal } = useError()
    const { setAddFloorModal } = useFloorStore(
        s => ({
            setAddFloorModal: s.setAddFloorModal
        })
    )
    const { resetForm,
    } = useFloorFormStore()
    const queryClient = useQueryClient()
    const { isPending: createHotlePending, mutateAsync: createFloor } = useMutation({
        mutationFn: async (payload: IHotelFloorPayload) => {
            const response = await apiRpc.hotel.zones.$post({
                json: payload
            })
            return response
        },
        onSuccess: (data, variables) => {
            console.log(data)
            if (data.status === 400 || data.status === 401) {
                return toast.error("Failed to add floor")
            }
            if (data.status === 409) {
                setOpenErrorModal(true)
                setError("floor already exists")
                return toast.error("floor already exists")
            }
            if (data.status === 200 || data.status === 201) {
                resetForm()
                setAddFloorModal(false)
                queryClient.invalidateQueries({
                    queryKey: ["getAllHotelFloors", variables.businessId]
                })
                toast.success("Floor added successfully")
            }
        },
        onError: (data) => {
            console.log(data)
        }
    })
    return { createHotlePending, createFloor }
}

export const useUpdateHotelFloor = () => {
    const { setError, setOpenErrorModal } = useError()
    const queryClient = useQueryClient()
    const { setAddFloorModal } = useFloorStore(
        s => ({
            setAddFloorModal: s.setAddFloorModal
        })
    )
    const { resetForm,
    } = useFloorFormStore()
    const { isPending: updateFloorPending, mutateAsync: updateFloor } = useMutation({
        mutationFn: async (payload: IHotelFloorPayload) => {
            const response = await apiRpc.hotel.zones.$put({
                json: payload
            })
            return response
        },
        onSuccess: (data, variables) => {
            if (data.status === 400 || data.status === 401) {
                return toast.error("Failed to add floor")
            }
            if (data.status === 409) {
                setOpenErrorModal(true)
                setError("floor already exists")
                return toast.error("floor already exists")
            }
            if (data.status === 200 || data.status === 201) {
                resetForm()
                setAddFloorModal(false)
                queryClient.invalidateQueries({
                    queryKey: ["getAllHotelFloors", variables.businessId]
                })
                toast.success("Floor updated successfully")
            }
        },
        onError: (data) => {
            console.log(data)
        }
    })
    return { updateFloorPending, updateFloor }
}