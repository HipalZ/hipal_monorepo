// src/components/store/useMenuPageStore.ts
import type { CategoryType } from '@hi/db-models/src/validators';
import { create } from 'zustand';
export type MenuPageType = "DISHES" | "MAIN_CATEGORY" | "SUB_CATEGORY" | "ADD_ON";
export type CategoryTypeToggle = "MAIN_CATEGORY" | "SUB_CATEGORY" | "";
export type CategoryStep = "CATEGORY_STEP_1" | "CATEGORY_STEP_2" | "CATEGORY_STEP_3" |"" | "LINK_MAIN_CATEGORY" | "LINK_SUB_CATEGORY" | "LINK_DISH";
interface MenuPageStore {

    categories: CategoryType[];
    setCategories: (categories: CategoryType[]) => void;

    selectedPage: MenuPageType;
    setSelectedPage: (page: MenuPageType) => void;

    openMenu: boolean;
    setOpenMenu: (open: boolean) => void;

    selectedCategory: CategoryTypeToggle;
    setSelectedCategory: (category: CategoryTypeToggle) => void;

    categoryName: string;
    setCategoryName: (name: string) => void;

    categoryStep: CategoryStep;
    setCategoryStep: (step: CategoryStep) => void;

    selectedIds: string[];
    handleCategoryChange: (categoryId: string) => void;

    search: string;
    setSearch: (search: string) => void;

    searchVisible: boolean;
    setSearchVisible: (show: boolean) => void;

    visibilityFilter: string;
    setVisibilityFilter: (filter: string) => void;

    sortOrder:string;
    setSortOrder: (order: string) => void;

    resetStore: () => void;
}

const useMenuPageStore = create<MenuPageStore>((set) => ({

    categories: [],
    setCategories: (categories) => set({ categories }),

    selectedPage: "DISHES",
    setSelectedPage: (page: MenuPageType) => set({ selectedPage: page }),

    openMenu: false,
    setOpenMenu: (open: boolean) => set({ openMenu: open }),

    selectedCategory: "",
    setSelectedCategory: (category: CategoryTypeToggle) => set({ selectedCategory: category }),

    categoryName: "",
    setCategoryName: (name: string) => set({ categoryName: name }),

    categoryStep: "CATEGORY_STEP_1",
    setCategoryStep: (step: CategoryStep) => set({ categoryStep: step }),

   

    selectedIds: [],
    handleCategoryChange: (newId: string) => set(state => ({
        selectedIds: state.selectedIds.includes(newId)
            ? state.selectedIds.filter(id => id !== newId)
            : [...state.selectedIds, newId]
    })),

   search: "",
    setSearch: (search: string) => set({ search }),

    searchVisible: false,
    setSearchVisible: (show: boolean) => set({ searchVisible: show }),

    visibilityFilter:"all",
    setVisibilityFilter: (filter: string) => set({ visibilityFilter: filter }),

    sortOrder:"asc",
    setSortOrder: (order: string) => set({ sortOrder: order }),
    
    resetStore: () => set({
        openMenu: false,
        selectedCategory: "",
        categoryName: "",
        selectedIds: [],
        categoryStep:"CATEGORY_STEP_1"
    })
}));

export default useMenuPageStore;
