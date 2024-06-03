import { create } from "zustand";

interface Dish {
  dishId: string;
  name: string;
  price: number;
  qty: number;
  comments: string;
  extras: any[];
}

interface Kot {
  businessId: string;
  kitchenId: string;
  zoneId: string;
  staffId: string;
  startedAt: number;
  cookedAt: number;
  status: string;
  dish: Dish;
  customerName: string;
  customerPhone: string;
  dishStatus: string;
  kotTime: string;
  tableName: string;
  dishType: string;
  category: string;
  date: string;
  kotDate: string;
  priority: boolean;
  isDeleted: boolean;
  inventory: boolean;
  orderId: string;
  match: boolean;
  id: string;
}

interface Order {
  kotTime: string;
  orderId: string;
  dishStatus: string;
  kots: Kot[];
  totalDishes: number;
  cookedDishes: number;
  isMatch: boolean;
}

interface OrderState {
  currentOrder?: Order;
  setCurrentOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  currentOrder: undefined,
  setCurrentOrder: (order) => set({ currentOrder: order }),
}));
