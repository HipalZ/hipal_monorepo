import { useError } from "@/components/store/useError"
import { apiRpc } from "@hi/common"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

interface IRestaurant {
    _id: string
    name: string
    logoUrl: string
    customLink?: string
}

export const useGetAllRestaurantsForHotel = () => {

    const getAllRestaurant = async () => {
        const response = await apiRpc.hotel.restaurant.fetch_restaurants.$get()
        const data = await response.json() as IRestaurant[]
        return data?.data ?? [] as IRestaurant[]
    }

    const { isLoading: retaurantLoader, data: restaurantData } = useQuery({
        queryKey: ['getAllRestaurant'],
        queryFn: getAllRestaurant
    })

    return { retaurantLoader, restaurantData }

}

export const useGetLinkedRestaurantForHotel = (businessId: string) => {

    const getLinkedRestaurant = async () => {
        const response = await apiRpc.hotel.restaurant.fetch_hotel_restaurants.$get({
            query: {
                businessId
            }
        })
        const data = await response.json() as IRestaurant[]
        return data?.data ?? [] as IRestaurant[]
    }

    const { isLoading: retaurantLoader, data: restaurantData } = useQuery({
        queryKey: ['getLinkedRestaurant', businessId],
        queryFn: getLinkedRestaurant,
        enabled: !!businessId
    })

    return { retaurantLoader, restaurantData }

}

interface ILinkRestaurant {
    businessId: string
    restaurantIds: string[]
}

export const useLinkRestaurantToHotel = () => {
    const { setError, setOpenErrorModal } = useError()
    const queryClient = useQueryClient()
    const { isPending: linkingRestaurantLoader, mutateAsync: linkRestaurant,isSuccess:isLinkedSuccessfully } = useMutation({
        mutationFn: async (payload: ILinkRestaurant) => {
            const response = await apiRpc.hotel.restaurant.link_restaurants.$post({
                json: payload
            })
            return response
        },
        onSuccess: async (data, variables) => {
            const extraData = await data.json()
            if (data.status === 400 || data.status === 401) {
                setError(extraData?.error?.issues[0]?.message)
                setOpenErrorModal(true)
                return toast.error("Failed to link restaurant")
            }
            if (data.status === 200 || data.status === 201) {
                queryClient.invalidateQueries({ queryKey: ['getLinkedRestaurant', variables.businessId] })
                return toast.success("Restaurant linked successfully")
            }
        },
        onError: (error) => {
            setError(error.message)
            setOpenErrorModal(true)
        }
    })
    return { linkingRestaurantLoader, linkRestaurant,isLinkedSuccessfully }
}