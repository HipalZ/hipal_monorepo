// src/components/store/useKotStore.ts
import { create } from "zustand";
// types/kds.ts
export type ItemStatus = "IN_PROGRESS" | "COOKED" | "DELIVERED" | "CANCELLED";
export type KotStatus = "IN_PROGRESS" | "COMPLETED";

export interface Portion {
  _id?: string;
  name: string;
  price: number;
  default?: boolean;
  portionTypes?: ("VEG" | "NON_VEG")[];
  createdAt?: string;
  updatedAt?: string;
}
export interface Extra {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Dish {
  _id: string;
  name: string;
  price: number;
  gst?: number;
  vat?: number;
  kitchenId: string;
  portions?: Portion[];
  dishTypes?: ("VEG" | "NON_VEG")[];
  categoryIds?: string[];
  description?: string;
  avgPrepTime?: number;
}

export interface KotItem {
  _id: string;
  id: string;
  dish: Dish;
  portion?: Portion | null;
  extras: Extra[];
  quantity: number;
  isDeleted: boolean;
  discount: number;
  itemStatus: ItemStatus;
  priority: boolean;
  cookedBy: string;
  deliveredBy: string;
}

export interface KotOrderDoc {
  _id: string;
  businessId: string;
  userId: string;
  phone: string;
  tableName?: string;
  tableId: string;
  cart: KotItem[];
  date?: number;
  rejected: boolean;
  accepted: boolean;
  edited: boolean;
  settled: boolean;
  name: string;
  transferd: boolean;
  fromTable: string;
  toTable: string;
  unSettled: boolean;
  message: string;
  bill: boolean;
  isDeleted: boolean;
  isSync: boolean;
  kotInvoiceNumber: number;
  kotStatus: KotStatus;
  priority: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TableKot {
  tableId: string;
  tableName: string;
  kots: KotOrderDoc[];
}

interface KotStore {
  kotData: KotOrderDoc[];
  selectedTableId: string | null;
  open: boolean;
  setKotData: (data: KotOrderDoc[]) => void;
  setSelectedTableId: (id: string | null) => void;
  setOpen: (open: boolean) => void;
  reset: () => void;
}

export const useKotStore = create<KotStore>((set) => ({
  kotData: [],
  selectedTableId: null,
  open: false,
  setKotData: (data) => set({ kotData: data }),
  setSelectedTableId: (id) => set({ selectedTableId: id }),
  setOpen: (open) => set({ open }),
  reset: () => set({ kotData: [], selectedTableId: null, open: false }),
}));
