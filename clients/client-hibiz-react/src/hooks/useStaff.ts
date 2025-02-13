import type { UserProfile } from "@/components/types/businessData"
import { apiRpc } from "@hi/common"
import { useQuery } from "@tanstack/react-query"
import useZoneStore from "@/components/store/useZone"

export const useGetAllStaff = (businessId:string) => {
const {setAllStaff} = useZoneStore()
const getStaff = async () => {
    const res = await apiRpc.users[":businessId"].$get({
      param: {
        businessId: businessId
      },
    })

    const response = (await res.json()).data as UserProfile[]
    if (res.status === 200 || res.status === 201) {
        setAllStaff(response)
    }
    return response
  }

    const { data: rawStaffDetails, isLoading: isLoadingStaff } = useQuery({
        queryKey: ["getStaffs",businessId],
        queryFn: getStaff,
        enabled: !!businessId
      });
    
    return { rawStaffDetails, isLoadingStaff }
}