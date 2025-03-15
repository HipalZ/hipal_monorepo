import { apiRpc } from "@hi/common"
import useBusinessDetails from "../store/useBusinessDetails"
import { useQuery } from "@tanstack/react-query"

export const useGetAllRooms = () => {
    const businessId = useBusinessDetails((s)=>s.businessDetails.businessId)
    const getRooms = async () => {
        const response = await apiRpc.hotel.rooms.fetch_rooms.$get({
            query: { businessId },
        })
        const res = await response.json()
        if (response.status === 200 || response.status === 201) {
            return res.data
        }

        return []
    }

    const { isLoading, data: rooms } = useQuery({
        queryKey: ["allRooms", businessId],
        queryFn: getRooms,
        enabled: !!businessId,
    })
    return { isLoading, rooms }
}