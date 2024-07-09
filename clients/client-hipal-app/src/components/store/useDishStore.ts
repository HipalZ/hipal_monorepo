import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IDish, IExtraItem } from "../types/businessData";

// Define the store's state structure
interface DishState {
  dishes: IDish;
  selectedPortion: string | null;
  selectedExtras: IExtraItem;

  addDish: (dishData: IDish) => void;
  setSelectedPortion: (portion: string, price: number) => void;
  setSelectedExtras: (extras: IExtraItem) => void;
  resetSelections: () => void;
}

export const useDishStore = create(
  persist<DishState>(
    (set) => ({
      dishes: {} as IDish,
      selectedPortion: null,
      selectedExtras: {} as IExtraItem,
      setSelectedExtras(extras) {
        set({ selectedExtras: extras });
      },
      setSelectedPortion(portion) {
        set({ selectedPortion: portion });
      },
      addDish: (dishData: IDish) =>
        set((state) => ({
          dishes: dishData,
        })),
      resetSelections: () =>
        set({
          dishes: {} as IDish,
          selectedPortion: null,
          selectedExtras: {} as IExtraItem,
        }),
    }),
    {
      name: "dish-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
