import { create } from "zustand";

type SelectedButtonState = {
  selectedButton: string | null;
  setSelectedButton: (text: string) => void;
};

export const useSelectedButtonStore = create<SelectedButtonState>((set) => ({
  selectedButton: 'Dashboard',
  setSelectedButton: (text) => set({ selectedButton: text }),
}));
