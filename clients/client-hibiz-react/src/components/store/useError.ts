import { createWithEqualityFn } from "zustand/traditional";

interface IErrorState {
  error: string;
  setError: (error: string) => void;

  openErrorModal: boolean;
  setOpenErrorModal: (open: boolean) => void;

  resetErrorStates: () => void;

  requireReauth: boolean;
  setRequireReauth: (require: boolean) => void;

  statusCode: number | null;
  setStatusCode: (code: number | null) => void;

  setErrorWithStatus: (error: string, code: number | null) => void;
}

export const useError = createWithEqualityFn<IErrorState>((set) => ({
  error: "",
  setError: (error) => set({ error }),

  openErrorModal: false,
  setOpenErrorModal: (open) => set({ openErrorModal: open }),

  requireReauth: false,

  statusCode: 0,
  setStatusCode: (code) => set({ statusCode: code }),

  setErrorWithStatus: (msg, code) =>
    set({
      error: msg,
      statusCode: code ?? null,
      openErrorModal: true,
      requireReauth: code === 401 ? true : false,
    }),

  setRequireReauth: (v) => set({ requireReauth: v }),

  resetErrorStates: () =>
    set({
      openErrorModal: false,
      error: "",
      statusCode: null,
      requireReauth: false,
    }),
}));
