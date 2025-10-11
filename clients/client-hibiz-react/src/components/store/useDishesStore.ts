import type { DishType } from "@hi/db-models/src/validators";
import { createWithEqualityFn } from "zustand/traditional";

interface IDishStore {
  dishes: DishType[];
  setDishes: (dishes: DishType[]) => void;
  resetDishesStore: () => void;
}

export const useDishesStore = createWithEqualityFn<IDishStore>((set) => ({
  dishes: [],
  setDishes: (dishes) => set({ dishes: dishes }),
  resetDishesStore: () =>
    set({
      dishes: [],
    }),
}));
