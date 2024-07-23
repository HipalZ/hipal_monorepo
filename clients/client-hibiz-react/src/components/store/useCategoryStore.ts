// src/store/useCategoryStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CategoryType,AddOnType } from '@hi/db-models/src/validators';


interface ICatStore {
  categories: CategoryType[];
  setCategories: (categories: CategoryType[]) => void;

  subCategories: CategoryType[];
  setSubCategories: (subCategories: CategoryType[]) => void;

  addOns:AddOnType[];
  setAddOnTypes:(addOns:AddOnType[])=>void;

}

export const useCategoryStore = create(
  persist<ICatStore>(
    (set) => ({
      categories: [],
      setCategories: (categories) => set({ categories }),

      subCategories: [],
      setSubCategories: (subCategories) => set({ subCategories }),

      addOns:[],
      setAddOnTypes:(addOns)=>set({addOns})

    }),
    {
      name: 'category-store', 
      storage: createJSONStorage(() =>localStorage)
    }
  )
);
