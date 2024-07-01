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
  _id: string;
  businessId: string;
  kitchenId: string;
  zoneId: string;
  staffId: string;
  startedAt: string;
  cookedAt: string;
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
  priority: string;
  isDeleted: string;
  inventory: string;
  orderId: string;
  match: string;
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
