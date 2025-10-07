import { memo, useMemo } from "react";
import OnlineAlertCard from "../onlineAlertCard";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useSearch } from "@/components/store/useSearch";

const OnlineAlerts = () => {
  const onlineAlertData = useLiteStore((s) => s.onlineAlertData);
  const onlineCount = useLiteStore((s) => s.onlineCount);
  const { searchText } = useSearch((s) => ({
    searchText: s.searchText,
  }));

  console.log("Rendering OnlineAlerts with data:", onlineAlertData);

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
  }, [onlineAlertData, searchText, onlineCount]);

  return (
    <OnlineAlertCard
      key={onlineCount}
      onlineAlertData={sortedAndFilteredData}
    />
  );
};

const OnlineAlertsMemo = memo(OnlineAlerts);
export default OnlineAlertsMemo;
