import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface IUseSettings {
  isActiveCategory: string;
  setActiveCategory: (categoryId: string) => void;
  isActiveDishType: string;
  setActiveDishType: (dishTypeId: string) => void;
  isActiveParentCategory: string;
  setActiveParentCategory: (category: string) => void;
  isActiveParentCategoryName: string;
  setActiveParentCategoryName: (category: string) => void;
  isActiveChildCategory: string;
  setActiveChildCategory: (category: string) => void;
  isActiveChildCategoryName: string;
  setActiveChildCategoryName: (category: string) => void;

  // banner redirections
  activeType: string;
  setActiveType: (type: string) => void;

  observerActive: boolean;
  setObserverActive: (value: boolean) => void;
}

export const useActiveClass = create(
  persist<IUseSettings>(
    (set) => ({
      isActiveCategory: "",
      isActiveDishType: "all",
      isActiveParentCategory: "",
      isActiveParentCategoryName: "",
      setActiveParentCategoryName: (category) =>
        set(() => ({ isActiveParentCategoryName: category })),
      setActiveParentCategory: (category) =>
        set(() => ({ isActiveParentCategory: category })),
      setActiveCategory: (categoryId) =>
        set(() => ({ isActiveCategory: categoryId })),
      setActiveDishType: (dishTypeId) =>
        set(() => ({ isActiveDishType: dishTypeId })),
      isActiveChildCategory: "",
      isActiveChildCategoryName: "",
      setActiveChildCategory: (category) =>
        set(() => ({ isActiveChildCategory: category })),
      setActiveChildCategoryName: (category) =>
        set(() => ({ isActiveChildCategoryName: category })),

      activeType: "",
      setActiveType: (type) => set(() => ({ activeType: type })),

      observerActive: false,
      setObserverActive: (value) => set(() => ({ observerActive: value })),
    }),
    {
      name: "activecategory",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
