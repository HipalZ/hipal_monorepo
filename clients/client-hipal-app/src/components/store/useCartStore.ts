import type { DishType } from "@hi/db-models/src/validators";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type REPEAT = "BOTTOM_PANEL" | "ADD_PREVIOUS" | "ADD_NEW" | "";


interface ICartItem {
    id: string;
    dish: DishType;
    portion: { _id: number; name: string; price: number } | null;
    extras: Array<{ id: string; name: string; quantity: number; price: number }>;
    quantity: number;
  }

interface ICartStore {
  openBottomPanel: boolean;
  setOpenBottomPanel: (open: boolean) => void;

  cartPopup: REPEAT;
  setCartPopup: (popup: REPEAT) => void;

  selectedDish: DishType;
  setSelectedDish: (dish: DishType) => void;

  selectedPortion: { _id: number; name: string; price: number } | null;
  setSelectedPortion: (portion: {
    _id: number;
    name: string;
    price: number;
  }) => void;

  selectedChoices: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;

  setSelectedChoice: (choice: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }) => void;

  removeSelectedChoice: (choiceId: string) => void;

  resetSelections: () => void;

  cart: Array<ICartItem>;
  addToCart: (item: ICartItem) => void;
  updateCartItem: (item: ICartItem) => void;
  removeFromCart: (id: string) => void;
  setCartEmpty: () => void;

  dishes: DishType;
}

export const useCartStore = create(
  persist<ICartStore>(
    (set) => ({
      openBottomPanel: false,
      setOpenBottomPanel: (open) => {
        set({ openBottomPanel: open });
      },

      cartPopup: "",
      setCartPopup: (popup) => {
        set({ cartPopup: popup });
      },

      selectedDish: {} as DishType,
      setSelectedDish: (dish) => {
        set({ selectedDish: dish });
      },

      selectedPortion: null,
      setSelectedPortion: (portion) => {
        set({ selectedPortion: portion });
      },

        resetSelections: () => {
            set({
            selectedDish: {} as DishType,
            selectedPortion: null,
            selectedChoices: [],
            });
        },

      selectedChoices: [],
      setSelectedChoice: (choice) => {
        set((state) => ({
          selectedChoices: [
            ...state.selectedChoices.filter((c) => c.id !== choice.id),
            choice,
          ],
        }));
      },
      removeSelectedChoice: (choiceId) => {
        set((state) => ({
          selectedChoices: state.selectedChoices.filter(
            (c) => c.id !== choiceId,
          ),
        }));
      },

        cart: [],
        setCartEmpty: () => {
          set({ cart: [] });
        },
        addToCart: (item) => {
          set((state) => {
            return {
              cart: [...state.cart, item],
            };
          });
        },

        updateCartItem: (item) => {
            set((state) => ({
              cart: state.cart.map((i) => (i.id === item.id ? item : i)),
            }));
          },

        removeFromCart: (id) => {
            set((state) => ({
              cart: state.cart.filter((i) => i.id !== id),
            }));
          },

      dishes: {} as DishType,
    }),
    {
      name: "cart-store-updated",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
