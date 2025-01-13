import { useLiteStore } from "@/components/store/useLiteStore";
import { useSearch } from "@/components/store/useSearch";
import { memo, useMemo } from "react"
import CallCaptain from "./callCaptainMain";

const MemoCallCaptanMainComp = () => {
    const { offlineAlertData } = useLiteStore((s) => ({
        offlineAlertData: s.offlineAlertData,
        isAscending: s.isAscending,
        setIsAscending: s.setIsAscending,
        showSearchBox: s.showSearchBox,
        setShowSearchBox: s.setShowSearchBox,
    }));

    const { searchText } = useSearch((s) => ({
        searchText: s.searchText,
    }));

    const sortedAndFilteredData = useMemo(() => {
        const data = Array.isArray(offlineAlertData) ? offlineAlertData : [];
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
    }, [offlineAlertData, searchText]);

    return <CallCaptain offlineAlertData={sortedAndFilteredData} />;
};
const CallCaptanMainComp = memo(MemoCallCaptanMainComp)
export default CallCaptanMainComp
