import type { IDuesPersonsData } from "@/components/types/businessData"
import { apiRpc } from "@hi/common"
import { useQuery } from "@tanstack/react-query"
import { memo } from "react"
import { useParams } from "react-router-dom"

const MemoClearDues = ({ selectedUser }: { selectedUser: IDuesPersonsData | null }) => {

    const { businessId } = useParams()
    const getUserDueHIstory = async () => {
        const response = await apiRpc.dues.pending_dues[":duesUserId"][":businessId"].$get({
            param: {
                businessId: businessId || "",
                duesUserId: selectedUser?._id
            }
        })
        const res = await response.json()
        console.log(res)
        return res.data
    }
    console.log(selectedUser)
    const { isLoading, data } = useQuery({
        queryKey: ["userDueHistory", selectedUser?._id],
        queryFn: getUserDueHIstory,
        enabled: !!selectedUser?._id
    })

    return (
        <div>
            <h1>{selectedUser?.userId?.name}</h1>
        </div>
    )
}

const ClearDues = memo(MemoClearDues)
export default ClearDues