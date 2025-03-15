import type { BusinessDetails, IBanner, IBusinessData } from "@/components/types/businessData"
import { apiRpc } from "@hi/common"
import type { ILoyaltySetting } from "@/components/store/useLoyaltyData"
import { getBusinessData } from "../commonApis"
import type { IRoomProps, Room } from "@/components/types/hotelTypes"

export const getInfoForHotel = async (businessIdOrCustomLink: string): Promise<IBusinessData> => {
  try {

    const businessData = await getBusinessData(businessIdOrCustomLink) as BusinessDetails

    const [loyaltyResponse, bannersResponse] = await Promise.all([
      apiRpc.businesses[":businessId"].loyalty.$get({
        param: { businessId: businessData.businessId },
      }),
      apiRpc.settings.banners[":businessId"].$get({
        param: { businessId: businessData.businessId },
        query: { isPublished: "true" },
      }),
    ])

    const loyalty = await loyaltyResponse.json()
    const banners = await bannersResponse.json()

    return {
      business: businessData,
      loyalty: loyalty?.data as ILoyaltySetting,
      banners: banners?.data as IBanner[],
    }
  } catch (error) {
    console.error("Error in getInfoForHotel:", error)
    throw error
  }
}

export const getRooms = async (businessIdOrCustomLink: string): Promise<IRoomProps> => {
  try {
    const businessData = await getBusinessData(businessIdOrCustomLink) as BusinessDetails

    const [roomsResponse] = await Promise.all([
      apiRpc.hotel.rooms.fetch_rooms.$get({
        query: { businessId: businessData.businessId },
      })
    ])

    const rooms = await roomsResponse.json()

    return {
      business: businessData,
      rooms: rooms?.data,
    }
  } catch (err) {
    console.error("Error in getRooms:", err)
    throw err
  }
}

