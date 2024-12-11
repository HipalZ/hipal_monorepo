import { create } from "zustand";

export interface Zone {
  _id: string;
  zoneId: string;
  active: string;
  businessId: string;
  createdAt: string;
  isDeleted: boolean;
  name: string;
  rank: string;
  staffIds: string[];
  updatedAt: string;
}

export interface Table {
  _id: string;
  tableId: string;
  active: string;
  businessId: string;
  createdAt: string;
  displayForCaptains: boolean;
  isDeleted: boolean;
  name: string;
  rank: string;
  staffIds: string[];
  updatedAt: string;
  zoneId: string;
}

export type FilterType = "all" | "active" | "inactive";

interface ZonesAndTablesState {
  zones: Zone[];
  tables: Table[];
  activeFilter: FilterType;
  searchQuery: string;
  setActiveFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  setZones: (zones: Zone[]) => void;
  setTables: (tables: Table[]) => void;

  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

export const useZonesAndTablesStore = create<ZonesAndTablesState>((set) => ({
  zones: [],
  tables: [],
  activeFilter: "all",
  searchQuery: "",
  setActiveFilter: (filter: FilterType) => set({ activeFilter: filter }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setZones: (zones: Zone[]) => set({ zones }),
  setTables: (tables: Table[]) => set({ tables }),

  isFilterOpen: false,
  setIsFilterOpen: (isOpen: boolean) => set({ isFilterOpen: isOpen }),
}));
