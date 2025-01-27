import { create } from "zustand";

interface IDues {
  isUserAdded: boolean;
  setIsUserAdded: (value: boolean) => void;
}

export const useDues = create<IDues>((set) => ({
  isUserAdded: false,
  setIsUserAdded: (value: boolean) => set({ isUserAdded: value }),
}));
