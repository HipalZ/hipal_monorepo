import PopUp from '@/components/atom/popUp';
import useTimings from '@/components/store/useTimings';
import { endOfDay, endOfMonth, startOfDay, startOfMonth, subDays } from 'date-fns';
import type React from 'react';
import { memo, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateRangePicker: React.FC = () => {
  const { setInTime, setTimeStampStart, setTimeStampEnd, setOutTime, selectedRange, setSelectedRange } = useTimings();
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [isCustomDate, setIsCustomDate] = useState(false);

  const formatDate = (date: Date) => {
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const fetchReportForRange = (start: Date, end: Date) => {
    setStartDate(start);
    setTimeStampStart(Date.parse(start.toString()));
    setEndDate(end);
    setTimeStampEnd(Date.parse(end.toString()));
    setInTime(formatDate(start));
    setOutTime(formatDate(end));
  };

  const handleTodayClick = () => {
    setSelectedRange('today');
    fetchReportForRange(startOfDay(new Date()), endOfDay(new Date()));
  };

  const handleYesterdayClick = () => {
    setSelectedRange('yesterday');
    const yesterday = subDays(new Date(), 1);
    fetchReportForRange(startOfDay(yesterday), endOfDay(yesterday));
  };

  const handleThisMonthClick = () => {
    setSelectedRange('thisMonth');
    fetchReportForRange(startOfMonth(new Date()), endOfMonth(new Date()));
  };

  const handleCustomDatesClick = () => {
    setSelectedRange('custom');
    setIsCustomDate(!isCustomDate);
  };

  useEffect(() => {
    if (selectedRange === 'today') {
      handleTodayClick();
    }
  }, []);

  return (
    <div className="flex items-center justify-between space-x-2 bg-white px-6 pt-4">
      <div className="sticky top-0">
        <div className="flex flex-wrap items-center justify-start space-x-2">
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'today' ? 'bg-[#2B354D] text-white' : 'bg-white'}`}
            onClick={handleTodayClick}
          >
            Today
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'yesterday' ? 'bg-[#2B354D] text-white' : 'bg-white'}`}
            onClick={handleYesterdayClick}
          >
            Yesterday
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'thisMonth' ? 'bg-[#2B354D] text-white' : 'bg-white'}`}
            onClick={handleThisMonthClick}
          >
            This Month
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'custom' ? 'bg-[#2B354D] text-white' : 'bg-white'}`}
            onClick={handleCustomDatesClick}
          >
            Custom dates
          </button>
        </div>
      </div>
      <div className="date-picker-container mx-6">
        {isCustomDate && (
          <PopUp show={isCustomDate} onClose={() => setIsCustomDate(false)}>
            <div className="date-picker-container item-center flex justify-center p-2">
              <DatePicker
                selected={startDate}
                onChange={(dates) => {
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
            </div>
          </PopUp>
        )}
      </div>
    </div>
  );
};

export default memo(DateRangePicker);
