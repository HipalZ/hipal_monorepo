import {
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import { create } from "zustand";

export type PresetRange =
  | "today"
  | "yesterday"
  | "last7"
  | "thisMonth"
  | "custom";

interface State {
  // single source of truth for range
  startDate: Date;
  endDate: Date;

  // derived mirrors (kept in sync)
  timeStampStart: number;
  timeStampEnd: number;

  // UI bits
  selectedRange: PresetRange;
  inTime: string;
  outTime: string;
  dayIn: string;
  dayOut: string;
  pickDate: string;
  status: string;
  rating: string;

  // actions
  setRange: (next: { startDate: Date; endDate: Date }) => void;
  setSelectedRange: (selectedRange: PresetRange) => void;

  setInTime: (inTime: string) => void;
  setOutTime: (outTime: string) => void;
  setDayIn: (dayIn: string) => void;
  setDayOut: (dayOut: string) => void;
  setPickDate: (pickDate: string) => void;
  setStatus: (status: string) => void;
  setRating: (rating: string) => void;

  isCustomDate: boolean;
  setIsCustomDate: (isCustom: boolean) => void;

  applied: boolean;
  setIsApplied: (applied: boolean) => void;

  // update by timestamps if the server returns epochs
  setRangeByTimestamps: (next: {
    timeStampStart: number;
    timeStampEnd: number;
  }) => void;

  reset: () => void;
}

const todayStart = startOfDay(new Date());
const todayEnd = endOfDay(new Date());

export const useTimings = create<State>((set, get) => ({
  // base state
  startDate: todayStart,
  endDate: todayEnd,
  timeStampStart: todayStart.getTime(),
  timeStampEnd: todayEnd.getTime(),

  selectedRange: "today",
  inTime: "",
  outTime: "",
  dayIn: "",
  dayOut: "",
  pickDate: "",
  status: "",
  rating: "",

  applied: false,
  setIsApplied: (applied: boolean) => set({ applied }),

  isCustomDate: false,
  setIsCustomDate: (isCustom: boolean) => set({ isCustomDate: isCustom }),

  setRange: ({ startDate, endDate }) => {
    const { startDate: curS, endDate: curE } = get();
    if (
      curS.getTime() === startDate.getTime() &&
      curE.getTime() === endDate.getTime()
    )
      return;

    set({
      startDate,
      endDate,
      timeStampStart: startDate.getTime(),
      timeStampEnd: endDate.getTime(),
    });
  },

  /**
   * Presets: clamp to whole-day bounds (good UX for quick picks).
   * For "custom", only switch the flag—component will call setRange().
   */
  setSelectedRange: (selectedRange) => {
    let s = todayStart;
    let e = todayEnd;

    switch (selectedRange) {
      case "today":
        s = startOfDay(new Date());
        e = endOfDay(new Date());
        break;
      case "yesterday":
        s = startOfDay(subDays(new Date(), 1));
        e = endOfDay(subDays(new Date(), 1));
        break;
      case "last7":
        s = startOfDay(subDays(new Date(), 6));
        e = endOfDay(new Date());
        break;
      case "thisMonth":
        s = startOfDay(startOfMonth(new Date()));
        e = endOfDay(endOfMonth(new Date()));
        break;
      case "custom":
        set({ selectedRange });
        return;
    }

    set({
      selectedRange,
      startDate: s,
      endDate: e,
      timeStampStart: s.getTime(),
      timeStampEnd: e.getTime(),
    });
  },

  setRangeByTimestamps: ({ timeStampStart, timeStampEnd }) => {
    const s = new Date(timeStampStart);
    const e = new Date(timeStampEnd);
    const { timeStampStart: cs, timeStampEnd: ce } = get();
    if (cs === s.getTime() && ce === e.getTime()) return;

    set({
      startDate: s,
      endDate: e,
      timeStampStart: s.getTime(),
      timeStampEnd: e.getTime(),
    });
  },

  // small setters (primitive fields, no risk)
  setInTime: (inTime) => set({ inTime }),
  setOutTime: (outTime) => set({ outTime }),
  setDayIn: (dayIn) => set({ dayIn }),
  setDayOut: (dayOut) => set({ dayOut }),
  setPickDate: (pickDate) => set({ pickDate }),
  setStatus: (status) => set({ status }),
  setRating: (rating) => set({ rating }),

  // reset to defaults
  reset: () =>
    set(() => {
      const s = startOfDay(new Date());
      const e = endOfDay(new Date());
      return {
        startDate: s,
        endDate: e,
        timeStampStart: s.getTime(),
        timeStampEnd: e.getTime(),
        selectedRange: "today",
        inTime: "",
        outTime: "",
        dayIn: "",
        dayOut: "",
        pickDate: "",
        status: "",
        rating: "",
      };
    }),
}));

export default useTimings;
