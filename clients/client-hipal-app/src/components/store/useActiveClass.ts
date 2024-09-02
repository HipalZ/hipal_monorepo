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

  // banner redirections
  activeType: string;
  setActiveType: (type: string) => void;
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

      activeType: "",
      setActiveType: (type) => set(() => ({ activeType: type })),
    }),
    {
      name: "activecategory",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
