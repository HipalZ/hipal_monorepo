import { create } from "zustand";

export type PayFilters = "ONLINE" | "OFFLINE" | "ALL" | "CALL_CAPTAIN";

interface FilterState {
  payFilter: PayFilters;
  setPayFilter: (filter: PayFilters) => void;
}

export const useFilters = create<FilterState>((set) => ({
  payFilter: "ALL",
  setPayFilter: (filter: PayFilters) => set({ payFilter: filter }),
}));
