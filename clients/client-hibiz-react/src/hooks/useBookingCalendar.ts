import { apiRpc } from "@hi/common"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Coupon } from "./useBusinessCoupons.ts";
import toast from "react-hot-toast";

export interface IBookingCalendar {
    date: string,
    day:number,
    numOfBookings: number,
    explicitlyEdited: boolean,
}

export const useGetBookingCalendar = (businessId:string) => {

    const getTheCalendar = async (businessId: string) => {
        const res = await apiRpc.bookings.calendar.getCalendar[":businessId"].$get({
            param: {
                businessId: businessId,
            },
        });
        const response = (await res.json())
        const bookingCalendar = response.data as IBookingCalendar[]
        if (res.status === 200 || res.status === 201) {
            return bookingCalendar
        }
        return []
    }

    const { isLoading:gettingCalendar, data:calendar } = useQuery({
        queryKey: ["bookingCalendar", businessId],
        queryFn: () => getTheCalendar(businessId),
        enabled: !!businessId,
        staleTime: 1000 * 60 * 5,
    })
    return {
        gettingCalendar,
        calendar,   
    }

}

export interface IBookingSlot {
    slot: string
    count: number
    isInOperatableRange: boolean
  }
  
  export interface IBookingBusiness {
    _id: string
    period: number
    date: string
    businessId: string
    explicitlyEdited: boolean
    archived_at: string | null
    couponsRemaining: Coupon[]
    createdAt: string
    isOpen: boolean
    updatedAt: string
  }
  
  export interface IBookingBusinessDetails {
    bookingBusiness: IBookingBusiness
    numOfBookings: number
    slots: IBookingSlot[]
  }
  
  export interface IBookingCalendarDaySummary {
    totalBookingsOfDay: number
    dayBookings: {
      [key: number]: IBookingBusinessDetails[]
    }
  }
  
  export interface IBookingCalendarWithDetails {
    date: string
    bookingBusinessDetails: IBookingBusinessDetails[]
    summary: {
      totalBookingsOfDay: number
      dayBookings: {
        [key: number]: any[]
      }
    }
  }
  
  export const useGetIndividualDateInfo = (businessId: string, date: string) => {
    const getTheDateInfo = async (businessId: string, date: string) => {
      const res = await apiRpc.bookings.calendar.getDateInfo[":businessId"][":date"].$get({
        param: {
          businessId: businessId,
          date: date,
        },
      })
      const response = await res.json()
      const bookingCalendar = response.data as IBookingCalendarWithDetails
      if (res.status === 200 || res.status === 201) {
        return bookingCalendar
      }
      return null
    }
  
    const { isLoading: gettingDateInfo, data: dateInfo } = useQuery({
      queryKey: ["IndividualDateInfo", businessId, date],
      queryFn: () => getTheDateInfo(businessId, date),
      enabled: !!businessId && !!date,
      staleTime: 1000 * 60 * 5,
    })
    return {
      gettingDateInfo,
      dateInfo,
    }
  }
  
  // New type for explicit booking update payload
export interface ExplicitBookingUpdatePayload {
  isOpen?: boolean
  couponsRemaining?: {
    couponId: string
    remaining: number
  }[]
}

// New hook for updating explicit booking details
export const useUpdateExplicitBooking = () => {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      businessId,
      date,
      period,
      payload,
    }: {
      businessId: string
      date: string
      period: number
      payload: ExplicitBookingUpdatePayload
    }) => {
      const response = await apiRpc.bookings["booking-business"]["explicit-booking"][":businessId"][":date"][
        ":period"
      ].$patch({
        param: {
          businessId,
          date:date.toString(),
          period:period.toString(),
        },
        json: payload,
      })
      return response.json()
    },
    onSuccess: (data, variables) => {
      if (data.status === 200 || data.status === 201) {
        toast.success("Booking details updated successfully")
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["IndividualDateInfo", variables.businessId, variables.date] })
      } else {
        toast.error("Failed to update booking details")
      }
    },
    onError: () => {
      toast.error("Failed to update booking details")
    },
  })

  return {
    updateExplicitBooking: mutate,
    isUpdating: isPending,
  }
}
