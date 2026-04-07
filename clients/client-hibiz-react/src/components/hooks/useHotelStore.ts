import type { Cart } from "@/components/types/hotelTypes";
import { create } from "zustand";

interface IHotelStore {
  cartData: Cart[];
  setCartData: (value: Cart[]) => void;

  openCartModal: boolean;
  setOpenCartModal: (value: boolean) => void;
}

export const useHotelStore = create<IHotelStore>((set) => ({
  cartData: [],
  setCartData: (value) => set({ cartData: value }),

  openCartModal: false,
  setOpenCartModal: (value) => set({ openCartModal: value }),
}));
