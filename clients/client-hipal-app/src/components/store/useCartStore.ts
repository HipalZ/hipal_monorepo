import type { DishType } from "@hi/db-models/src/validators";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type REPEAT = "BOTTOM_PANEL" | "ADD_PREVIOUS" | "ADD_NEW" | "";

export interface ICartItem {
  id: string;
  dish: DishType;
  portion: { _id: number; name: string; price: number } | null;
  extras: Array<{ id: string; name: string; quantity: number; price: number }>;
  quantity: number;
}

export interface ICartHistory {
  businessId: string;
  cart: ICartItem[];
  date: number;
  tableName: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  _id: string;
}

function generateCartItemId(
  dishId: string,
  portionId: string | null,
  extras: Array<{ id: string; quantity: number }>,
): string {
  const sortedExtras = [...extras]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => `${e.id}:${e.quantity}`)
    .join("|");
  return `${dishId}_${portionId || "no_portion"}_${
    sortedExtras || "no_extras"
  }`;
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

  cartHistory: ICartHistory[];
  setCartHistory: (history: ICartHistory[]) => void;

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
      addToCart: (newItem) => {
        const itemId = generateCartItemId(
          newItem.dish._id,
          newItem.portion?._id || null,
          newItem.extras.map((e) => ({ id: e.id, quantity: e.quantity })),
        );

        newItem.id = itemId;

        set((state) => {
          const existingItemIndex = state.cart.findIndex(
            (item) => item.id === itemId,
          );

          if (existingItemIndex !== -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingItemIndex].quantity += newItem.quantity;
            return { cart: updatedCart };
          } else {
            return { cart: [...state.cart, newItem] };
          }
        });
      },

      cartHistory: [],
      setCartHistory: (history: ICartHistory[]) => {
        set({ cartHistory: history });
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
