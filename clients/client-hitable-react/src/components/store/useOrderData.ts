import { create } from "zustand";
import type { TableData } from "./useZonesAndTable";
import type { CategoryType } from "@hi/db-models/src/validators";

export type orderPages = "online" | "offline" | "history" | "";

export type orderModal =
  | ""
  | "bill"
  | "guest"
  | "options"
  | "free"
  | "customer"
  | "user"
  | "liveCart"
  | "addItem";

interface OrderState {
  currentPage: orderPages;
  setCurrentPage: (page: orderPages) => void;

  paymentSteps: number;
  setPaymentSteps: (steps: number) => void;

  modalType: orderModal;
  setModalType: (modal: orderModal) => void;

  openOrderModal: boolean;
  setOpenOrderModal: (open: boolean) => void;

  selectedTable: null | TableData;
  setSelectedTable: (table: TableData) => void;

  selectedCategory: null | CategoryType;
  setSelectedCategory: (category: CategoryType) => void;

  allCategories: CategoryType[];
  setAllCategories: (categories: CategoryType[]) => void;

  setFirstCat: (categories: CategoryType[]) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  currentPage: "",
  setCurrentPage: (page) => set({ currentPage: page }),

  paymentSteps: 0,
  setPaymentSteps: (steps) => set({ paymentSteps: steps }),

  modalType: "",
  setModalType: (modal) => set({ modalType: modal }),

  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  selectedTable: null,
  setSelectedTable: (table) => set({ selectedTable: table }),

  openOrderModal: false,
  setOpenOrderModal: (open) => set({ openOrderModal: open }),

  allCategories: [],
  setAllCategories: (categories) => set({ allCategories: categories }),

  setFirstCat: (categories: CategoryType[]) => {
    set({ allCategories: categories });
    if (get().selectedCategory === null && categories?.length > 0) {
      set({ selectedCategory: categories[0] });
    }
  },
}));
