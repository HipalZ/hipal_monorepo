import { create } from "zustand";

type Store = {
  selectedDishes: string[];
  toggleDishSelection: (dishId: string) => void;
  clearSelectedDishes: () => void;
};

export const useStore = create<Store>((set) => ({
  selectedDishes: [],
  toggleDishSelection: (dishId) => {
    set((state) => {
      if (state.selectedDishes.includes(dishId)) {
        return {
          selectedDishes: state.selectedDishes.filter((id) => id !== dishId),
        };
      } else {
        return {
          selectedDishes: [...state.selectedDishes, dishId],
        };
      }
    });
  },
  clearSelectedDishes: () => {
    set({
      selectedDishes: [],
    });
  },
}));
// export const useStore = create<Store>((set) => ({
//   selectedDishes: [],
//   toggleDishSelection: (dishId) => {
//     set((state) => ({
//       selectedDishes: dishId ? [...state.selectedDishes, dishId] : [], // Add dishId or reset to an empty array
//     }));
//   },
// }));
