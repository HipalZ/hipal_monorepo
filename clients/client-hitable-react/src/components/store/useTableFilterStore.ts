import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FilterType = "all" | "active" | "inactive";

interface TableFilterState {
  activeFilter: FilterType;
  filterZones: string[];
  searchQuery: string;
  setActiveFilter: (filter: FilterType) => void;
  setFilterZones: (zones: string[]) => void;
  setSearchQuery: (query: string) => void;
}

export const useTableFilterStore = create<TableFilterState>()(
  persist(
    (set) => ({
      activeFilter: "all",
      filterZones: [],
      searchQuery: "",
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      setFilterZones: (zones) => set({ filterZones: zones }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: "hipal_tables_filter_storage",
      partialize: (state) => ({
        activeFilter: state.activeFilter,
        filterZones: state.filterZones,
      }),
    },
  ),
);
