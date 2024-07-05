import DateRangePickerMemo from '@/components/atoms/dateRangePicker';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import useTimings from '@/components/store/useTimings';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useState } from 'react';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import HistoryCard from './historyCard';
import { apiRpc } from '@hi/common';
import { Alert } from '@/components/types/hiClientzData';

const History = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const { selectedBiz } = useHiClientZ((s)=>({
    selectedBiz: s.selectedBiz,
  }));
  const { historyData, setHistoryData } = useLiteStore((s)=>({
    historyData: s.historyData,
    setHistoryData: s.setHistoryData,
  }));
  const { timeStampStart, timeStampEnd } = useTimings((s)=>({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  
  }));
  const businessId = selectedBiz?.businessId?._id;

  const handleClick = useCallback((newPage: number) => {
    if (newPage < 1) return;
    setPageNumber(newPage);
  }, []);

  const handleHistoryData = async () => {
    try {
      const res = await apiRpc.payments[':id'].paymentAlertHistory.$get({
        param: { id: businessId },
        query: {
          businessId: businessId,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
          pageNumber: pageNumber.toString(),
        },
      })
      const response = (await res.json()).data as Alert[];
      if (res.status === 200) {
        setHistoryData(response);
        return response;
      } else {
        return [];
      }
    } catch (err) {
      console.log(err);
      return [];
    }
  };
  const defaultClass = 'text-base w-10 h-10 flex justify-center items-center bg-[#f3eeff] text-[#834cff] border rounded-full border-[#2B354D]';

  useQuery({
    queryKey: ['onlineAlerts', businessId, timeStampStart, timeStampEnd, pageNumber],
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
          <button type="button" onClick={() => handleClick(pageNumber - 1)} className={defaultClass}>
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-black text-white">{pageNumber}</p>
        {historyData && historyData.length > 0 && (
          <button type="button" onClick={() => handleClick(pageNumber + 1)} className={defaultClass}>
            <BiChevronsRight />
          </button>
        )}
      </div>
      <br />
    </>
  );
}

const HistoryMemo = memo(History);
export default HistoryMemo;
