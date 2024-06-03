import { create } from "zustand";
import { Data } from "../types";

type KotStore = {
  kotData: Data[];
  filterData: Data[];
  historyData: Data[];
  newKotCount: number;
  filter: string;
  updatedFilters: string;
  setKotData: (data: Data[]) => void;
  setHistoryData: (data: Data[]) => void;
  setNewKotCount: (data: number) => void;
  setFilter: (data: string) => void;
  setUpdatedFilters: (data: string) => void;
  setFilterData: (data: Data[]) => void;
};

export const useKotStore = create<KotStore>((set) => ({
  kotData: [],
  filterData: [],
  historyData: [],
  newKotCount: 0,
  updatedFilters: "",
  filter: "Orders",

  setKotData: (data: Data[]) => {
    set({ kotData: data });
  },
  setFilterData: (data: Data[]) => set({ filterData: data }),
  setHistoryData: (data: Data[]) => set({ historyData: data }),
  setNewKotCount: (data: number) => set({ newKotCount: data }),
  setFilter: (data: string) => set({ filter: data }),
  setUpdatedFilters: (data: string) => set({ updatedFilters: data }),
}));
