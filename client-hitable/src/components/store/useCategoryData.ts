// store/useCategoryStore.ts
import {create} from 'zustand';
import { persist } from 'zustand/middleware';
import type { IBusinessData } from '../types/hiTableData';


interface CategoryStore {
  data: IBusinessData | null;
  lastUpdate: number | null;
  saveCategories: (data: object) => void;
}

export const useCategoryStore = create(
  persist<CategoryStore>(
    (set) => ({
      data: null,
      lastUpdate: null,
      saveCategories: (data: any) => {
        set({ data:data, lastUpdate: Date.now() });
      },
    }),
    {
      name: "category-data",
      getStorage: () => localStorage,
    }
  )
);
