import { apiRpc } from "@hi/common"
import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"

export interface ICheckInUsers {
  businessId: string
  from?: string
  to?: string
  pageNumber?: string
}

export interface ICheckInUserData {
  _id: string
  userId: {
    _id: string
    name: string
    phone: string
  }
  date: number
  qrId: string
  businessId: string
  code: string
}

export const useFetchCheckInUsers = (data: ICheckInUsers) => {
  const response = useCallback(async (data: ICheckInUsers) => {
    const res = await apiRpc.qrs.check_in_user.$get({
      query: {
        businessId: data.businessId,
      },
    })
    const checkInUsers = (await res.json()).data || []
    return checkInUsers as ICheckInUserData[]
  }, [])

  const {
    isLoading,
    data: checkInUsersData,
    error,
    refetch,
  } = useQuery({
    queryKey: ["check-in-users", data.businessId],
    queryFn: () => response(data),
    enabled: !!data.businessId,
  })

  return {
    checkInUsers: checkInUsersData || [],
    isLoadingCheckInUsers: isLoading,
    error,
    refetch,
  }
}
