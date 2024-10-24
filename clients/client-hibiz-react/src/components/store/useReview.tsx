import { create } from "zustand";
import type { ReviewsType } from "@hi/db-models/src/validators";
export type ReviewPages = "Review" | "Star Staff" | "user" | "message";

export type ReviewModel = "COINS" | "COUPONZ" | "GOOGLE_REVIEW" | "";

export interface ReviewState {
  page: ReviewPages;
  setPage: (page: ReviewPages) => void;

  review: ReviewsType | null;
  setReview: (review: ReviewsType) => void;

  modelType: ReviewModel;
  setModelType: (modelType: ReviewModel) => void;

  open: boolean;
  setOpen: (open: boolean) => void;

  coinz: string;
  setCoinz: (coinz: string) => void;

  password: string;
  setPassword: (password: string) => void;

  showPassword: boolean;
  toggleShowPassword: () => void;

  amount: string;
  setAmount: (amount: string) => void;

  reset: () => void;
}

export const useReview = create<ReviewState>((set) => ({
  page: "Review",
  setPage: (page) => set({ page }),

  review: null,
  setReview: (review) => set({ review }),

  modelType: "",
  setModelType: (modelType) => set({ modelType }),

  open: false,
  setOpen: (open) => set({ open }),

  coinz: "",
  setCoinz: (coinz) => set({ coinz }),

  password: "",
  setPassword: (password) => set({ password }),

  showPassword: false,
  toggleShowPassword: () =>
    set((state) => ({ showPassword: !state.showPassword })),

  amount: "",
  setAmount: (amount) => set({ amount }),
  reset: () =>
    set({
      coinz: "",
      password: "",
      showPassword: false,
      amount: "",
    }),
}));
