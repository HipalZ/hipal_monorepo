// DateRangePicker.tsx

import { memo, useCallback, useEffect, useState } from "react";
import PopUp from "@/components/atom/popUp";
import usePaginationStore from "@/components/store/usePaginationStore";
import useTimings from "@/components/store/useTimings";
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import StartDatePicker from "./start";
import EndDatePicker from "./end";

const formatDate = (date: Date) => {
  return `${String(date?.getDate()).padStart(2, "0")}-${String(
    date?.getMonth() + 1,
  ).padStart(2, "0")}-${date?.getFullYear()}`;
};

const DateRangePicker: React.FC = memo(() => {
  const {
    setInTime,
    setTimeStampStart,
    setTimeStampEnd,
    setOutTime,
    selectedRange,
    setSelectedRange,
  } = useTimings();
  const { setPageNumber } = usePaginationStore((s) => ({
    setPageNumber: s.setPageNumber,
  }));
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [validationError, setValidationError] = useState("");

  const fetchReportForRange = useCallback(
    (start: Date, end: Date) => {
      setStartDate(start);
      setTimeStampStart(Date.parse(start.toString()));
      setEndDate(end);
      setTimeStampEnd(Date.parse(end.toString()));
      setInTime(formatDate(start));
      setOutTime(formatDate(end));
      setPageNumber(1);
    },
    [setTimeStampStart, setTimeStampEnd, setInTime, setOutTime, setPageNumber],
  );

  const handleTodayClick = useCallback(() => {
    setSelectedRange("today");
    fetchReportForRange(startOfDay(new Date()), endOfDay(new Date()));
  }, [setSelectedRange, fetchReportForRange]);

  const handleYesterdayClick = useCallback(() => {
    setSelectedRange("yesterday");
    const yesterday = subDays(new Date(), 1);
    fetchReportForRange(startOfDay(yesterday), endOfDay(yesterday));
  }, [setSelectedRange, fetchReportForRange]);

  const handleThisMonthClick = useCallback(() => {
    setSelectedRange("thisMonth");
    fetchReportForRange(startOfMonth(new Date()), endOfMonth(new Date()));
  }, [setSelectedRange, fetchReportForRange]);

  const handleCustomDatesClick = useCallback(() => {
    setSelectedRange("custom");
    setIsCustomDate(true);
    setValidationError("");
  }, [setSelectedRange]);

  useEffect(() => {
    if (selectedRange === "today") {
      handleTodayClick();
    }
  }, [selectedRange, handleTodayClick]);

  const handleSave = () => {
    if (validationError) {
      // Do not proceed if there's a validation error
      return;
    }
    fetchReportForRange(startDate, endDate);
    setIsCustomDate(false);
  };

  return (
    <div className="flex items-center justify-between pt-4 pl-4 space-x-2">
      <div className="sticky top-0">
        <div className="flex flex-wrap items-center justify-start space-x-2">
          {/* Your range buttons here */}
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${
              selectedRange === "today" ? "bg-[#000000] text-white" : "bg-white"
            }`}
            onClick={handleTodayClick}
          >
            Today
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${
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
            className={`rounded-md border px-2 py-1 text-xs ${
              selectedRange === "thisMonth"
                ? "bg-[#000000] text-white"
                : "bg-white"
            }`}
            onClick={handleThisMonthClick}
          >
            This Month
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs ${
              selectedRange === "custom"
                ? "bg-[#000000] text-white"
                : "bg-white"
            }`}
            onClick={handleCustomDatesClick}
          >
            Custom dates
          </button>
        </div>
      </div>
      <div className="mx-6 date-picker-container">
        {isCustomDate && (
          <PopUp
            hide
            show={isCustomDate}
            onClose={() => setIsCustomDate(false)}
            width="w-full max-w-[30rem]"
            height="h-[100dvh] md:h-[30rem]"
          >
            <h3 className="mt-6 font-semibold text-center">
              Select the Custom Date Range
            </h3>
            <div className="flex flex-col items-center pt-6 date-picker-container">
              <div className="flex flex-col items-start">
                <div>
                  <p className="text-sm font-medium">Start Date:</p>
                  <StartDatePicker
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={(date) => {
                      setStartDate(date);
                      if (date > endDate) {
                        setValidationError(
                          "Start date cannot be after end date.",
                        );
                      } else {
                        setValidationError("");
                      }
                    }}
                    setValidationError={setValidationError}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">End Date:</p>
                  <EndDatePicker
                    startDate={startDate}
                    endDate={endDate}
                    setEndDate={(date) => {
                      setEndDate(date);
                      if (date < startDate) {
                        setValidationError(
                          "End date cannot be before start date.",
                        );
                      } else {
                        setValidationError("");
                      }
                    }}
                    setValidationError={setValidationError}
                  />
                </div>
              </div>
              {validationError && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {validationError}
                </p>
              )}
              <button
                onClick={handleSave}
                type="button"
                className="mt-4 py-3 rounded-full text-white w-[92%] bg-black"
              >
                Save
              </button>
            </div>
          </PopUp>
        )}
      </div>
    </div>
  );
});

export default memo(DateRangePicker);
