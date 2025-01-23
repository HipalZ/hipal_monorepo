import { create } from "zustand";
import type { IUnsettleTables } from "../types/hiClientzData";

interface UnsettleState {
  openUnsettle: boolean;
  setOpenUnsettle: (open: boolean) => void;

  selectedUnsettleData: IUnsettleTables | null;
  setSelectedUnsettleData: (data: IUnsettleTables) => void;
}

export const useUnsettle = create<UnsettleState>((set) => ({
  openUnsettle: false,
  setOpenUnsettle: (open) => set({ openUnsettle: open }),

  selectedUnsettleData: null,
  setSelectedUnsettleData: (data: IUnsettleTables) =>
    set({ selectedUnsettleData: data }),
}));
