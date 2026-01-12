import { create } from "zustand";
import type { TableData } from "./useZonesAndTable";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import type { IBillData, OrderData, User } from "../types/hiClientzData";

export type orderPages = "online" | "offline" | "history" | "";
export type TransferTable = "ITEM" | "TABLE" | "" | "FREE" | "DELETE";

export type orderModal =
  | ""
  | "bill"
  | "guest"
  | "options"
  | "free"
  | "customer"
  | "user"
  | "liveCart"
  | "ebill"
  | "alerts"
  | "addItem";

type ModalType =
  | "discount"
  | "serviceCharge"
  | "coupon"
  | "coinz"
  | "options"
  | "tips"
  | "split";

interface ISettleMode {
  _id: string;
  name: string;
  amount: number;
}

export interface IDuesPersonsData {
  _id: string;
  totalDuesAmount: number;
  userId: User;
}

interface OrderState {
  currentPage: orderPages;
  setCurrentPage: (page: orderPages) => void;

  showqr: boolean;
  setShowqr: (show: boolean) => void;

  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;

  showMoreOption: boolean;
  setShowMoreOption: (show: boolean) => void;

  showEBill: boolean;
  setShowEBill: (show: boolean) => void;

  normalSettle: boolean;
  setNormalSettle: (open: boolean) => void;

  transferTable: TransferTable;
  setTransferTable: (table: TransferTable) => void;

  saveDueUser: IDuesPersonsData | null;
  setSaveDueUser: (user: IDuesPersonsData | null) => void;

  openDues: boolean;
  setOpenDues: (open: boolean) => void;

  selectedItems: Array<{ itemId: string; quantity: number }>;
  setSelectedItems: (
    items: Array<{ itemId: string; quantity: number }>,
  ) => void;
  updateSelectedItemQuantity: (itemId: string, quantity: number) => void;
  toggleSelectedItem: (itemId: string) => void;

  orderDataStore: OrderData[];
  setOrderDataStore: (orders: OrderData[]) => void;

  transferModal: boolean;
  setTransferModal: (open: boolean) => void;

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

  isSplit: boolean;
  setIsSplit: (split: boolean) => void;

  // Replace single-object "splitSelection" with an array
  settleModes: ISettleMode[];
  setSettleModes: (modes: ISettleMode[]) => void;
  addSettleMode: (mode: ISettleMode) => void;
  updateSettleMode: (mode: ISettleMode) => void;
  removeSettleMode: (modeId: string) => void;

  openAddCoinz: boolean;
  setOpenAddCoinz: (open: boolean) => void;

  //split bill
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;

  selectedBill: null | IBillData;
  setSelectedBill: (bill: IBillData | null) => void;

  isBillSplit: boolean;
  setIsBillSplit: (isBillSplit: boolean) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  currentPage: "",
  setCurrentPage: (page) => set({ currentPage: page }),

  activeModal: "options",
  setActiveModal: (modal) => set({ activeModal: modal }),

  showqr: false,
  setShowqr: (show) => set({ showqr: show }),

  openDues: false,
  setOpenDues: (open) => set({ openDues: open }),

  normalSettle: false,
  setNormalSettle: (open) => set({ normalSettle: open }),

  showEBill: false,
  setShowEBill: (show) => set({ showEBill: show }),

  showMoreOption: false,
  setShowMoreOption: (show) => set({ showMoreOption: show }),

  saveDueUser: null,
  setSaveDueUser: (user) => set({ saveDueUser: user }),

  orderDataStore: [],
  setOrderDataStore: (orders) => set({ orderDataStore: orders }),

  selectedItems: [],
  setSelectedItems: (items) => set({ selectedItems: items }),
  updateSelectedItemQuantity: (itemId, quantity) =>
    set((state) => ({
      selectedItems: state.selectedItems.map((item) =>
        item.itemId === itemId ? { ...item, quantity } : item,
      ),
    })),
  toggleSelectedItem: (itemId) =>
    set((state) => {
      const exists = state.selectedItems.find((item) => item.itemId === itemId);
      if (exists) {
        return {
          selectedItems: state.selectedItems.filter(
            (item) => item.itemId !== itemId,
          ),
        };
      }
      // When adding, we need to get the quantity from orderDataStore
      // For now, default to 1, will be updated in component
      return {
        selectedItems: [...state.selectedItems, { itemId, quantity: 1 }],
      };
    }),

  transferTable: "",
  setTransferTable: (table) => set({ transferTable: table }),

  transferModal: false,
  setTransferModal: (open) => set({ transferModal: open }),

  isSplit: false,
  setIsSplit: (split) => set({ isSplit: split }),

  settleModes: [],
  setSettleModes: (modes) => set({ settleModes: modes }),

  addSettleMode: (mode) => {
    const existing = get().settleModes.find((m) => m._id === mode._id);
    if (!existing) {
      set({ settleModes: [...get().settleModes, mode] });
    }
  },

  updateSettleMode: (newMode) => {
    const updated = get().settleModes.map((m) =>
      m._id === newMode._id ? { ...m, amount: newMode.amount } : m,
    );
    set({ settleModes: updated });
  },

  removeSettleMode: (modeId) => {
    set({
      settleModes: get().settleModes.filter((m) => m._id !== modeId),
    });
  },

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
    if (categories?.length > 0) {
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

  openAddCoinz: false,
  setOpenAddCoinz: (open) => set({ openAddCoinz: open }),

  isExpanded: false,
  setIsExpanded: (expanded) => set({ isExpanded: expanded }),

  selectedBill: null,
  setSelectedBill: (bill) => set({ selectedBill: bill }),

  isBillSplit: false,
  setIsBillSplit: (isBillSplit) => set({ isBillSplit }),
}));
