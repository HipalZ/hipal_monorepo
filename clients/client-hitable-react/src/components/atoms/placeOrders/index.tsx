import { memo, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiRpc } from "@hi/common"
import SpinnerMemo from "../loadingSpinner"
import type { OrderData } from "@/components/types/hiClientzData"
import EnhancedOrderCard from "./orderCard"
import { useCart } from "@/components/store/useCart"
import { useOrderStore } from "@/components/store/useOrderData"

const MemoPlaceOrders = () => {
    const { tableId } = useParams()
    const { setIsPlacingNewOrder } = useCart();
    const { setOrderDataStore } = useOrderStore()

    const getTableOrders = useCallback(async () => {
        const response = await apiRpc.kot.table_kot[":tableId"].$get({
            param: { tableId },
        })

        const res = await response.json()
        setOrderDataStore(res.data)
        if (res?.data?.length > 0) {
            setIsPlacingNewOrder(false);
        }
        return res.data
    }, [tableId])

    const { isLoading, data } = useQuery({
        queryKey: ["getTableOrders", tableId],
        queryFn: getTableOrders,
        enabled: !!tableId,
    })

    if (isLoading) {
        return <SpinnerMemo />
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[80dvh]">
                <p className="text-lg text-gray-500">No orders found for this table.</p>
            </div>
        )
    }

    return (
        <ScrollArea className="min-h-[calc(100vh-8rem)] py-[5rem]">
            <div className="px-4 space-y-4">
                {data.length > 0 && data?.map((order: OrderData) => (
                    <EnhancedOrderCard key={order._id} order={order} />
                ))}
            </div>
        </ScrollArea>
    )
}

const PlaceOrders = memo(MemoPlaceOrders)
export default PlaceOrders

