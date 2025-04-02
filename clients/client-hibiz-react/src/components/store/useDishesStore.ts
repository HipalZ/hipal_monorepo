import type { DishType } from "@hi/db-models/src/validators";
import { create } from "zustand";

interface IDishStore {
  dishes: DishType[];
  setDishes: (dishes: DishType[]) => void;
  resetDishesStore: () => void;
}

export const useDishesStore = create<IDishStore>((set) => ({
  dishes: [],
  setDishes: (dishes) => set({ dishes: dishes }),
  resetDishesStore: () =>
    set({
      dishes: [],
    }),
}));
