import { memo, useMemo } from "react";
import OnlineAlertCard from "../onlineAlertCard";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useSearch } from "@/components/store/useSearch";

const OnlineAlerts = () => {
  const { onlineAlertData, isAscending } = useLiteStore((s) => ({
    onlineAlertData: s.onlineAlertData,
    isAscending: s.isAscending,
  }));
  const { searchText } = useSearch((s) => ({
    searchText: s.searchText,
  }));

  const sortedAndFilteredData = useMemo(() => {
    const data = Array.isArray(onlineAlertData) ? onlineAlertData : [];

    let filteredData = [...data];

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.order_id?.total?.toString().includes(searchText) ||
          item.order_id?.name?.toLowerCase().includes(searchLower) ||
          item.order_id?.phone?.toLowerCase().includes(searchLower) ||
          item.order_id?.claimedCoins?.toString().includes(searchLower),
      );
    }

    return filteredData;
  }, [onlineAlertData, searchText]);

  return <OnlineAlertCard onlineAlertData={sortedAndFilteredData} />;
};

const OnlineAlertsMemo = memo(OnlineAlerts);
export default OnlineAlertsMemo;
