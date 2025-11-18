import BottomButton from '@/components/atom/bottomButton';
import PopUp from '@/components/atom/popUp';
import usePaginationStore from '@/components/store/usePaginationStore';
import useTimings, { type PresetRange } from '@/components/store/useTimings';
import { format as dfFormat, endOfDay, endOfMonth, isSameDay, setHours, setMinutes, startOfDay, startOfMonth, subDays } from 'date-fns';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';

const fmtDateTime = (date: Date) => dfFormat(date, 'dd-MM-yyyy hh:mm a');

// day bounds for a given date (used to create valid min/max time pairs)
const dayStart = (d: Date) => setMinutes(setHours(new Date(d), 0), 0); // 00:00
const dayEnd = (d: Date) => setMinutes(setHours(new Date(d), 23), 59); // 23:59

// Helper: compute date range for a preset (defaults to day bounds)
function computePresetRange(preset: PresetRange): { start: Date; end: Date } {
  const now = new Date();
  switch (preset) {
    case 'today': {
      return { start: startOfDay(now), end: endOfDay(now) };
    }
    case 'yesterday': {
      const y = subDays(now, 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case 'last7': {
      const s = startOfDay(subDays(now, 6));
      const e = endOfDay(now);
      return { start: s, end: e };
    }
    case 'thisMonth': {
      return { start: startOfDay(startOfMonth(now)), end: endOfDay(endOfMonth(now)) };
    }
    case 'custom':
    default:
      return { start: now, end: now };
  }
}

const DateRangePicker = () => {
  // store
  const selectedRange = useTimings((s) => s.selectedRange);
  const setSelectedRange = useTimings((s) => s.setSelectedRange);
  const startDate = useTimings((s) => s.startDate);
  const endDate = useTimings((s) => s.endDate);
  const setRange = useTimings((s) => s.setRange);
  const setInTime = useTimings((s) => s.setInTime);
  const setOutTime = useTimings((s) => s.setOutTime);

  const setPageNumber = usePaginationStore((s) => s.setPageNumber);

  const [isCustomDate, setIsCustomDate] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [tempStart, setTempStart] = useState<Date>(startDate ?? new Date());
  const [tempEnd, setTempEnd] = useState<Date>(endDate ?? new Date());

  const applyRange = useCallback(
    (s: Date, e: Date) => {
      const curS = startDate?.getTime();
      const curE = endDate?.getTime();
      const nextS = s.getTime();
      const nextE = e.getTime();
      if (curS === nextS && curE === nextE) return; // no-op

      setRange({ startDate: s, endDate: e });
      setInTime(fmtDateTime(s));
      setOutTime(fmtDateTime(e));
      setPageNumber(1);
    },
    [startDate, endDate, setRange, setInTime, setOutTime, setPageNumber],
  );

  const quickPick = useCallback(
    (preset: PresetRange) => {
      if (selectedRange !== preset) setSelectedRange(preset);

      const { start, end } = computePresetRange(preset);
      setTempStart(start);
      setTempEnd(end);
      setValidationError('');
      setIsCustomDate(true);
    },
    [selectedRange, setSelectedRange],
  );

  const dateRangeDisplay = useMemo(() => {
    if (!startDate || !endDate) return null;
    return (
      <center className="w-full bg-[#8C63FF30] py-1 text-sm font-semibold text-[#8C63FF] md:ml-4 md:w-[28rem] md:text-sm">
        Selected: {fmtDateTime(startDate)} – {fmtDateTime(endDate)}
      </center>
    );
  }, [startDate, endDate]);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    const sToday = startOfDay(new Date()).getTime();
    const eToday = endOfDay(new Date()).getTime();
    const curS = startDate?.getTime();
    const curE = endDate?.getTime();

    if (curS !== sToday || curE !== eToday || selectedRange !== 'today') {
      // silent apply (no modal)
      const { start, end } = computePresetRange('today');
      setSelectedRange('today');
      applyRange(start, end);
    }
    initializedRef.current = true;
  }, [startDate, endDate, selectedRange, setSelectedRange, applyRange]);

  const onSaveCustom = () => {
    if (validationError) return;
    applyRange(tempStart, tempEnd);
    setIsCustomDate(false);
  };

  const startPickerTimes = useMemo(() => {
    if (tempStart && tempEnd && isSameDay(tempStart, tempEnd)) {
      return {
        minTime: dayStart(tempStart), // 00:00 of that day
        maxTime: new Date(tempStart.getFullYear(), tempStart.getMonth(), tempStart.getDate(), tempEnd.getHours(), tempEnd.getMinutes(), 0, 0),
      };
    }
    return {}; // omit both
  }, [tempStart, tempEnd]);

  const endPickerTimes = useMemo(() => {
    if (tempStart && tempEnd && isSameDay(tempStart, tempEnd)) {
      return {
        minTime: new Date(tempEnd.getFullYear(), tempEnd.getMonth(), tempEnd.getDate(), tempStart.getHours(), tempStart.getMinutes(), 0, 0),
        maxTime: dayEnd(tempEnd), // 23:59 of that day
      };
    }
    return {}; // omit both
  }, [tempStart, tempEnd]);

  return (
    <>
      <div className="flex items-center justify-between space-x-2 pl-4 pt-4">
        <div className="sticky top-0 overflow-hidden">
          <div className="flex w-full max-w-[30rem] gap-2 overflow-x-auto text-nowrap px-4 md:max-w-full">
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'today' ? 'bg-black text-white' : 'bg-white'}`}
              onClick={() => quickPick('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'yesterday' ? 'bg-black text-white' : 'bg-white'}`}
              onClick={() => quickPick('yesterday')}
            >
              Yesterday
            </button>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'last7' ? 'bg-black text-white' : 'bg-white'}`}
              onClick={() => quickPick('last7')}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'thisMonth' ? 'bg-black text-white' : 'bg-white'}`}
              onClick={() => quickPick('thisMonth')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${selectedRange === 'custom' ? 'bg-black text-white' : 'bg-white'}`}
              onClick={() => quickPick('custom')}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Modal for ALL presets to tweak time */}
        <div className="date-picker-container mx-6">
          {isCustomDate && (
            <PopUp
              rightTopBack
              show={isCustomDate}
              onClose={() => setIsCustomDate(false)}
              width="w-full max-w-[48rem]"
              height="h-[100dvh] md:h-[80dvh] lg:h-[30rem]"
              hide
            >
              <h3 className="mt-4 text-center font-semibold">Pick your date & time range</h3>

              <div className="pt-6">
                <div className="flex h-[90dvh] w-full flex-col gap-6 overflow-auto pb-[10rem] text-center lg:flex-row lg:items-start lg:justify-center">
                  {/* Start DateTime */}
                  <div>
                    <p className="mb-2 text-sm font-medium">Start</p>
                    <DatePicker
                      selected={tempStart}
                      onChange={(date: Date) => {
                        const next = date ?? tempStart;
                        setTempStart(next);
                        if (next > tempEnd) setValidationError('Start cannot be after End.');
                        else setValidationError('');
                      }}
                      showTimeSelect
                      timeIntervals={1}
                      timeCaption="Time"
                      dateFormat="dd-MM-yyyy hh:mm aa"
                      maxDate={tempEnd || new Date()}
                      // pass BOTH or NONE
                      {...startPickerTimes}
                      inline
                    />
                  </div>

                  {/* End DateTime */}
                  <div>
                    <p className="mb-2 text-sm font-medium">End</p>
                    <DatePicker
                      selected={tempEnd}
                      onChange={(date: Date) => {
                        const next = date ?? tempEnd;
                        setTempEnd(next);
                        if (next < tempStart) setValidationError('End cannot be before Start.');
                        else setValidationError('');
                      }}
                      showTimeSelect
                      timeIntervals={1}
                      timeCaption="Time"
                      dateFormat="dd-MM-yyyy hh:mm aa"
                      minDate={tempStart}
                      // pass BOTH or NONE
                      {...endPickerTimes}
                      maxDate={new Date()}
                      inline
                    />
                  </div>
                </div>

                {validationError && <p className="mt-2 text-sm font-medium text-red-600">{validationError}</p>}

                <BottomButton
                  buttons={[
                    {
                      text: 'Apply',
                      onClick: onSaveCustom,
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
};

export default memo(DateRangePicker);
