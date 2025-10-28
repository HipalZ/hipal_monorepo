import BottomButton from '@/components/atom/bottomButton';
import PopUp from '@/components/atom/popUp';
import usePaginationStore from '@/components/store/usePaginationStore';
import useTimings from '@/components/store/useTimings';
import { endOfDay, endOfMonth, startOfDay, startOfMonth, subDays } from 'date-fns';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import EndDatePicker from './end';
import StartDatePicker from './start';

const formatDate = (date: Date) => {
  return `${String(date?.getDate()).padStart(2, '0')}-${String(date?.getMonth() + 1).padStart(2, '0')}-${date?.getFullYear()}`;
};

const DateRangePicker: React.FC = memo(() => {
  const setInTime = useTimings((s) => s.setInTime);
  const setTimeStampStart = useTimings((s) => s.setTimeStampStart);
  const setTimeStampEnd = useTimings((s) => s.setTimeStampEnd);
  const setOutTime = useTimings((s) => s.setOutTime);
  const selectedRange = useTimings((s) => s.selectedRange);
  const setSelectedRange = useTimings((s) => s.setSelectedRange);
  const startDate = useTimings((s) => s.startDate);
  const endDate = useTimings((s) => s.endDate);
  const setStartDate = useTimings((s) => s.setStartDate);
  const setEndDate = useTimings((s) => s.setEndDate);
  const { setPageNumber } = usePaginationStore((s) => ({
    setPageNumber: s.setPageNumber,
  }));
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [validationError, setValidationError] = useState('');

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
  }, [setSelectedRange, fetchReportForRange]);

  const handleCustomDatesClick = useCallback(() => {
    setSelectedRange('custom');
    setIsCustomDate(true);
    setValidationError('');
  }, [setSelectedRange]);

  const dateRangeDisplay = useMemo(() => {
    if (startDate && endDate) {
      return (
        <center className="w-full bg-[#8C63FF30] py-1 text-sm font-semibold text-[#8C63FF] md:ml-4 md:w-[21.25rem] md:text-base">
          selected date range: {formatDate(startDate)} - {formatDate(endDate)}
        </center>
      );
    }
    return '';
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedRange === 'today') {
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
  console.log('DateRangePicker Rendered', { selectedRange, startDate, endDate });
  return (
    <>
      <div className="flex items-center justify-between space-x-2 pl-4 pt-4">
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
        <div className="date-picker-container mx-6">
          {isCustomDate && (
            <PopUp
              hide
              show={isCustomDate}
              onClose={() => setIsCustomDate(false)}
              width="w-full max-w-[36rem]"
              height="h-[100dvh] md:h-[80dvh] lg:h-[30rem]"
            >
              <button
                type="button"
                className="absolute left-4 top-4 rounded-md border bg-[#ffffff] px-2 py-1 text-xs"
                onClick={() => setIsCustomDate(false)}
              >
                <FaArrowLeft className="mr-1" />
              </button>
              <h3 className="mt-4 text-center font-semibold">Select the Custom Date Range</h3>
              <div className="date-picker-container flex flex-col items-center pt-6">
                <div className="flex flex-col items-start lg:flex-row lg:gap-4">
                  <div>
                    <p className="text-sm font-medium">Start Date:</p>
                    <StartDatePicker
                      startDate={startDate}
                      endDate={endDate}
                      setStartDate={(date) => {
                        setStartDate(date);
                        if (date > endDate) {
                          setValidationError('Start date cannot be after end date.');
                        } else {
                          setValidationError('');
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
                          setValidationError('End date cannot be before start date.');
                        } else {
                          setValidationError('');
                        }
                      }}
                      setValidationError={setValidationError}
                    />
                  </div>
                </div>
                {validationError && <p className="mt-2 text-sm font-medium text-red-600">{validationError}</p>}
                <BottomButton
                  buttons={[
                    {
                      text: 'Save',
                      onClick: handleSave,
                    },
                  ]}
                />
              </div>
            </PopUp>
          )}
        </div>
      </div>
      <div className="mt-4 w-full max-w-[28rem]">{dateRangeDisplay}</div>
    </>
  );
});

export default memo(DateRangePicker);
