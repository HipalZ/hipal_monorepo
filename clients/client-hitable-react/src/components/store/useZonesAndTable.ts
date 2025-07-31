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
  tableCount: number;
}

export interface TableData {
  active: string;
  businessId: string;
  createdAt: string;
  currentTableAmount: number;
  capacity?: number;
  displayForCaptains: boolean;
  isDeleted: boolean;
  name: string;
  rank: string;
  staffIds: string[];
  isTransfer?: boolean;
  status: string;
  tableId: string;
  updatedAt: string;
  tableItemCount: number;
  userIds: string[];
  zoneId: string;
  hiCode?: string;
  _id: string;
}

export type FilterType = "all" | "active" | "inactive";

interface ZonesAndTablesState {
  zones: Zone[];
  tables: TableData[];
  activeFilter: FilterType;
  searchQuery: string;
  setActiveFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  setZones: (zones: Zone[]) => void;
  setTables: (tables: TableData[]) => void;

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
  setTables: (tables: TableData[]) => set({ tables }),

  isFilterOpen: false,
  setIsFilterOpen: (isOpen: boolean) => set({ isFilterOpen: isOpen }),
}));
