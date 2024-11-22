import { memo } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { TopDishesChart } from "./topDishes";
import { TimeBasedAnalytics } from "./timeBased";
import type { ApiResponse } from "@/components/types/businessId";

const MemoItems: React.FC = () => {
  const businessID = useBusinessData((state) => state.businessData?._id);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  if (error || !data || data.err) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error fetching analytics data:{" "}
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

const Items = memo(MemoItems);
export default Items;
