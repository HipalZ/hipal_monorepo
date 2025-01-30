import { create } from "zustand";

interface DishEdit {
  _id: string;
  name?: string;
  price?: number;
  availability?: boolean;
}

interface EditDishesState {
  editedDishes: DishEdit[];
  addEditedDish: (edit: DishEdit) => void;
  clearEditedDishes: () => void;
}

export const useEditDishesStore = create<EditDishesState>((set) => ({
  editedDishes: [],
  addEditedDish: (edit) =>
    set((state) => {
      const idx = state.editedDishes.findIndex((d) => d._id === edit._id);
      if (idx > -1) {
        // Update existing dish edit
        const updated = [...state.editedDishes];
        updated[idx] = { ...updated[idx], ...edit };
        return { editedDishes: updated };
      } else {
        return { editedDishes: [...state.editedDishes, edit] };
      }
    }),
  clearEditedDishes: () => set({ editedDishes: [] }),
}));
