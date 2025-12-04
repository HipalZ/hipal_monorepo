import useBusinessData from '@/components/store/useBusinessData';
import { useOutletFormStore } from '@/components/store/useOutlet';
import { apiRpc } from '@hi/common';
import { memo, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import toast from 'react-hot-toast';

import { motion } from 'framer-motion';
import { Clock4 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ---------- Types ----------

type OutletFormData = {
  _id?: string | null;

  // UI-only time strings: "HH:mm"
  endTime?: string | null;
  extendEndTime?: string | null;

  // Stored numeric times from DB (HHmm)
  startBillTime?: number | null;
  endBillTime?: number | null;
  extendBillTime?: number | null;

  branchName?: string | null;
  brandName?: string | null;
  placeId?: string | null;
  placeUrl?: string | null;
  url?: string | null;

  // allow extra fields from store without TS errors
  [key: string]: any;
};

type BusinessData = {
  _id?: string;
  name?: string;
  [key: string]: any;
} | null;

// ---------- Time helpers ----------

// "HH:mm" -> number HHmm (e.g. "14:30" -> 1430)
const timeStringToNumberHHmm = (time?: string | number | null): number => {
  if (time == null) return 0;

  // If we already have a number in HHmm format, trust it (but sanity-check)
  if (typeof time === 'number') {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    if (Number.isFinite(hours) && Number.isFinite(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return time;
    }
    return 0;
  }

  if (typeof time !== 'string') return 0;
  if (!time.includes(':')) return 0;

  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  if (h < 0 || h > 23 || m < 0 || m > 59) return 0;

  return h * 100 + m;
};

// number HHmm -> "HH:mm" (e.g. 1430 -> "14:30")
const numberHHmmToTimeString = (val?: number | null): string => {
  if (val == null || val <= 0) return '';
  const hours = Math.floor(val / 100);
  const minutes = val % 100;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return '';
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

// add 1 minute to HHmm, wrap 24h
const addOneMinuteHHmm = (val: number): number => {
  if (!val || val < 0) return 0;
  const hours = Math.floor(val / 100);
  const minutes = val % 100;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;

  let total = hours * 60 + minutes + 1;
  total = (total + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h * 100 + m;
};

// add 30 minutes to "HH:mm" and wrap 24h
const addThirtyMinutesToTimeString = (input?: string | number | null): string => {
  if (input == null) return '';

  let timeStr: string;

  if (typeof input === 'number') {
    // treat as HHmm
    const hours = Math.floor(input / 100);
    const minutes = input % 100;
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return '';
    }
    timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else if (typeof input === 'string') {
    timeStr = input;
  } else {
    return '';
  }

  if (!timeStr.includes(':')) return '';

  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';

  let total = h * 60 + m + 30;
  total = (total + 24 * 60) % (24 * 60);

  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

export const convertTo12HourFormat = (input?: string | number | null): string => {
  if (input == null) return '';

  let timeStr: string;

  if (typeof input === 'number') {
    const hours = Math.floor(input / 100);
    const minutes = input % 100;
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return '';
    }
    timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else if (typeof input === 'string') {
    timeStr = input;
  } else {
    return '';
  }

  if (!timeStr.includes(':')) return '';

  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';

  const period = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12;

  return `${adjustedHours.toString().padStart(2, '0')}:${minutesStr.toString().padStart(2, '0')} ${period}`;
};

// build 30-min interval options
const HALF_HOUR_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? 0 : 30;
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const value = `${hh}:${mm}`; // "HH:mm"
  const label = convertTo12HourFormat(value); // "hh:mm AM/PM"
  return { value, label };
});

// ---------- Reusable timing card ----------

interface TimingCardProps {
  label: string;
  description?: string;
  value?: string | null;
  readOnly?: boolean;
  onChange?: (val: string) => void;
}

const TimingCard = ({ label, description, value, readOnly, onChange }: TimingCardProps) => {
  const [open, setOpen] = useState(false);

  const display = value ? convertTo12HourFormat(value) : 'Not set';

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card className="flex h-full flex-col justify-between border border-violet-100 bg-gradient-to-b from-white to-violet-50/40 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock4 className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-sm font-semibold text-slate-800">{label}</CardTitle>
          </div>
          {description && <CardDescription className="mt-1 text-xs text-slate-500">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          <div className="text-xs text-slate-500">Selected</div>
          <div className="flex items-center justify-between rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-medium text-violet-700">
            <span>{display}</span>
          </div>

          {!readOnly && onChange && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 border-violet-200 text-xs hover:bg-violet-50">
                  Change time
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Clock4 className="h-4 w-4 text-violet-500" />
                    {label}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-slate-500">
                    Choose a time in <span className="font-semibold">30 min</span> intervals.
                  </p>
                  <Select
                    value={value || undefined}
                    onValueChange={(val) => {
                      onChange(val);
                      setOpen(false);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {HALF_HOUR_SLOTS.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value} className="text-xs">
                            {slot.label} ({slot.value})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ---------- Main form ----------

const MemoOutletForm: React.FC = () => {
  const { formData: rawFormData, setFormData: rawSetFormData } = useOutletFormStore((s) => ({
    formData: s.formData,
    setFormData: s.setFormData,
  }));

  const formData = (rawFormData || {}) as OutletFormData;

  // Wrap setFormData to be TS-safe for OutletFormData keys
  const setFormData = <K extends keyof OutletFormData>(key: K, value: OutletFormData[K]) => {
    (rawSetFormData as (k: string, v: any) => void)(key as string, value);
  };

  const businessData = useBusinessData((s) => s.businessData) as BusinessData;

  const handleInputChange = (key: keyof OutletFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(key, e.target.value);
  };

  // Map existing numeric DB times -> UI string times (first load / edit mode)
  useEffect(() => {
    if (!formData.endTime && typeof formData.endBillTime === 'number' && formData.endBillTime > 0) {
      setFormData('endTime', numberHHmmToTimeString(formData.endBillTime));
    }

    if (!formData.extendEndTime && typeof formData.extendBillTime === 'number' && formData.extendBillTime > 0) {
      setFormData('extendEndTime', numberHHmmToTimeString(formData.extendBillTime));
    }
  }, [formData.endTime, formData.extendEndTime, formData.endBillTime, formData.extendBillTime]);

  // Derived: auto start time = 1 minute after closing
  const { autoStartTimeStr, closingTimeStr, extendClosingTimeStr } = useMemo(() => {
    const closing = formData.endTime || '';
    const extend = formData.extendEndTime || '';

    const closingNum = closing ? timeStringToNumberHHmm(closing) : 0;
    const autoStartNum = closing ? addOneMinuteHHmm(closingNum) : 0;

    const autoStartStr = closing ? numberHHmmToTimeString(autoStartNum) : '';

    return {
      autoStartTimeStr: autoStartStr,
      closingTimeStr: closing,
      extendClosingTimeStr: extend,
    };
  }, [formData.endTime, formData.extendEndTime]);

  // When closing time changes, extended must be > closing,
  // and auto-bumped by 30 minutes if needed.
  const handleClosingTimeChange = (val: string) => {
    setFormData('endTime', val);

    if (!val) {
      // If user clears closing time, also clear extend + derived numeric fields
      setFormData('extendEndTime', '');
      setFormData('endBillTime', null);
      setFormData('extendBillTime', null);
      setFormData('startBillTime', null);
      return;
    }

    const closingNum = timeStringToNumberHHmm(val);
    setFormData('endBillTime', closingNum);

    const currentExtendStr = formData.extendEndTime || '';
    const currentExtendNum = currentExtendStr ? timeStringToNumberHHmm(currentExtendStr) : 0;

    // If no extend time, or extend <= closing → bump by 30 mins
    if (!currentExtendStr || currentExtendNum <= closingNum) {
      const newExtendStr = addThirtyMinutesToTimeString(val);
      setFormData('extendEndTime', newExtendStr);
      setFormData('extendBillTime', timeStringToNumberHHmm(newExtendStr));
    }
  };

  // When extend time changes, ensure it is > closing time
  const handleExtendTimeChange = (val: string) => {
    if (!val) {
      setFormData('extendEndTime', '');
      setFormData('extendBillTime', null);
      return;
    }

    const closingStr = formData.endTime || '';
    const closingNum = closingStr ? timeStringToNumberHHmm(closingStr) : 0;
    const extendNum = timeStringToNumberHHmm(val);

    if (closingStr && extendNum <= closingNum) {
      const newExtendStr = addThirtyMinutesToTimeString(closingStr);
      setFormData('extendEndTime', newExtendStr);
      setFormData('extendBillTime', timeStringToNumberHHmm(newExtendStr));
    } else {
      setFormData('extendEndTime', val);
      setFormData('extendBillTime', extendNum);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const closingNum = closingTimeStr ? timeStringToNumberHHmm(closingTimeStr) : 0;
    const extendNum = extendClosingTimeStr ? timeStringToNumberHHmm(extendClosingTimeStr) : 0;
    const startNum = closingTimeStr ? addOneMinuteHHmm(closingNum) : 0;

    const requestBody = {
      // numeric keys used by backend (0 means "not set")
      startBillTime: startNum || 0,
      endBillTime: closingNum || 0,
      extendBillTime: extendNum || 0,

      branchName: formData.branchName || '',
      brandName: formData.brandName || '',
      businessId: businessData?._id || '',
      name: businessData?.name || '',
      placeId: formData.placeId || '',
      placeUrl: formData.placeUrl || '',
      url: formData.url || '',
    };
    const filterRequestBody = Object.fromEntries(Object.entries(requestBody).filter(([_, v]) => v != null && v !== ''));

    let res: Response | undefined;
    try {
      if (formData._id) {
        res = await apiRpc.businesses.outletInfo.update[':businessId'].$put({
          param: {
            businessId: businessData?._id ?? '',
          },
          json: filterRequestBody,
        });
      } else {
        res = await apiRpc.businesses.outletInfo.$post({
          json: filterRequestBody,
        });
      }

      if (res && (res.status === 201 || res.status === 200)) {
        toast.success('Outlet information saved successfully');
      } else {
        toast.error('Failed to save outlet information');
      }
    } catch (error) {
      toast.error('Error saving outlet information');
      console.error('Error saving outlet information:', error);
    }
  };

  const billingSummary =
    autoStartTimeStr && closingTimeStr
      ? `Billing cycle: ${convertTo12HourFormat(autoStartTimeStr)} → ${convertTo12HourFormat(closingTimeStr)}${
          extendClosingTimeStr ? ` (extended till ${convertTo12HourFormat(extendClosingTimeStr)})` : ''
        }`
      : 'No billing cycle configured yet';

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-4 pb-[5rem] lg:grid-cols-2">
      {/* 🕒 Card 1: Timing Section */}
      <section className="mx-4 mt-6 space-y-3 lg:col-span-2">
        <h2 className="text-base font-semibold text-slate-800">Outlet Billing Timings</h2>

        <motion.div layout className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-2">
            <p className="text-xs font-medium text-violet-700">{billingSummary}</p>
            <p className="text-[11px] text-slate-500">
              Start time is <span className="font-semibold">automatically</span> set to{' '}
              <span className="font-semibold">1 minute after closing time</span> to complete a full 24-hour cycle. You only choose{' '}
              <span className="font-semibold">Closing</span> and <span className="font-semibold">Extended Closing</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TimingCard label="Closing Time" description="Main outlet closing time." value={closingTimeStr} onChange={handleClosingTimeChange} />
            <TimingCard
              label="Extended Closing Time"
              description="Extra grace billing window."
              value={extendClosingTimeStr}
              onChange={handleExtendTimeChange}
            />
            <TimingCard label="Auto Start Time" description="1 minute after closing." value={autoStartTimeStr} readOnly />
          </div>
        </motion.div>
      </section>

      {/* 🏪 Card 2: Outlet Name / Brand */}
      <section className="mx-4 mt-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Outlet Details</h3>
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="relative">
            <input
              type="text"
              id="brandName"
              value={formData.brandName ?? ''}
              onChange={handleInputChange('brandName')}
              className="bg-base-100 dark:text-base-100 peer block w-full rounded-2xl border border-gray-300 pb-3 pl-4 pr-4 pt-3 text-sm text-slate-900 focus:border-violet-500 focus:outline-none dark:border-gray-600"
              maxLength={21}
            />
            <label
              htmlFor="brandName"
              className="bg-base-100 absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-xs text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-violet-600 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-violet-400"
            >
              Brand Name
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="branchName"
              value={formData.branchName ?? ''}
              onChange={handleInputChange('branchName')}
              className="bg-base-100 dark:text-base-100 peer block w-full rounded-2xl border border-gray-300 pb-3 pl-4 pr-4 pt-3 text-sm text-slate-900 focus:border-violet-500 focus:outline-none dark:border-gray-600"
              maxLength={21}
            />
            <label
              htmlFor="branchName"
              className="bg-base-100 absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-xs text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-violet-600 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-violet-400"
            >
              Branch Name
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="url"
              value={formData.url ?? ''}
              onChange={handleInputChange('url')}
              className="bg-base-100 dark:text-base-100 peer block w-full rounded-2xl border border-gray-300 pb-3 pl-4 pr-4 pt-3 text-sm text-slate-900 focus:border-violet-500 focus:outline-none dark:border-gray-600"
            />
            <label
              htmlFor="url"
              className="bg-base-100 absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-xs text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-violet-600 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-violet-400"
            >
              Outlet Public URL (optional)
            </label>
          </div>
        </section>
      </section>

      {/* ⭐ Card 3: Google Review Section */}
      <section className="mx-4 mt-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Google Review Section</h3>
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="relative">
            <input
              type="text"
              id="placeUrl"
              value={formData.placeUrl ?? ''}
              onChange={handleInputChange('placeUrl')}
              className="bg-base-100 dark:text-base-100 peer block w-full rounded-2xl border border-gray-300 pb-3 pl-4 pr-4 pt-3 text-sm text-slate-900 focus:border-violet-500 focus:outline-none dark:border-gray-600"
            />
            <label
              htmlFor="placeUrl"
              className="bg-base-100 absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-xs text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-violet-600 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-violet-400"
            >
              Google Place URL
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              id="placeId"
              value={formData.placeId ?? ''}
              onChange={handleInputChange('placeId')}
              className="bg-base-100 dark:text-base-100 peer block w-full rounded-2xl border border-gray-300 pb-3 pl-4 pr-4 pt-3 text-sm text-slate-900 focus:border-violet-500 focus:outline-none dark:border-gray-600"
              maxLength={30}
            />
            <label
              htmlFor="placeId"
              className="bg-base-100 absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-xs text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-violet-600 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-violet-400"
            >
              Google Place ID
            </label>
          </div>
        </section>
      </section>

      <button className="bottom_btn" type="submit">
        Save
      </button>
    </form>
  );
};

const OutletForm = memo(MemoOutletForm);
export default OutletForm;
