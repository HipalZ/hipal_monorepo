import { apiRpc } from "@hi/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAlertHistoryStore } from "../store/useAlertHistoryStore";

interface IHotelRoomData {
    businessId: string;
    roomName: string;
}

export const useHotelRoomData = () => {
    const { isPending: gettingRoomLoader, mutateAsync: roomPayload, } = useMutation({
        mutationFn: async (payload: IHotelRoomData) => {
            const response = await apiRpc.hotel.rooms.fetch_room.$get({
                query: payload
            });
            return response.json();
        },
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error) => {
            console.log(error);
        }
    });

    return { gettingRoomLoader, roomPayload };
};

interface CreateAlertPayload {
  serviceIds: string[]
  businessId: string
  userId: string
  roomId: string
  cart?: any
}

export const useCreateAlert = () => {
  
    const {
      isPending: creatingAlert,
      mutateAsync: createAlert,
      isError: alertError,
      isSuccess: alertSuccess,
    } = useMutation({
      mutationFn: async (payload: CreateAlertPayload) => {
        const response = await apiRpc.hotel.alert.create_alert.$post({
          json: payload,
        })
        return response.json()
      },
      onSuccess: (data, variables) => {
        console.log("Alert created successfully:", data)
      },
      onError: (error) => {
        console.error("Error creating alert:", error)
      },
    })
  
    return { creatingAlert, createAlert, alertError, alertSuccess }
  }
export interface ILinkHotels {
    _id: string;
    name: string;
    customLink: string;
    logo: string;
}
export const useGetAllLinkRestautants = (businessId:string) =>{

    const getLinkRestaurant = async () => {
        const response = await apiRpc.hotel.restaurant.fetch_hotel_restaurants.$get({
            query: {
                businessId: businessId
            }
        })
        const res = await response.json()
        return res.data ?? [] as ILinkHotels[]

    }

    const {isLoading:fetchingRestaurants,data:restaurantData} = useQuery({
        queryKey: ["getAllLinkRestautants", businessId],
        queryFn: getLinkRestaurant,
        enabled: !!businessId,
    })

    return {fetchingRestaurants,restaurantData}
}

