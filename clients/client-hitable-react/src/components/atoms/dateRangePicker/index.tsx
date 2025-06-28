import useTimings from "@/components/store/useTimings";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { memo, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = () => {
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

  const formatDate = (date: Date) => {
    return `${String(date?.getDate())?.padStart(2, "0")}-${String(
      date?.getMonth() + 1,
    )?.padStart(2, "0")}-${date?.getFullYear()}`;
  };

  const fetchReportForRange = (start: Date, end: Date) => {
    // do not place the optional chaining operator here
    setTimeStampStart(Date.parse(start.toString()));
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
    </div>
  );
};

const DateRangePickerMemo = memo(DateRangePicker);
export default DateRangePickerMemo;
