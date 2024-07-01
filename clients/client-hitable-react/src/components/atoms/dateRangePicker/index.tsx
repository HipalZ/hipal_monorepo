import useTimings from '@/components/store/useTimings';
import { endOfDay, endOfMonth, startOfDay, startOfMonth, subDays } from 'date-fns';
import type React from 'react';
import { memo, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PopUp from '../popUp';

const DateRangePicker: React.FC = memo(() => {
    const { setInTime, setTimeStampStart, setTimeStampEnd, setOutTime, selectedRange, setSelectedRange } = useTimings();
    const [dayBeforeYesterday, setDayBeforeYesterday] = useState('');
    const [startDate, setStartDate] = useState(startOfDay(new Date()));
    const [endDate, setEndDate] = useState(endOfDay(new Date()));
    const [isCustomDate, setIsCustomDate] = useState(false);
    const formatDate = (date: Date) => {
        return `${String(date?.getDate())?.padStart(2, '0')}-${String(date?.getMonth() + 1)?.padStart(2, '0')}-${date?.getFullYear()}`;
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
        setSelectedRange('today');
        fetchReportForRange(startOfDay(new Date()), endOfDay(new Date()));
    };

    const handleYesterdayClick = () => {
        setSelectedRange('yesterday');
        const yesterday = subDays(new Date(), 1);
        fetchReportForRange(startOfDay(yesterday), endOfDay(yesterday));
    };

    const handleDayBeforeYesterdayClick = () => {
        setSelectedRange('daybeforeyesterday');
        const dayBeforeYesterday = subDays(new Date(), 2);
        fetchReportForRange(startOfDay(dayBeforeYesterday), endOfDay(dayBeforeYesterday));
    };
    

    useEffect(() => {
        const date = new Date();
        const dayBeforeYesterday = formatDate(subDays(date, 2));
        setDayBeforeYesterday(dayBeforeYesterday);
        if (selectedRange === 'today') {
            handleTodayClick();
        }
    }, []);

    return (
        <div className="flex items-center justify-between space-x-2 px-6 pt-4">
            <div className="sticky top-0">
                <div className="flex flex-wrap items-center justify-start space-x-2">
                    <button
                        type="button"
                        className={`rounded-full border px-3 py-1 text-xs ${selectedRange === 'today' ? 'bg-[#000000] text-white' : 'bg-white'}`}
                        onClick={handleTodayClick}
                    >
                        Today
          </button>
                    <button
                        type="button"
                        className={`rounded-full border px-3 py-1 text-xs ${selectedRange === 'yesterday' ? 'bg-[#000000] text-white' : 'bg-white'}`}
                        onClick={handleYesterdayClick}
                    >
                        Yesterday
          </button>
                    <button
                        type="button"
                        className={`rounded-full border px-3 py-1 text-xs ${selectedRange === 'daybeforeyesterday' ? 'bg-[#000000] text-white' : 'bg-white'}`}
                        onClick={handleDayBeforeYesterdayClick}
                    >
                        {dayBeforeYesterday}
                    </button>
                </div>
            </div>
            <div className="date-picker-container mx-6">
                {isCustomDate && (
                    <PopUp show={isCustomDate} onClose={() => setIsCustomDate(false)}>
                        <div className="date-picker-container item-center flex justify-center p-2">
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
});

export default DateRangePicker;
