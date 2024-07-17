// src/components/store/useMenuPageStore.ts
import { create } from 'zustand';
export type MenuPageType = "DISHES" | "MAIN_CATEGORY" | "SUB_CATEGORY" | "ADD_ON";
export type categoryType = "MAIN_CATEGORY" | "SUB_CATEGORY" | "";
interface MenuPageStore {

    selectedPage: MenuPageType;
    setSelectedPage: (page: MenuPageType) => void;

    openMenu: boolean;
    setOpenMenu: (open: boolean) => void;

    selectedCategory: categoryType;
    setSelectedCategory: (category: categoryType) => void;

    categoryName: string;
    setCategoryName: (name: string) => void;

    resetStore: () => void;
}

const useMenuPageStore = create<MenuPageStore>((set) => ({
    selectedPage: "DISHES",
    setSelectedPage: (page: MenuPageType) => set({ selectedPage: page }),

    openMenu: false,
    setOpenMenu: (open: boolean) => set({ openMenu: open }),

    selectedCategory: "",
    setSelectedCategory: (category: categoryType) => set({ selectedCategory: category }),

    categoryName: "",
    setCategoryName: (name: string) => set({ categoryName: name }),

    resetStore: () => set({
        openMenu: false,
        selectedCategory: "",
        categoryName: ""
    })
}));

export default useMenuPageStore;
