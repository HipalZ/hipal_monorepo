"use client"

import { apiRpc } from "@hi/common"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useLogin } from "../store/useLogin"
import { useEffect } from "react"

export const useCheckRoomStatus = (businessId: string, room: string, customLink: string) => {
  const userId = useLogin((s) => s.userDetails?._id)
  const router = useRouter()

  const checkRoomStatus = async () => {
    // Only make the API call if we have a userId
    if (!userId) {
      return { status: 401, message: "User not logged in" }
    }

    try {
      const response = await apiRpc.hotel.rooms.auth_code.$get({
        query: {
          businessId: businessId,
          room: room,
          userId,
        },
      })
      return response
    } catch (error) {
      console.error("Error checking room status:", error)
      return { status: 500, message: "Error checking room status" }
    }
  }

  const {
    isLoading: checkingIn,
    data: checkRoom,
    error,
  } = useQuery({
    queryKey: ["checkRoomStatus", businessId, room, userId],
    queryFn: checkRoomStatus,
    enabled: !!businessId && !!room && !!userId,
  })

  useEffect(() => {
    if (businessId && room && userId && checkRoom?.status === 404) {
      router.push(`/${customLink}/hotel`)
    }
  }, [checkRoom, customLink, router, businessId, room, userId])

  return { checkingIn, checkRoom, error }
}

