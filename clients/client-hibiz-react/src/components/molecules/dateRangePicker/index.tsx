// DateRangePicker.tsx
import BottomButton from '@/components/atom/bottomButton';
import PopUp from '@/components/atom/popUp';
import useBusinessData from '@/components/store/useBusinessData';
import usePaginationStore from '@/components/store/usePaginationStore';
import useTimings, { type PresetRange } from '@/components/store/useTimings';
import { format as dfFormat, endOfDay, endOfMonth, isSameDay, setHours, setMinutes, startOfDay, startOfMonth, subDays } from 'date-fns';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';

const fmtDateTime = (date: Date) => dfFormat(date, 'dd-MM-yyyy hh:mm a');

// day bounds for a given date (used to create valid min/max time pairs)
const dayStart = (d: Date) => setMinutes(setHours(new Date(d), 0), 0); // 00:00
const dayEnd = (d: Date) => setMinutes(setHours(new Date(d), 23), 59); // 23:59

// Helper: compute date range for a preset (calendar-only)
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

// ---- billing helpers ----

// HHmm → { h, m }  (e.g. 200 → {2, 0})
const parseHHmm = (value?: number | null): { h: number; m: number } | null => {
  if (value == null || value < 0) return null;
  const h = Math.floor(value / 100);
  const m = value % 100;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
};

const setTimeFromHHmm = (base: Date, value?: number | null): Date => {
  const parsed = parseHHmm(value);
  if (!parsed) return base;
  const d = new Date(base);
  d.setHours(parsed.h, parsed.m, 0, 0);
  return d;
};

/**
 * Apply billing times (startBillTime, endBillTime / extendBillTime) to a base range.
 *
 * ✅ Rules:
 *  - If business has **no billing times** configured → keep plain calendar range:
 *      start = baseStart (00:00)
 *      end   = baseEnd   (23:59)
 *    → i.e. 12 AM to 11:59 PM.
 *
 *  - If billing times exist:
 *      billingStartDay = startOfDay(baseStart)
 *      billingEndDay   = startOfDay(baseEnd)
 *
 *      start = startBillTime on billingStartDay
 *      end   = closingTime (endBillTime or extendBillTime) on (billingEndDay + 1 day)
 *
 *  Examples (for a single day, say "today" = 1 Dec):
 *   - startBillTime = 101, endBillTime = 100:
 *       Today preset → 1 Dec 01:01 → 2 Dec 01:00
 *   - Yesterday preset (30 Nov):
 *       30 Nov 01:01 → 1 Dec 01:00
 *
 *  For multi-day (Last 7 Days):
 *   - start = 7 days ago @ startBillTime
 *   - end   = (today + 1 day) @ closingTime
 */
const applyBillingTimesToRange = (baseStart: Date, baseEnd: Date, outletInfo: any | null, useExtended: boolean): { start: Date; end: Date } => {
  if (!outletInfo) return { start: baseStart, end: baseEnd };

  const startBillTime = outletInfo?.startBillTime as number | undefined;
  const endBillTime = outletInfo?.endBillTime as number | undefined;
  const extendBillTime = outletInfo?.extendBillTime as number | undefined;

  const hasStart = parseHHmm(startBillTime);
  const hasEnd = parseHHmm(endBillTime);
  const hasExtend = parseHHmm(extendBillTime);

  // No billing config → use plain calendar day (12am–11:59pm)
  if (!hasStart && !hasEnd && !hasExtend) {
    return { start: baseStart, end: baseEnd };
  }

  const billingStartDay = startOfDay(baseStart);
  const billingEndDay = startOfDay(baseEnd);

  let start = billingStartDay;

  if (hasStart) {
    start = setTimeFromHHmm(billingStartDay, startBillTime);
  }

  // Choose which closing time to use
  let closingTime: number | null = null;
  if (useExtended && hasExtend) {
    closingTime = extendBillTime!;
  } else if (hasEnd) {
    closingTime = endBillTime!;
  } else if (hasExtend) {
    closingTime = extendBillTime!;
  }

  if (closingTime == null) {
    // no valid closing time → just keep calendar end
    return { start, end: baseEnd };
  }

  // End = closing time on (billingEndDay + 1)
  const dayAfterEnd = new Date(billingEndDay);
  dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
  const end = setTimeFromHHmm(dayAfterEnd, closingTime);

  return { start, end };
};

