import type { DishType } from "@hi/db-models/src/validators";
import { toast } from "react-toastify";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type REPEAT = "BOTTOM_PANEL" | "ADD_PREVIOUS" | "ADD_NEW" | "";

export interface ICartItem {
  id: string;
  dish: DishType;
  portion: { _id: number; name: string; price: number } | null;
  extras: Array<{ id: string; name: string; quantity: number; price: number }>;
  quantity: number;
  instruction?: string;
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
  name?: string;
  phone?: string;
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

  selectedDish: DishType | null;
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

  instructionId: string;
  setInstructionId: (open: string) => void;

  instruction: string;
  setInstruction: (instruction: string) => void;

  openInstructionModal: boolean;
  setOpenInstructionModal: (open: boolean) => void;

  addInstructionToDish: (instruction: string) => void;
  removeInstructionFromDish: (id: string) => void;
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

      selectedDish: {} as DishType | null,
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
          }
          return { cart: [...state.cart, newItem] };
        });
      },

      cartHistory: [],
      setCartHistory: (history) => {
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

      instruction: "",
      setInstruction: (instruction) => {
        set({ instruction });
      },

      instructionId: "",
      setInstructionId: (id) => {
        set({ instructionId: id });
      },

      openInstructionModal: false,
      setOpenInstructionModal: (open) => {
        set({ openInstructionModal: open });
      },

      addInstructionToDish: (instruction: string) => {
        set((state) => {
          const dishIndex = state.cart.findIndex(
            (item) => String(item.id) === state.instructionId,
          );
          if (dishIndex !== -1) {
            const updatedCart = [...state.cart];
            updatedCart[dishIndex].dish = {
              ...updatedCart[dishIndex].dish,
              instruction,
            };
            toast.success("Cooking Instruction noted!");
            return { cart: updatedCart };
          }

          return state;
        });
      },

      removeInstructionFromDish: (id: string) => {
        set((state) => {
          const dishIndex = state.cart.findIndex(
            (item) => String(item.id) === id,
          );
          if (dishIndex !== -1) {
            const updatedCart = [...state.cart];
            const { instruction, ...restDish } = updatedCart[dishIndex].dish;
            updatedCart[dishIndex].dish = restDish;
            set({ instruction: "" });
            toast.success("Cooking Instruction noted removed!");
            return { cart: updatedCart };
          }

          return state;
        });
      },

      dishes: {} as DishType,
    }),
    {
      name: "cart-store-updated",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
