import { memo } from "react"
import { useParams } from "react-router-dom"
import { apiRpc } from "@hi/common"
import { useHiClientZ } from "@/components/store/useHiClientzData"
import { useOrderStore } from "@/components/store/useOrderData"
import { useQuery } from "@tanstack/react-query"

export interface IBillData {
    customerName: string;
    customerPhone: string;
    tableName: string;
    billRequestId: string;
    subTotal: number;
    serviceCharge: number;
    discount: number;
    tax: number;
    total: number;
}

const MemoGetBill = () => {

    const { businessId } = useParams()
    const selectedTable = useOrderStore(s => s.selectedTable)
    const userData = useHiClientZ(s => s.captainData)
    const getTableBill = async () => {

        const response = await apiRpc.pos.get_bill.$get({
            query: {
                businessId: businessId || "",
                tableName: selectedTable?.name || "",
                generatedBy: userData?.name || "",
            }
        })

        if (response.status === 400) {
            return Promise.reject({
                status: 400,
                message: "Server timeout occurred",
            });
        }

        const res = await response.json()
        const payment = res?.data as IBillData
        return payment
    }

    const { isLoading, data } = useQuery({
        queryKey: ["getTableBill", businessId, selectedTable?.name, userData?.name],
        queryFn: getTableBill,
        enabled: !!businessId && !!selectedTable && !!userData,
        staleTime: 1000 * 30,
    })


    return (
        <div className="flex items-center justify-center h-64">

        </div>
    )
}

const GetBill = memo(MemoGetBill)
export default GetBill
