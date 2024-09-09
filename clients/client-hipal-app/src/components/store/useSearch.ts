import { create } from "zustand";

interface IUseSearch {
  searchText: string;
  setSearchText: (d: string) => void;

  isSearchActive: boolean;
  setIsSearchActive: (d: boolean) => void;

  showHeader: boolean;
  setShowHeader: (d: boolean) => void;
}

export const useSearch = create<IUseSearch>((set) => ({
  searchText: "",
  setSearchText: (d: string) => set(() => ({ searchText: d })),

  isSearchActive: false,
  setIsSearchActive: (d: boolean) => set(() => ({ isSearchActive: d })),

  showHeader: true,
  setShowHeader: (d: boolean) => set(() => ({ showHeader: d })),
}));
