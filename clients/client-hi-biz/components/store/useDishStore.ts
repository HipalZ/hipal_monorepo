// store.ts
import { create } from 'zustand';
import type { Dish } from '../types/businessData';

export type Hierarchy = 'PARENT' | 'CHILD' | null;

type DishSelectionStore = {
  selectedDishes: Dish[];
  hierarchy: Hierarchy;
  categoryName: string;
  visibility: boolean;
  availability: boolean;
  parentCategory: string;
  parentCategoryId: string;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
  setSelectedDishes: (dishes: Dish[]) => void;
  addDish: (newDish: Dish) => void;
  setCategoryName: (categoryName: string) => void;
  removeDish: (dishId: string) => void;
  setHierarchy: (hierarchy: Hierarchy) => void;
  setVisibility: (visibility: boolean) => void;
  setAvailability: (availability: boolean) => void;
  setParentCategory: (category: string) => void;
  setParentCategoryId: (id: string) => void;
  resetStore: () => void;
};

export const useDishSelectionStore = create<DishSelectionStore>((set) => ({
  selectedDishes: [],
  hierarchy: null,
  visibility: true,
  availability: true,
  categoryName: '',
  parentCategory: '',
  parentCategoryId: '',
  imageUrl: '',
  setImageUrl: (imageUrl: string) => set({ imageUrl: imageUrl }),
  setCategoryName: (categoryName: string) => set({ categoryName: categoryName }),
  setSelectedDishes: (dishes: Dish[]) => set({ selectedDishes: dishes }),
  addDish: (newDish) =>
    set((state) => ({
      selectedDishes: [...state.selectedDishes, newDish],
    })),
  removeDish: (dishId) =>
    set((state) => ({
      selectedDishes: state.selectedDishes.filter((dish) => dish._id !== dishId),
    })),
  setHierarchy: (hierarchy) => set({ hierarchy }),
  setVisibility: (visibility: boolean) => set({ visibility }),
  setAvailability: (availability: boolean) => set({ availability }),
  setParentCategory: (category: string) => set({ parentCategory: category }),
  setParentCategoryId: (id: string) => set({ parentCategoryId: id }),
  resetStore: () =>
    set({
      selectedDishes: [],
      hierarchy: null,
      visibility: true,
      availability: true,
      categoryName: '',
      parentCategory: '',
      parentCategoryId: '',
      imageUrl: '',
    }),
}));
