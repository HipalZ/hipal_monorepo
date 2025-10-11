import { createWithEqualityFn } from "zustand/traditional";

export type PeopleFilters = {
  search: string;
  spendMin?: number;
  spendMax?: number;
  totalSpendMin?: number;
  totalSpendMax?: number;
  visitsMin?: number;
  visitsMax?: number;
  dateFrom?: number;
  dateTo?: number;
};

interface PeopleFiltersState {
  filters: PeopleFilters;
  setFilter: (key: keyof PeopleFilters, value: any) => void;
  clearFilters: () => void;
}

export const usePeopleFiltersStore = createWithEqualityFn<PeopleFiltersState>(
  (set) => ({
    filters: {
      search: "",
    },
    setFilter: (key, value) =>
      set((state) => ({
        filters: { ...state.filters, [key]: value },
      })),
    clearFilters: () =>
      set({
        filters: { search: "" },
      }),
  }),
);
