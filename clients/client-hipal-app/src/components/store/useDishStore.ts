import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DishType } from "@hi/db-models/src/validators";

interface DishState {
  dishes: DishType;
  selectedPortion: string | null;
  selectedAddOns: { [addOnId: string]: number };

  addDish: (dishData: DishType) => void;
  setSelectedPortion: (portion: string) => void;
  setSelectedAddOns: (addOnId: string, quantity: number) => void;
  resetSelections: () => void;
}

export const useDishStore = create(
  persist<DishState>(
    (set) => ({
      dishes: {} as DishType,
      selectedPortion: null,
      selectedAddOns: {},
      setSelectedAddOns: (addOnId, quantity) => {
        set((state) => ({
          selectedAddOns: {
            ...state.selectedAddOns,
            [addOnId]: quantity
          }
        }));
      },
      setSelectedPortion: (portion) => {
        set({ selectedPortion: portion });
      },
      addDish: (dishData) => {
        set({ dishes: dishData });
      },
      resetSelections: () => {
        set({ dishes: {} as DishType, selectedPortion: null, selectedAddOns: {} });
      },
    }),
    {
      name: "dish-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
