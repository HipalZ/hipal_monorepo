// src/store/useCategoryStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CategoryType } from '@hi/db-models/src/validators';

interface ICatStore {
  categories: CategoryType[];
  setCategories: (categories: CategoryType[]) => void;

  subCategories: CategoryType[];
  setSubCategories: (subCategories: CategoryType[]) => void;
}

export const useCategoryStore = create(
  persist<ICatStore>(
    (set) => ({
      categories: [],
      setCategories: (categories) => set({ categories }),

      subCategories: [],
      setSubCategories: (subCategories) => set({ subCategories }),
    }),
    {
      name: 'category-store', 
      storage: createJSONStorage(() =>localStorage)
    }
  )
);
