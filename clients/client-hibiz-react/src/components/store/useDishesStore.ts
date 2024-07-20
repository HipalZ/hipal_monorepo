import type { DishType } from "@hi/db-models/src/validators";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface IDishStore {
  dishes: DishType[];
  setDishes: (dishes: DishType[]) => void;
  resetDishesStore: () => void;
}

export const useDishesStore = create(
  persist<IDishStore>(
    (set) => ({
      dishes: [],
      setDishes: (dishes) => set({ dishes: dishes }),
      resetDishesStore: () =>
        set({
          dishes: [],
        }),
    }),
    {
      name: "dishes-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