const DateRangePicker = () => {
  // store
  const selectedRange = useTimings((s) => s.selectedRange);
  const setSelectedRange = useTimings((s) => s.setSelectedRange);
  const startDate = useTimings((s) => s.startDate);
  const endDate = useTimings((s) => s.endDate);
  const setRange = useTimings((s) => s.setRange);
  const setInTime = useTimings((s) => s.setInTime);
  const setOutTime = useTimings((s) => s.setOutTime);
  const useExtendedTime = useTimings((s) => s.useExtendedTime);
  const setUseExtendedTime = useTimings((s) => s.setUseExtendedTime);

  const setPageNumber = usePaginationStore((s) => s.setPageNumber);
  const outletInfo = useBusinessData((s) => s.outletInfo);

  const [isCustomDate, setIsCustomDate] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [tempStart, setTempStart] = useState<Date>(startDate ?? new Date());
  const [tempEnd, setTempEnd] = useState<Date>(endDate ?? new Date());

  // keep tempStart / tempEnd in sync when store range changes (outside modal)
  useEffect(() => {
    if (!isCustomDate) {
      setTempStart(startDate ?? new Date());
      setTempEnd(endDate ?? new Date());
    }
  }, [startDate, endDate, isCustomDate]);

  const applyRange = useCallback(
    (s: Date, e: Date) => {
      const curS = startDate?.getTime();
      const curE = endDate?.getTime();
      const nextS = s.getTime();
      const nextE = e.getTime();
      if (curS === nextS && curE === nextE) return;

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

      // 1️⃣ calendar range for the label (today, yesterday, etc.)
      let { start, end } = computePresetRange(preset);
      // 2️⃣ overlay billing times (24h cycles, per business)
      ({ start, end } = applyBillingTimesToRange(start, end, outletInfo, useExtendedTime));

      setTempStart(start);
      setTempEnd(end);
      setValidationError('');
      setIsCustomDate(true);
    },
    [selectedRange, setSelectedRange, outletInfo, useExtendedTime],
  );

  const dateRangeDisplay = useMemo(() => {
    if (!startDate || !endDate) return null;
    return (
      <center className="w-full bg-[#8C63FF30] py-1 text-sm font-semibold text-[#8C63FF] md:ml-4 md:w-[28rem] md:text-sm">
        Selected: {fmtDateTime(startDate)} – {fmtDateTime(endDate)}
      </center>
    );
  }, [startDate, endDate]);

  /**
   * 🔁 Per-business billing:
   * Whenever the outlet's `businessId` changes, align the range to that
   * business's billing window for the **current preset** (today/yesterday/etc.).
   */
  const lastBusinessIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!outletInfo) return;

    const currentBusinessId = String(outletInfo.businessId ?? '');
    const prevBusinessId = lastBusinessIdRef.current;

    if (prevBusinessId === currentBusinessId && prevBusinessId !== null) return;
    lastBusinessIdRef.current = currentBusinessId;

    const { selectedRange: curPreset, useExtendedTime: extFlag } = useTimings.getState();

    const preset: PresetRange = curPreset === 'custom' ? 'today' : curPreset;

    let { start, end } = computePresetRange(preset);
    ({ start, end } = applyBillingTimesToRange(start, end, outletInfo, extFlag));

    applyRange(start, end);
  }, [outletInfo?.businessId, applyRange]);

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
    return {}; // omit both if cross-day (e.g. billing 24h window)
  }, [tempStart, tempEnd]);

  const endPickerTimes = useMemo(() => {
    if (tempStart && tempEnd && isSameDay(tempStart, tempEnd)) {
      return {
        minTime: new Date(tempEnd.getFullYear(), tempEnd.getMonth(), tempEnd.getDate(), tempStart.getHours(), tempStart.getMinutes(), 0, 0),
        maxTime: dayEnd(tempEnd), // 23:59 of that day
      };
    }
    return {}; // omit for cross-day
  }, [tempStart, tempEnd]);

  /**
   * 🔘 Extended time checkbox:
   *
   * - ON  → recompute window using `extendBillTime` as closing time.
   * - OFF → recompute window using `endBillTime` as closing time.
   *
   * Anchored on the **billing day of tempStart**:
   *   billingDay = startOfDay(tempStart)
   *   range = [billingDay @ startBillTime → (billingDay or rangeEnd) +1 day @ closingTime]
   */
  const handleToggleExtended = () => {
    const next = !useExtendedTime;
    setUseExtendedTime(next);

    if (!outletInfo) return;

    const anchorDay = startOfDay(tempStart ?? new Date());
    const endDayForAnchor = endOfDay(anchorDay);

    const { start, end } = applyBillingTimesToRange(anchorDay, endDayForAnchor, outletInfo, next);

    setTempStart(start);
    setTempEnd(end);
  };

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
              <h3 className="mt-4 text-center font-semibold">Pick your date &amp; time range</h3>

              {/* Checkbox: include extended billing time */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <input
                  id="useExtendedTime"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#8C63FF] focus:ring-[#8C63FF]"
                  checked={useExtendedTime}
                  onChange={handleToggleExtended}
                />
                <label htmlFor="useExtendedTime" className="text-xs text-slate-700">
                  Include extended billing time (use extended closing)
                </label>
              </div>

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
                      {...endPickerTimes}
                      maxDate={(() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1); // today + 1 day cap
                        return d;
                      })()}
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
