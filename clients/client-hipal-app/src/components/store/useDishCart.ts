import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IDish } from "@/components/types/businessData";

export interface SelectedExtra {
  extraId: string;
  quantity: number;
  name: string;
  pricePerUnit: number;
}

export interface CartItem {
  id?: string;
  dish: IDish;
  quantity: number;
  selectedPortion: string | null;
  selectedPortionPrice: number;
  selectedExtras: SelectedExtra[];
  totalPrice: number;
}

interface DishCartState {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItem: (
    cartItemId: string,
    type: "portion" | "extras" | "quantity",
    payload: any,
  ) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
}

export const useDishCart = create(
  persist<DishCartState>(
    (set) => ({
      cartItems: [],
      addToCart: (item: CartItem) =>
        set((state) => {
          return {
            cartItems: [
              ...state.cartItems,
              { ...item, id: crypto.randomUUID() },
            ],
          };
        }),
      removeFromCart: (cartItemId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== cartItemId),
        })),
      updateCartItem: (cartItemId, type, payload) =>
        set((state) => ({
          cartItems: state.cartItems.map((ci) => {
            if (ci.id === cartItemId) {
              switch (type) {
                case "portion":
                  return {
                    ...ci,
                    selectedPortion: payload.portion,
                    selectedPortionPrice: payload.portionPrice,
                  };
                case "extras":
                  return { ...ci, selectedExtras: payload.extras };
                case "quantity":
                  return { ...ci, quantity: payload.quantity };
                default:
                  return ci;
              }
            }
            return ci;
          }),
        })),
      increaseQuantity: (cartItemId) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),
      decreaseQuantity: (cartItemId) =>
        set((state) => ({
          cartItems: state.cartItems
            .map((item) => {
              if (item.id === cartItemId) {
                if (item.quantity > 1) {
                  return { ...item, quantity: item.quantity - 1 };
                }
                return null;
              }
              return item;
            })
            .filter((item) => item !== null),
        })),
    }),
    {
      name: "dish-cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
