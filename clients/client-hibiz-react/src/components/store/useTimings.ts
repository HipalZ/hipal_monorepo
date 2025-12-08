// useTimings.ts
import {
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  // extended billing time flag (used by checkbox)
  useExtendedTime: boolean;

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

  setRangeByTimestamps: (next: {
    timeStampStart: number;
    timeStampEnd: number;
  }) => void;

  setUseExtendedTime: (useExtendedTime: boolean) => void;

  reset: () => void;
}

const todayStart = startOfDay(new Date());
const todayEnd = endOfDay(new Date());

export const useTimings = create<State>()(
  persist(
    (set, get) => ({
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

      useExtendedTime: false,

      /**
       * setRange preserves the exact datetime passed in (do NOT clamp),
       * and guards against no-op updates to avoid loops.
       */
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
       * Presets: clamp to whole-day bounds based on calendar.
       * Billing times are applied at the component level.
       */
      setSelectedRange: (selectedRange) => {
        let s = todayStart;
        let e = todayEnd;

        switch (selectedRange) {
          case "today":
            s = startOfDay(new Date());
            e = endOfDay(new Date());
            break;
          case "yesterday": {
            const y = subDays(new Date(), 1);
            s = startOfDay(y);
            e = endOfDay(y);
            break;
          }
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

      setInTime: (inTime) => set({ inTime }),
      setOutTime: (outTime) => set({ outTime }),
      setDayIn: (dayIn) => set({ dayIn }),
      setDayOut: (dayOut) => set({ dayOut }),
      setPickDate: (pickDate) => set({ pickDate }),
      setStatus: (status) => set({ status }),
      setRating: (rating) => set({ rating }),

      setUseExtendedTime: (useExtendedTime) => set({ useExtendedTime }),

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
            useExtendedTime: false,
          };
        }),
    }),
    {
      name: "hiclient-timings-store-v1",
      version: 1,
      partialize: (state) => ({
        timeStampStart: state.timeStampStart,
        timeStampEnd: state.timeStampEnd,
        selectedRange: state.selectedRange,
        inTime: state.inTime,
        outTime: state.outTime,
        dayIn: state.dayIn,
        dayOut: state.dayOut,
        pickDate: state.pickDate,
        status: state.status,
        rating: state.rating,
        useExtendedTime: state.useExtendedTime,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const s = new Date(state.timeStampStart || todayStart.getTime());
        const e = new Date(state.timeStampEnd || todayEnd.getTime());
        state.startDate = s;
        state.endDate = e;
      },
    },
  ),
);

export default useTimings;
