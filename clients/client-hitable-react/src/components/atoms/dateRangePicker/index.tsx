import useTimings from "@/components/store/useTimings";
import { endOfDay, startOfDay, subDays } from "date-fns";
import React, { memo, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PopUp from "../popUp";

const DateRangePicker: React.FC = () => {
  const {
    setInTime,
    setTimeStampStart,
    setTimeStampEnd,
    setOutTime,
    selectedRange,
    setSelectedRange,
  } = useTimings((s) => ({
    setInTime: s.setInTime,
    setTimeStampStart: s.setTimeStampStart,
    setTimeStampEnd: s.setTimeStampEnd,
    setOutTime: s.setOutTime,
    selectedRange: s.selectedRange,
    setSelectedRange: s.setSelectedRange,
  }));
  const [dayBeforeYesterday, setDayBeforeYesterday] = useState("");
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [isCustomDate, setIsCustomDate] = useState(false);
  const formatDate = (date: Date) => {
    return `${String(date?.getDate())?.padStart(2, "0")}-${String(
      date?.getMonth() + 1,
    )?.padStart(2, "0")}-${date?.getFullYear()}`;
  };

  const fetchReportForRange = (start: Date, end: Date) => {
    setStartDate(start);
    // do not place the optional chaining operator here
    setTimeStampStart(Date.parse(start.toString()));
    setEndDate(end);
    // do not place the optional chaining operator here
    setTimeStampEnd(Date.parse(end.toString()));
    setInTime(formatDate(start));
    setOutTime(formatDate(end));
  };

  const handleTodayClick = () => {
    setSelectedRange("today");
    fetchReportForRange(startOfDay(new Date()), endOfDay(new Date()));
  };

  const handleYesterdayClick = () => {
    setSelectedRange("yesterday");
    const yesterday = subDays(new Date(), 1);
    fetchReportForRange(startOfDay(yesterday), endOfDay(yesterday));
  };

  const handleDayBeforeYesterdayClick = () => {
    setSelectedRange("daybeforeyesterday");
    const dayBeforeYesterday = subDays(new Date(), 2);
    fetchReportForRange(
      startOfDay(dayBeforeYesterday),
      endOfDay(dayBeforeYesterday),
    );
  };

  useEffect(() => {
    const date = new Date();
    const dayBeforeYesterday = formatDate(subDays(date, 2));
    setDayBeforeYesterday(dayBeforeYesterday);
    if (selectedRange === "today") {
      handleTodayClick();
    }
  }, []);

  return (
    <div className="flex items-center justify-between px-6 pt-4 space-x-2">
      <div className="sticky top-0">
        <div className="flex flex-wrap items-center justify-start space-x-2">
          <button
            type="button"
            className={`rounded-full border px-3 py-1 text-xs ${
              selectedRange === "today" ? "bg-[#000000] text-white" : "bg-white"
            }`}
            onClick={handleTodayClick}
          >
            Today
          </button>
          <button
            type="button"
            className={`rounded-full border px-3 py-1 text-xs ${
              selectedRange === "yesterday"
                ? "bg-[#000000] text-white"
                : "bg-white"
            }`}
            onClick={handleYesterdayClick}
          >
            Yesterday
          </button>
          <button
            type="button"
            className={`rounded-full border px-3 py-1 text-xs ${
              selectedRange === "daybeforeyesterday"
                ? "bg-[#000000] text-white"
                : "bg-white"
            }`}
            onClick={handleDayBeforeYesterdayClick}
          >
            {dayBeforeYesterday}
          </button>
        </div>
      </div>
      <div className="mx-6 date-picker-container">
        {isCustomDate && (
          <PopUp show={isCustomDate} onClose={() => setIsCustomDate(false)}>
            <div className="flex justify-center p-2 date-picker-container item-center">
              <DatePicker
                selected={startDate}
                onChange={(dates: any) => {
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

const DateRangePickerMemo = memo(DateRangePicker);
export default DateRangePickerMemo;
