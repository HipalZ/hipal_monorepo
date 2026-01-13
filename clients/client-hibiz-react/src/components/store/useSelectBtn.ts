import { createWithEqualityFn } from "zustand/traditional";

type SelectedButtonState = {
  selectedButton: string | null;
  setSelectedButton: (text: string) => void;
};

export const useSelectedButtonStore = createWithEqualityFn<SelectedButtonState>(
  (set) => ({
    selectedButton: "Dashboard",
    setSelectedButton: (text) => set({ selectedButton: text }),
  }),
);
