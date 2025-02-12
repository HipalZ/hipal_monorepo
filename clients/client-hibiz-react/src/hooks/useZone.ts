import { useError } from "@/components/store/useError"
import type { IZone } from "@/components/store/useZone"
import useZoneStore from "@/components/store/useZone"
import { apiRpc } from "@hi/common"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"


export const useGetAllZones = (businessId: string) => {
    if (businessId === "") return { data: [], isLoading: false }
    const { setAllZones } = useZoneStore()
    const { data, isLoading } = useQuery({
        queryKey: ["getAllZonesPos", businessId],
        queryFn: async () => {
            const response = await apiRpc.zones_and_tables.zones[':businessId'].$get({
                param: {
                    businessId: businessId || ""
                }
            })
            const zones = await response.json()
            setAllZones(zones.data as IZone[])
            return zones.data as IZone[]
        }
    })
    return { data, isLoading }
}

export const useCreateZone = () => {
    const { resetAllValues } = useZoneStore()
    const {setError,setOpenErrorModal} = useError()
    const queryClient = useQueryClient()
    const { isPending, mutateAsync } = useMutation({
        mutationFn: async (payload: IZone) => {
            const response = await apiRpc.zones_and_tables.zone.$post({
                json: payload
            })
            return response
        },
        onSuccess: (data,variables) => {
            if (data.status === 400 || data.status === 401) {
                setOpenErrorModal(true)
                setError("Zone creation failed")
                return toast.error("Zone creation failed")
            }
            if (data.status === 409) {
                setOpenErrorModal(true)
                setError("Zone already exists")
                return toast.error("Zone already exists")
            }
            if (data.status === 200 || data.status === 201) {
                queryClient.invalidateQueries({queryKey:["getAllZonesPos", variables.businessId]})
                resetAllValues()
                return toast.success("Zone created successfully")
            }
        },
        onError: (data) => {
            console.log(data)
        }
    })
    return { isPending, createZone: mutateAsync }
}

export const useUpdateZone = () => {
    const { resetAllValues } = useZoneStore()
    const queryClient = useQueryClient()
    const {setError,setOpenErrorModal} = useError()
    const { isPending, mutateAsync } = useMutation({
        mutationFn: async (payload: IZone) => {
            const response = await apiRpc.zones_and_tables.zone.$put({
                json:payload
            })
            return response
        },
        onSuccess: (data,variables,error) => {
            console.log(error)
            if (data.status === 400 || data.status === 401) {
                setOpenErrorModal(true)
                setError("Zone update failed")
                return toast.error("Zone update failed")
            }
            if (data.status === 409) {
                setOpenErrorModal(true)
                setError("Zone already exists")
                return toast.error("Zone already exists")
            }
            if (data.status === 200 || data.status === 201) {
                queryClient.invalidateQueries({queryKey:["getAllZonesPos", variables.businessId]})
                resetAllValues()
                return toast.success("Zone updated successfully")
            }
        },
        onError: (data) => {
            console.log(data)
        }
    })
    return { isPending, updateZone: mutateAsync }
}

