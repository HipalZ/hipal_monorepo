import { type Filters, useSalesStore } from "@/components/store/useSalesStore"
import type { HistoryData } from "@/components/types/businessData"
import { apiRpc } from "@hi/common"
import { useQuery } from "@tanstack/react-query"



export interface salesPayload {
    businessId: string
    pageNumber: string
    from: string
    to: string
    appliedFilters?: Filters
}

export const useGetallSalesByGet = (payload: salesPayload) => {
    if (!payload.businessId) return
    const {
        setHistoryData,
        setTotalSales,
        selectedFilters
    } = useSalesStore()

    const allSalesData = async (payload: salesPayload) => {
        const response = await apiRpc.payments[":id"].bills.$get({
            query: {
                ...payload,
                appliedFilter: JSON.stringify(selectedFilters)
            },
            param: {
                id: payload.businessId
            }
        })
        const data = (await response.json()).data as HistoryData;
        if (response.status === 200) {
            setHistoryData(data.existingPayments);
            setTotalSales(data.totalSale);
        }
        return data;
    }

    const { isLoading } = useQuery({
        queryKey: ["allSalesDataByGet", 
            payload.businessId, 
            payload.from, 
            payload.to, 
            payload.pageNumber,
            payload.appliedFilters,
            JSON.stringify(selectedFilters)
        ],
        queryFn: () => allSalesData(payload),
        enabled: !!payload.businessId && !!payload.from && !!payload.to && !!payload.pageNumber

    })

    return { isLoading }
} 