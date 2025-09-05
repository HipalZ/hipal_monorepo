// store/useReviewsFilterStore.ts
import { create } from "zustand";
import type {
  ratingType,
  reviewFilter,
  reviewPayload,
} from "@/hooks/useReview.ts";

type ReadMode = "all" | "read" | "unread";

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const startOfDayMs = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).getTime();
const endOfDayMs = (isoDate: string) =>
  new Date(`${isoDate}T23:59:59.999`).getTime();

export interface ReviewsFilterState {
  // filters
  rating?: ratingType; // "GOOD" | "AVG" | "BAD"
  readMode: ReadMode; // "all" | "read" | "unread"
  serviceIds: Set<string>;
  staffIds: Set<string>;
  roomIds: Set<string>;
  fromDate: string; // yyyy-mm-dd
  toDate: string; // yyyy-mm-dd

  // derived
  isFiltered: () => boolean; // true if something other than default today-range is selected
  createPayload: (businessId: string) => reviewPayload;

  // control
  applyKey: number; // increment to trigger fetch in container
  apply: () => void;
  clear: () => void;

  // setters/toggles
  setRating: (r?: ratingType) => void;
  setReadMode: (m: ReadMode) => void;
  setFromDate: (d: string) => void;
  setToDate: (d: string) => void;
  toggleService: (id: string) => void;
  toggleStaff: (id: string) => void;
  toggleRoom: (id: string) => void;
  resetDatesToToday: () => void;
}

const defaultFrom = todayStr();
const defaultTo = todayStr();

export const useReviewsFilterStore = create<ReviewsFilterState>((set, get) => ({
  rating: undefined,
  readMode: "all",
  serviceIds: new Set(),
  staffIds: new Set(),
  roomIds: new Set(),
  fromDate: defaultFrom,
  toDate: defaultTo,

  isFiltered: () => {
    const s = get();
    const hasRead = s.readMode !== "all";
    const dateIsTodayOnly =
      s.fromDate === defaultFrom && s.toDate === defaultTo;
    return (
      !!s.rating ||
      hasRead ||
      s.serviceIds.size > 0 ||
      s.staffIds.size > 0 ||
      s.roomIds.size > 0 ||
      !dateIsTodayOnly
    );
  },

  createPayload: (businessId: string) => {
    const s = get();
    const filter: reviewFilter = {};
    if (s.rating) filter.rating = s.rating;
    if (s.serviceIds.size) filter.serviceIds = Array.from(s.serviceIds);
    if (s.staffIds.size) filter.staffIds = Array.from(s.staffIds);
    if (s.roomIds.size) filter.roomIds = Array.from(s.roomIds);
    if (s.readMode !== "all") filter.isRead = s.readMode === "read";

    const payload: reviewPayload = {
      businessId,
      from: startOfDayMs(s.fromDate),
      to: endOfDayMs(s.toDate),
      filter: Object.keys(filter).length ? filter : undefined,
    };
    return payload;
  },

  applyKey: 0,
  apply: () => set((st) => ({ applyKey: st.applyKey + 1 })),
  clear: () =>
    set({
      rating: undefined,
      readMode: "all",
      serviceIds: new Set(),
      staffIds: new Set(),
      roomIds: new Set(),
      fromDate: defaultFrom,
      toDate: defaultTo,
      applyKey: Date.now(), // also trigger refetch with today
    }),

  setRating: (r) => set({ rating: r }),
  setReadMode: (m) => set({ readMode: m }),
  setFromDate: (d) => set({ fromDate: d }),
  setToDate: (d) => set({ toDate: d }),
  toggleService: (id) =>
    set((st) => {
      const next = new Set(st.serviceIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { serviceIds: next };
    }),
  toggleStaff: (id) =>
    set((st) => {
      const next = new Set(st.staffIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { staffIds: next };
    }),
  toggleRoom: (id) =>
    set((st) => {
      const next = new Set(st.roomIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { roomIds: next };
    }),

  resetDatesToToday: () => set({ fromDate: defaultFrom, toDate: defaultTo }),
}));
