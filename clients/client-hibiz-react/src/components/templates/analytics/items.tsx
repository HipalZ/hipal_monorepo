import { memo, useState } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { TopDishesChart } from "./topDishes";
import { TimeBasedAnalytics } from "./timeBased";
import type { ApiResponse } from "@/components/types/businessId";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const MemoItems: React.FC = () => {
  const businessID = useBusinessData((state) => state.businessData?._id);
  const [isDownloading, setIsDownloading] = useState(false);

  const getItemsAnalytics = async (): Promise<ApiResponse> => {
    const response = await apiRpc.cart[":businessId"].analytics.$get({
      param: {
        businessId: businessID || "",
      },
    });

    return response.json();
  };

  const { isLoading, data, error } = useQuery<ApiResponse, Error>({
    queryKey: ["getItemsAnalytics", businessID],
    queryFn: getItemsAnalytics,
    enabled: !!businessID,
  });

  const downloadItemAnalytics = async () => {
    if (!businessID) return;

    try {
      setIsDownloading(true);
      const response = await apiRpc.cart[":businessId"].analytics.download_xlsx.$get({
        param: {
          businessId: businessID,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to download item analytics");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `item-analytics-${new Date().toISOString().slice(0, 10)}.xlsx`;

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Item analytics downloaded.");
    } catch (downloadError) {
      console.error("Item analytics download failed:", downloadError);
      toast.error("Failed to download item analytics.");
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
          onClick={downloadItemAnalytics}
          disabled={isDownloading}
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

const Items = memo(MemoItems);
export default Items;
