// src/components/store/useMenuPageStore.ts
import { create } from 'zustand';
export type MenuPageType = "DISHES" | "MAIN_CATEGORY" | "SUB_CATEGORY" | "ADD_ON";
export type categoryType = "MAIN_CATEGORY" | "SUB_CATEGORY" | "";
export type categorySubtypes = "" | "LINK_MAIN_CATEGORY" | "LINK_SUB_CATEGORY" | "LINK_DISH";
export type CategoryStep = "CATEGORY_STEP_1" | "CATEGORY_STEP_2" | "CATEGORY_STEP_3";
interface MenuPageStore {

    selectedPage: MenuPageType;
    setSelectedPage: (page: MenuPageType) => void;

    openMenu: boolean;
    setOpenMenu: (open: boolean) => void;

    selectedCategory: categoryType;
    setSelectedCategory: (category: categoryType) => void;

    categoryName: string;
    setCategoryName: (name: string) => void;

    categorySubtypes: categorySubtypes
    setCategorySubtypes: (subtype: categorySubtypes) => void;

    categoryStep: CategoryStep;
    setCategoryStep: (step: CategoryStep) => void;

    resetStore: () => void;
}

const useMenuPageStore = create<MenuPageStore>((set) => ({
    selectedPage: "DISHES",
    setSelectedPage: (page: MenuPageType) => set({ selectedPage: page }),

    openMenu: false,
    setOpenMenu: (open: boolean) => set({ openMenu: open }),

    selectedCategory: "",
    setSelectedCategory: (category: categoryType) => set({ selectedCategory: category }),

    categorySubtypes: "",
    setCategorySubtypes: (subtype: categorySubtypes) => set({ categorySubtypes: subtype }),

    categoryName: "",
    setCategoryName: (name: string) => set({ categoryName: name }),

    categoryStep: "CATEGORY_STEP_1",
    setCategoryStep: (step: CategoryStep) => set({ categoryStep: step }),

    resetStore: () => set({
        openMenu: false,
        selectedCategory: "",
        categoryName: ""
    })
}));

export default useMenuPageStore;
