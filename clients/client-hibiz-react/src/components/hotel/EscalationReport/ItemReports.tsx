import { memo } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/components/types/businessId";
import usePaginationStore from "@/components/store/usePaginationStore";
import useTimings from "@/components/store/useTimings";
import { TopDishesChart } from "@/components/templates/analytics/topDishes";
import { TimeBasedAnalytics } from "@/components/templates/analytics/timeBased";

const MemoItemsHotelReports: React.FC = () => {
    const businessId = useBusinessData((state) => state.businessData?._id);
    const pageNumber = usePaginationStore((s) => s.pageNumber)
    const { timeStampEnd, timeStampStart } = useTimings()
    const ItemsHotelAnalytics = async (): Promise<ApiResponse> => {
        const response = await apiRpc.hotel.report.fetch_item_reports.$post({
            json: {
                businessId: businessId || "",
                page: pageNumber,
                from: timeStampStart,
                to: timeStampEnd,
            }
        });

        return response.json();
    };

    const { isLoading, data, error } = useQuery<ApiResponse, Error>({
        queryKey: ["itemsHotelAnalytics", businessId, pageNumber, timeStampStart, timeStampEnd],
        queryFn: ItemsHotelAnalytics,
        enabled: !!businessId && !!pageNumber && !!timeStampStart && !!timeStampEnd,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">Loading...</div>
        );
    }

    if (error || !data || data.err) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                {error?.message || data?.message || "Unknown error"}
            </div>
        );
    }

    const { topDishes, timeBasedAnalytics } = data.data;

    return (
        <div className="p-4 space-y-8">
            <TopDishesChart topDishes={topDishes} />
            <TimeBasedAnalytics timeBasedAnalytics={timeBasedAnalytics} />
        </div>
    );
};

const ItemsHotelReports = memo(MemoItemsHotelReports);
export default ItemsHotelReports;
