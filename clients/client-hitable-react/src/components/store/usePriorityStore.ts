import { create } from "zustand";
import { devtools } from "zustand/middleware";

type KotSelectionState = {
  isSelectionMode: boolean;
  selectedItemIds: string[];

  enableSelectionMode: () => void;
  disableSelectionMode: () => void;

  setSelected: (ids: string[]) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  selectFrom: (ids: string[]) => void;
  isSelected: (id: string) => boolean;
};

export const useKotSelectionStore = create<KotSelectionState>()(
  devtools((set, get) => ({
    isSelectionMode: false,
    selectedItemIds: [],

    enableSelectionMode: () => set({ isSelectionMode: true }),
    disableSelectionMode: () =>
      set({ isSelectionMode: false, selectedItemIds: [] }),

    setSelected: (ids) => set({ selectedItemIds: Array.from(new Set(ids)) }),

    add: (id) =>
      set((s) => {
        if (s.selectedItemIds.includes(id)) return s;
        return { selectedItemIds: [...s.selectedItemIds, id] };
      }),

    remove: (id) =>
      set((s) => ({
        selectedItemIds: s.selectedItemIds.filter((x) => x !== id),
      })),

    toggle: (id) => {
      const { selectedItemIds } = get();
      if (selectedItemIds.includes(id)) {
        set({ selectedItemIds: selectedItemIds.filter((x) => x !== id) });
      } else {
        set({ selectedItemIds: [...selectedItemIds, id] });
      }
    },

    clear: () => set({ selectedItemIds: [] }),

    selectFrom: (ids) => set({ selectedItemIds: Array.from(new Set(ids)) }),

    isSelected: (id) => get().selectedItemIds.includes(id),
  })),
);
