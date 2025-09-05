// store/useReviewsFilterStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ratingType,
  reviewFilter,
  reviewPayload,
} from "@/hooks/useReview";

type ReadMode = "all" | "read" | "unread";

const THREE_HOURS = 3 * 60 * 60 * 1000;

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

const defaultFrom = todayStr();
const defaultTo = todayStr();

function defaultFilterFields() {
  return {
    rating: undefined as ratingType | undefined,
    readMode: "all" as ReadMode,
    serviceIds: new Set<string>(),
    staffIds: new Set<string>(),
    roomIds: new Set<string>(),
    fromDate: defaultFrom,
    toDate: defaultTo,
  };
}

export interface ReviewsFilterState {
  // current business (for auto-clear on switch)
  currentBusinessId?: string;

  // filters
  rating?: ratingType;
  readMode: ReadMode;
  serviceIds: Set<string>;
  staffIds: Set<string>;
  roomIds: Set<string>;
  fromDate: string;
  toDate: string;

  // derived
  isFiltered: () => boolean;
  createPayload: (businessId: string) => reviewPayload;

  // control
  applyKey: number;
  apply: () => void;
  clear: () => void;
  setBusinessId: (id?: string) => void; // 👈 call this when businessId changes

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

export const useReviewsFilterStore = create<ReviewsFilterState>()(
  persist(
    (set, get) => ({
      currentBusinessId: undefined,
      ...defaultFilterFields(),

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
          ...defaultFilterFields(),
          applyKey: Date.now(), // trigger refetch with today's range
        }),

      // business switch => auto clear
      setBusinessId: (id) =>
        set((st) => {
          if (!id) return { currentBusinessId: undefined };
          if (st.currentBusinessId && st.currentBusinessId !== id) {
            return {
              currentBusinessId: id,
              ...defaultFilterFields(),
              applyKey: Date.now(),
            };
          }
          return { currentBusinessId: id };
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
      resetDatesToToday: () =>
        set({ fromDate: defaultFrom, toDate: defaultTo }),
    }),
    {
      name: "reviews-filters-v1",
      storage: createJSONStorage(() => localStorage),
      // only persist the filter fields (+ business + timestamp)
      partialize: (s) => ({
        currentBusinessId: s.currentBusinessId,
        rating: s.rating,
        readMode: s.readMode,
        serviceIds: Array.from(s.serviceIds),
        staffIds: Array.from(s.staffIds),
        roomIds: Array.from(s.roomIds),
        fromDate: s.fromDate,
        toDate: s.toDate,
        _persistedAt: Date.now(),
      }),
      // restore Sets + enforce TTL (3h)
      merge: (persisted, current) => {
        const p = persisted as any;
        const now = Date.now();
        const tooOld = !p?._persistedAt || now - p._persistedAt > THREE_HOURS;

        if (!p || tooOld) {
          // ignore stale/invalid persisted data
          return current;
        }

        return {
          ...current,
          currentBusinessId: p.currentBusinessId ?? current.currentBusinessId,
          rating: p.rating ?? current.rating,
          readMode: p.readMode ?? current.readMode,
          fromDate: p.fromDate ?? current.fromDate,
          toDate: p.toDate ?? current.toDate,
          serviceIds: new Set<string>(
            Array.isArray(p.serviceIds) ? p.serviceIds : [],
          ),
          staffIds: new Set<string>(
            Array.isArray(p.staffIds) ? p.staffIds : [],
          ),
          roomIds: new Set<string>(Array.isArray(p.roomIds) ? p.roomIds : []),
          // NOTE: don't bring back applyKey; let it start fresh
        } as ReviewsFilterState;
      },
    },
  ),
);
