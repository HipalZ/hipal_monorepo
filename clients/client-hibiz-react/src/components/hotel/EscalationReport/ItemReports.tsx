import { memo, useState } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/components/types/businessId";
import usePaginationStore from "@/components/store/usePaginationStore";
import useTimings from "@/components/store/useTimings";
import { TopDishesChart } from "@/components/templates/analytics/topDishes";
import { TimeBasedAnalytics } from "@/components/templates/analytics/timeBased";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const MemoItemsHotelReports: React.FC = () => {
    const businessData = useBusinessData((state) => state.businessData);
    const businessId = businessData?._id;
    const [isDownloading, setIsDownloading] = useState(false);
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

    const downloadReports = async () => {
        if (!businessId) return;

        try {
            setIsDownloading(true);
            const response = await apiRpc.hotel.report.fetch_item_reports.download_xlsx.$post({
                json: {
                    businessId,
                    from: timeStampStart,
                    to: timeStampEnd,
                },
            });

            if (!response.ok) {
                throw new Error("Unable to download hotel item reports");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            const safeBusinessName = (businessData?.name || "hotel").replace(/[<>:"/\\|?*\x00-\x1f]/g, "").trim() || "hotel";
            const fileName = `${safeBusinessName}-item-reports-${new Date().toISOString().slice(0, 10)}.xlsx`;

            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Item reports downloaded.");
        } catch (downloadError) {
            console.error("Hotel item reports download failed:", downloadError);
            toast.error("Failed to download item reports.");
        } finally {
            setIsDownloading(false);
        }
    };

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
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={downloadReports}
                    disabled={isDownloading || !businessId}
                    className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {isDownloading ? "Preparing..." : "Download"}
                </button>
            </div>
            <TopDishesChart topDishes={topDishes} />
            <TimeBasedAnalytics timeBasedAnalytics={timeBasedAnalytics} />
        </div>
    );
};

const ItemsHotelReports = memo(MemoItemsHotelReports);
export default ItemsHotelReports;
