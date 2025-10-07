import DateRangePickerMemo from "@/components/atoms/dateRangePicker";
import { useLiteStore } from "@/components/store/useLiteStore";
import useTimings from "@/components/store/useTimings";
import type { Alert } from "@/components/types/hiClientzData";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useState } from "react";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import HistoryCard from "./historyCard";
import { useErrorHandling } from "@/components/utils/helpers";
import useBusinessData from "../../store/useBusinessData";
import { fetchAlertHistory } from "../../../api/alert";

const History = () => {
  const { errorText } = useErrorHandling();
  const [pageNumber, setPageNumber] = useState(1);
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const historyData = useLiteStore((s) => s.historyData);
  const setHistoryData = useLiteStore((s) => s.setHistoryData);
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);

  const handleClick = useCallback((newPage: number) => {
    if (newPage < 1) return;
    setPageNumber(newPage);
  }, []);

  const handleHistoryData = async () => {
    const res = await fetchAlertHistory({
      payload: {
        businessId: businessId!,
        startDate: timeStampStart!,
        endDate: timeStampEnd!,
        page: pageNumber,
      },
      outletType,
    });

    if (res.status === 401) {
      return errorText();
    }

    const json = await res.json();
    const response = (json?.data || []) as Alert[];

    if (res.status === 200) {
      setHistoryData(response);
      return response;
    }

    return [];
  };
  const defaultClass =
    "text-base w-10 h-10 flex justify-center items-center bg-[#f3eeff] text-[#834cff] border rounded-full border-[#2B354D]";

  useQuery({
    queryKey: [
      "historyAlerts",
      businessId,
      timeStampStart,
      timeStampEnd,
      pageNumber,
    ],
    queryFn: handleHistoryData,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd && !!pageNumber,
  });

  return (
    <>
      <div className="flex h-[2rem] items-center justify-between px-4 py-8">
        <h1 className="text-lg font-semibold">History</h1>
      </div>
      <DateRangePickerMemo />
      <HistoryCard onlineAlertData={historyData} />
      <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {historyData && historyData.length >= 0 && (
          <button
            type="button"
            onClick={() => handleClick(pageNumber - 1)}
            className={defaultClass}
          >
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-black text-white">
          {pageNumber}
        </p>
        {historyData && historyData.length > 0 && (
          <button
            type="button"
            onClick={() => handleClick(pageNumber + 1)}
            className={defaultClass}
          >
            <BiChevronsRight />
          </button>
        )}
      </div>
      <br />
    </>
  );
};

const HistoryMemo = memo(History);
export default HistoryMemo;
