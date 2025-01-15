import { create } from "zustand";
import type { TableData } from "./useZonesAndTable";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";

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

  allDishes: DishType[];
  setAllDishes: (dishes: DishType[]) => void;

  searchActive: boolean;
  setSearchActive: (active: boolean) => void;

  searchTerm: string;
  setSearchTerm: (term: string) => void;

  orderError: string;
  setOrderError: (error: string) => void;

  showOrderError: boolean;
  setShowOrderError: (show: boolean) => void;
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

  allDishes: [],
  setAllDishes: (dishes) => set({ allDishes: dishes }),

  searchActive: false,
  setSearchActive: (active) => set({ searchActive: active }),

  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),

  orderError: "",
  setOrderError: (error) => set({ orderError: error }),

  showOrderError: false,
  setShowOrderError: (show) => set({ showOrderError: show }),
}));
