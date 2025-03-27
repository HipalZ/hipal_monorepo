import { create } from "zustand";

interface IErrorState {
  error: string;
  setError: (error: string) => void;

  openErrorModal: boolean;
  setOpenErrorModal: (open: boolean) => void;

  resetErrorStates: () => void;
}

export const useError = create<IErrorState>((set) => ({
  error: "",
  setError: (error) => set({ error }),

  openErrorModal: false,
  setOpenErrorModal: (open) => set({ openErrorModal: open }),

  resetErrorStates: () => set({ error: "", openErrorModal: false }),
}));
