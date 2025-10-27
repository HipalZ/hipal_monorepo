import { create } from "zustand";

type TempItemUIState = {
  initialName: string;
  initialPrice: number | "";
  initialQty: number;
  setDefaults: (
    init?: Partial<
      Pick<TempItemUIState, "initialName" | "initialPrice" | "initialQty">
    >,
  ) => void;
  clear: () => void;

  openItem: boolean;
  setOpenItem: (open: boolean) => void;
};

export const useTempItemStore = create<TempItemUIState>((set) => ({
  initialName: "",
  initialPrice: "",
  initialQty: 1,
  setDefaults: (init) =>
    set((s) => ({
      initialName: init?.initialName ?? s.initialName,
      initialPrice: init?.initialPrice ?? s.initialPrice,
      initialQty: init?.initialQty ?? s.initialQty,
    })),
  clear: () => set({ initialName: "", initialPrice: "", initialQty: 1 }),

  openItem: false,
  setOpenItem: (open) => set({ openItem: open }),
}));
