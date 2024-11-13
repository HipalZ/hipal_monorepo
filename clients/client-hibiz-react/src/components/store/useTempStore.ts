import { create } from "zustand";

interface ITempStore {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

export const useTempStore = create<ITempStore>((set) => ({
  isLoading: false,
  setIsLoading: (value: boolean) => set({ isLoading: value }),
}));
