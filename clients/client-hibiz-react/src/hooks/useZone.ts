import { useError } from "@/components/store/useError"
import type { ITable, IZone } from "@/components/store/useZone"
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
        },
        enabled: !!businessId
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

export const useGetAllTables = (businessId: string) => {
    if(businessId === "") return {data:[],isLoading:false}

    const { setAllTables } = useZoneStore()
    const {  isLoading } = useQuery({
        queryKey: ["getAllTablesPos", businessId],
        queryFn: async () => {
            const response = await apiRpc.zones_and_tables.tables[':businessId'].$get({
                param: {
                    businessId: businessId || ""
                }
            })
            const tables = await response.json()
            setAllTables(tables.data as ITable[])
            return tables.data as ITable[]
        },
        enabled: !!businessId
    })
    return {  isLoading }
}

export const useCreateTable = () => {
    const { resetAllValues } = useZoneStore()
    const queryClient = useQueryClient()
    const {setError,setOpenErrorModal} = useError()
    const { isPending, mutateAsync } = useMutation({
        mutationFn: async (payload: ITable) => {
            const response = await apiRpc.zones_and_tables.table.$post({
                json: payload
            })
            return response
        },
        onSuccess: (data,variables) => {
            if (data.status === 400 || data.status === 401) {
                setOpenErrorModal(true)
                setError("Table creation failed")
                return toast.error("Table creation failed")
            }
            if (data.status === 409) {
                setOpenErrorModal(true)
                setError("Table already exists")
                return toast.error("Table already exists")
            }
            if (data.status === 200 || data.status === 201) {
                queryClient.invalidateQueries({queryKey:["getAllTablesPos", variables.businessId]})
                resetAllValues()
                return toast.success("Table created successfully")
            }
        },
        onError: (data) => {
            console.log(data)
        }
    })
    return { isPending, createTable: mutateAsync }
}

export const useUpdateTable = () => {
    const { resetAllValues } = useZoneStore()
    const queryClient = useQueryClient()
    const {setError,setOpenErrorModal} = useError()
    const { isPending, mutateAsync } = useMutation({
        mutationFn: async (payload: ITable) => {
            const response = await apiRpc.zones_and_tables.table.$put({
                json:payload
            })
            return response
        },
        onSuccess: (data,variables) => {
            if (data.status === 400 || data.status === 401) {
                setOpenErrorModal(true)
                setError("Table update failed")
                return toast.error("Table update failed")
            }
            if (data.status === 409) {
                setOpenErrorModal(true)
                setError("Table already exists")
                return toast.error("Table already exists")
            }
            if (data.status === 200 || data.status === 201) {
                queryClient.invalidateQueries({queryKey:["getAllTablesPos", variables.businessId]})
                resetAllValues()
                return toast.success("Table updated successfully")
            }
        },
        onError: (data) => {
            console.log(data)
        }
    })
    return { isPending, updateTable: mutateAsync }
}

