import { useError } from "@/components/store/useError"
import { useMenuCreationStore } from "@/components/store/useMenuCreationStore"
import { apiRpc } from "@hi/common"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

// Interface for a single menu layout
export interface MenuLayout {
  _id: string
  name: string
  businessId: string
  zoneIds: string[]
  menuType: number
  days: number[]
  categoryLayout: number
  cardLayout: number
  startTime: number
  endTime: number
  primaryColor: string
  secondaryColor: string
  isActive: boolean
  isDeleted?: boolean
  extendTime?: number
  sourceMenuId?: string
  dishIds?: string[]
  categoryIds?: string[]
}

// Interface for the API response from fetch_menus
export interface MenuLayoutsResponse {
  data: MenuLayout[]
  status: number
  message?: string
}

export interface SingleMenuLayout {
  data: MenuLayout
  status: number
  message?: string
}

// Interface for the return type of useGetAllLayouts
export interface GetAllLayoutsResult {
  isLoading: boolean
  allMenuLayouts?: MenuLayoutsResponse
  refetch: () => void
}

export interface GetSingleMenuLayoutResult {
  isLoading: boolean
  menuLayout?: SingleMenuLayout
}

// Interface for the payload to create/update a menu layout
export interface CreateMenuLayoutPayload {
  name: string
  businessId: string
  zoneIds: string[]
  menuType: number
  days: number[]
  categoryLayout: number
  cardLayout: number
  startTime: number
  endTime: number
  primaryColor: string
  secondaryColor: string
  isActive?: boolean
  extendTime?: number
  sourceMenuId?: string
  dishIds?: string[]
  categoryIds?: string[]
  copyCompleteMenu?: boolean
  menuId?: string
}

// Interface for API response
export interface ApiResponse {
  status: number
  message?: string
  data?: any
}

// Interface for the return type of useCreateMenuLayout
export interface CreateMenuLayoutResult {
  createMenuLoader: boolean
  createMenuLayout: (payload: CreateMenuLayoutPayload) => Promise<ApiResponse>
}

// Interface for the return type of useUpdateMenuLayout
export interface UpdateMenuLayoutResult {
  updatetingMenuLoader: boolean
  updateMenuLayout: (payload: CreateMenuLayoutPayload) => Promise<ApiResponse>
}

export const useGetAllLayouts = (businessId: string): GetAllLayoutsResult => {
  const getMenuLayout = async (businessId: string): Promise<MenuLayoutsResponse> => {
    if (!businessId) return { data: [], status: 200 }
    const response = await apiRpc.menu.fetch_menus.$get({
      query: {
        businessId: businessId,
      },
    })
    const res = await response.json()
    return res
  }

  const { isLoading, data: allMenuLayouts,refetch } = useQuery({
    queryKey: ["getMenuLayouts", businessId],
    queryFn: () => getMenuLayout(businessId),
    enabled: !!businessId,
  })

  return { isLoading, allMenuLayouts ,refetch}
}

export const useGetMenuLayout = (menuId: string): GetSingleMenuLayoutResult => {
  const fetchMenuLayout = async (menuId: string): Promise<SingleMenuLayout> => {
    if (!menuId) return { data: {} as MenuLayout, status: 404, message: "Menu ID is required" }

    const response = await apiRpc.menu.fetch_menu.$get({
      query: {
        menuId: menuId,
      },
    })
    const data = await response.json()
    return data
  }

  const { data: menuLayout, isLoading } = useQuery({
    queryKey: ["getMenuLayout", menuId],
    queryFn: () => fetchMenuLayout(menuId),
    enabled: !!menuId,
  })

  return {
    isLoading,
    menuLayout,
  }
}

export const useCreateMenuLayout = (): CreateMenuLayoutResult => {
  const { resetStore, setShowCreationFlow } = useMenuCreationStore((s) => ({
    resetStore: s.resetStore,
    setShowCreationFlow: s.setShowCreationFlow,
  }))

  const { setError, setOpenErrorModal } = useError()
  const queryClient = useQueryClient()

  const { isPending: createMenuLoader, mutateAsync: createMenuLayout } = useMutation({
    mutationFn: async (payload: CreateMenuLayoutPayload): Promise<ApiResponse> => {
      const response = await apiRpc.menu.add_menu.$post({
        json: payload,
      })
      return response
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true)
        return setError("Menu creation failed")
      }
      if (data.status === 409) {
        setOpenErrorModal(true)
        return setError("Menu already exists")
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["getMenuLayouts", variables.businessId] })
        resetStore()
        setShowCreationFlow(false)
        return toast.success("Menu created successfully")
      }
    },
    onError: (data) => {
      console.log(data)
    },
  })

  return { createMenuLoader, createMenuLayout }
}

export const useUpdateMenuLayout = (): UpdateMenuLayoutResult => {
  const { resetStore, setShowCreationFlow } = useMenuCreationStore((s) => ({
    resetStore: s.resetStore,
    setShowCreationFlow: s.setShowCreationFlow,
  }))

  const { setError, setOpenErrorModal } = useError()
  const queryClient = useQueryClient()

  const { isPending: updatetingMenuLoader, mutateAsync: updateMenuLayout } = useMutation({
    mutationFn: async (payload: CreateMenuLayoutPayload): Promise<ApiResponse> => {
      const response = await apiRpc.menu.update_menu.$put({
        json: payload,
      })
      return response
    },
    onSuccess: (data, variables) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true)
        return setError("Menu update failed")
      }
      if (data.status === 409) {
        setOpenErrorModal(true)
        return setError("Menu already exists")
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["getMenuLayouts", variables.businessId] })
        resetStore()
        setShowCreationFlow(false)
        return toast.success("Menu updated successfully")
      }
    },
  })

  return { updatetingMenuLoader, updateMenuLayout }
}

export const useQwickDaysUpdate = ():UpdateMenuLayoutResult => {
  const { setError, setOpenErrorModal } = useError()

  const { isPending: updatetingMenuLoader, mutateAsync: updateMenuLayout } = useMutation({
    mutationFn: async (payload: CreateMenuLayoutPayload): Promise<ApiResponse> => {
      const response = await apiRpc.menu.update_menu.$put({
        json: payload,
      })
      return response
    },
    onSuccess: (data) => {
      if (data.status === 400 || data.status === 401) {
        setOpenErrorModal(true)
        return setError("Menu update failed")
      }
      if (data.status === 409) {
        setOpenErrorModal(true)
        return setError("Menu already exists")
      }
      if (data.status === 200 || data.status === 201) {
        return toast.success("Menu updated successfully")
      }
    },
  })

  return { updatetingMenuLoader, updateMenuLayout }
}

