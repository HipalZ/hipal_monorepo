import { create } from "zustand";

type MergeState = {
  showMergeModal: boolean;
  parentTableId: string | null;
  childTableIds: string[]; // max 3
  previewMode: boolean;

  setShowMergeModal: (v: boolean) => void;
  setParentTableId: (id: string | null) => void;
  toggleChildTableId: (id: string) => void;
  setPreviewMode: (v: boolean) => void;
  resetMergeState: () => void;
};

export const useMergeTableStore = create<MergeState>((set, get) => ({
  showMergeModal: false,
  parentTableId: null,
  childTableIds: [],
  previewMode: false,

  setShowMergeModal: (v) => set({ showMergeModal: v }),
  setParentTableId: (id) =>
    set((s) => ({
      parentTableId: id,
      // Remove parent from children if it was selected before
      childTableIds: id
        ? s.childTableIds.filter((c) => c !== id)
        : s.childTableIds,
    })),

  toggleChildTableId: (id) =>
    set((s) => {
      const isSelected = s.childTableIds.includes(id);
      if (id === s.parentTableId) return s;
      if (isSelected) {
        return { childTableIds: s.childTableIds.filter((c) => c !== id) };
      }
      if (s.childTableIds.length >= 3) return s;
      return { childTableIds: [...s.childTableIds, id] };
    }),

  setPreviewMode: (v) => set({ previewMode: v }),
  resetMergeState: () =>
    set({
      showMergeModal: false,
      parentTableId: null,
      childTableIds: [],
      previewMode: false,
    }),
}));
