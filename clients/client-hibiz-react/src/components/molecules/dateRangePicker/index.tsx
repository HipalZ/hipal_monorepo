import PopUp from '@/components/atom/popUp';
import useTimings from '@/components/store/useTimings';
import { endOfDay, endOfMonth, startOfDay, startOfMonth, subDays } from 'date-fns';
import  { memo, useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const formatDate = (date: Date) => {
  return `${String(date?.getDate())?.padStart(2, '0')}-${String(date?.getMonth() + 1)?.padStart(2, '0')}-${date?.getFullYear()}`;
};
const DateRangePicker: React.FC = memo(() => {
  const { setInTime, setTimeStampStart, setTimeStampEnd, setOutTime, selectedRange, setSelectedRange } = useTimings();
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [isCustomDate, setIsCustomDate] = useState(false);

  const fetchReportForRange = useCallback((start: Date, end: Date) => {
    setStartDate(start);
    setTimeStampStart(Date.parse(start.toString()));
    setEndDate(end);
    setTimeStampEnd(Date.parse(end.toString()));
    setInTime(formatDate(start));
    setOutTime(formatDate(end));
}, [])

const handleTodayClick = useCallback(() => {
  setSelectedRange('today');
  fetchReportForRange(startOfDay(new Date()), endOfDay(new Date()));
}, [setSelectedRange, fetchReportForRange]);

const handleYesterdayClick = useCallback(() => {
  setSelectedRange('yesterday');
  const yesterday = subDays(new Date(), 1);
  fetchReportForRange(startOfDay(yesterday), endOfDay(yesterday));
}, [setSelectedRange, fetchReportForRange]); 

const handleThisMonthClick = useCallback(() => {
  setSelectedRange('thisMonth');
  fetchReportForRange(startOfMonth(new Date()), endOfMonth(new Date()));
}, [setSelectedRange, fetchReportForRange])

const handleCustomDatesClick = useCallback(() => {
  setSelectedRange('custom');
  setIsCustomDate(isCustomDate => !isCustomDate);
}, [isCustomDate]);

  useEffect(() => {
    if (selectedRange === 'today') {
      handleTodayClick();
    }
  }, []);

  return (
    <div className="flex items-center justify-between px-6 pt-4 space-x-2">
      <div className="sticky top-0">
        <div className="flex flex-wrap items-center justify-start space-x-2">
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'today' ? 'bg-[#000000] text-white' : 'bg-white'}`}
            onClick={handleTodayClick}
          >
            Today
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'yesterday' ? 'bg-[#000000] text-white' : 'bg-white'}`}
            onClick={handleYesterdayClick}
          >
            Yesterday
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'thisMonth' ? 'bg-[#000000] text-white' : 'bg-white'}`}
            onClick={handleThisMonthClick}
          >
            This Month
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'custom' ? 'bg-[#000000] text-white' : 'bg-white'}`}
            onClick={handleCustomDatesClick}
          >
            Custom dates
          </button>
        </div>
      </div>
      <div className="mx-6 date-picker-container">
        {isCustomDate && (
          <PopUp show={isCustomDate} onClose={() => setIsCustomDate(false)}>
            <div className="flex justify-center pb-[20vh] pt-6 date-picker-container item-center">
              <DatePicker
                selected={startDate}
                onChange={(dates:any) => {
                  if (Array.isArray(dates) && dates.length === 2) {
                    const [start, end] = dates;
                    fetchReportForRange(start, end);
                  } else {
                    fetchReportForRange(dates, dates);
                  }
                }}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
              />
              <button onClick={() => setIsCustomDate(false)} type='button' className='absolute bottom-4 py-3 rounded-full text-white w-[92%] bg-black'>
                Close
              </button>
            </div>
          </PopUp>
        )}
      </div>
    </div>
  );
});

const MemoizedDateRangePicker = memo(DateRangePicker);
export default MemoizedDateRangePicker;
