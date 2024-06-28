import { IDish, IExtraItem, IPortion } from "@/components/types/businessData";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ICartExtra {
  [key: string]: IExtraItem & {
    quantity: number;
  };
}

export interface ICartVariant {
  extra?: ICartExtra | {};
  portion?: IPortion;
}

export interface ICartDish {
  dishData: IDish;
  dishId: string;
  variants: ICartVariant[];
}

export interface ICart {
  [key: string]: ICartDish;
}

interface IUseCart {
  showCart: boolean;
  cart: ICart;
  setShowCart: (data: boolean) => void;
  emptyCart: () => void;
  setCart: (data: ICart) => void;

  cartItem: object;
  setCartItem: (data: object) => void;
  emptyCartItem: () => void;

  increaseQuantity: (dishId: string) => void;
  decreaseQuantity: (dishId: string) => void;
  removeDish: (dishId: string) => void;
}

export const useCart = create<IUseCart>()(
  persist(
    (set) => ({
      cart: {},
      showCart: false,
      setShowCart: (d: boolean) => set(() => ({ showCart: d })),
      emptyCart: () => set({ cart: {} }),
      setCart: (d: ICart) => set(() => ({ cart: d })),

      cartItem: {},
      setCartItem: (d: object) => set(() => ({ cartItem: d })),
      emptyCartItem: () => set(() => ({ cartItem: {} })),

      increaseQuantity: (dishId: string) => set((state) => {
        const newCart = { ...state.cart };
        if (newCart[dishId]) {
          newCart[dishId].variants.push({ extra: {} });
        }
        return { cart: newCart };
      }),

      decreaseQuantity: (dishId: string) => set((state) => {
        const newCart = { ...state.cart };
        if (newCart[dishId] && newCart[dishId].variants.length > 1) {
          newCart[dishId].variants.pop();
        } else if (newCart[dishId]) {
          delete newCart[dishId];
        }
        return { cart: newCart };
      }),

      removeDish: (dishId: string) => set((state) => {
        const newCart = { ...state.cart };
        if (newCart[dishId]) {
          delete newCart[dishId];
        }
        return { cart: newCart };
      }),
    }),
    {
      name: "cartStore",
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
