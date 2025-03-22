import { apiRpc } from "@hi/common"
import { useQuery } from "@tanstack/react-query"
import { redirect } from "next/navigation";
import { useLogin } from "../store/useLogin";


export const useCheckRoomStatus = (businessId: string, room: string, customLink: string) => {
    const userId = useLogin((s)=>s.userDetails?._id)
    if (!businessId || !room || !userId) return {}
    const checkRoomStatus = async () => {
        const response = await apiRpc.hotel.rooms.auth_code.$get({
            query: {
                businessId: businessId,
                room: room,
                userId
            }
        })
        return response 
    }

    const { isLoading: checkingIn, data: checkRoom } = useQuery({
        queryKey: ["checkRoomStatus", businessId, room],
        queryFn: checkRoomStatus,
        enabled: !!businessId && !!room,
    })
   
    if (
        checkRoom?.status === 404
    ) {
        redirect(`/${customLink}/hotel`)
    }

    return { checkingIn, checkRoom }
}
