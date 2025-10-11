import { createWithEqualityFn } from "zustand/traditional";

export type MenuBannerTypes = "PREVIEW" | "CREATE" | "LINK_DISHES" | "LIVE";

interface MenuBannerState {
  menuBannerType: MenuBannerTypes;
  setMenuBannerType: (type: MenuBannerTypes) => void;

  isPublishing: boolean;
  setIsPublishing: (isPublishing: boolean) => void;

  headerTitle: string;
  setHeaderTitle: (headerTitle: string) => void;

  timingId: string;
  setTimingId: (timingId: string) => void;

  selectedDishes: string[];
  setSelectedDishes: (dishes: string[]) => void;

  addDish: (dishId: string) => void;
  removeDish: (dishId: string) => void;

  searchItem: string;
  setSearchItem: (searchItem: string) => void;

  showSelectAll: boolean;
  setShowSelectAll: (showSelectAll: boolean) => void;

  reset: () => void;
}

export const useMenuBanner = createWithEqualityFn<MenuBannerState>(
  (set, get) => ({
    menuBannerType: "PREVIEW",
    setMenuBannerType: (type) => set({ menuBannerType: type }),

    isPublishing: false,
    setIsPublishing: (isPublishing) => set({ isPublishing }),

    headerTitle: "Preview",
    setHeaderTitle: (headerTitle) => set({ headerTitle }),

    timingId: "",
    setTimingId: (timingId) => set({ timingId }),

    selectedDishes: [],
    setSelectedDishes: (dishes) => set({ selectedDishes: dishes }),

    addDish: (dishId: string) => {
      const { selectedDishes } = get();
      if (!selectedDishes.includes(dishId)) {
        set({ selectedDishes: [...selectedDishes, dishId] });
      }
    },

    removeDish: (dishId: string) => {
      const { selectedDishes } = get();
      set({
        selectedDishes: selectedDishes.filter((id) => id !== dishId),
      });
    },

    searchItem: "",
    setSearchItem: (searchItem) => set({ searchItem }),

    showSelectAll: false,
    setShowSelectAll: (showSelectAll) => set({ showSelectAll }),

    // Reset function to reset all states to default values
    reset: () => {
      set({
        menuBannerType: "PREVIEW",
        isPublishing: false,
        headerTitle: "Preview",
        timingId: "",
        selectedDishes: [],
        searchItem: "",
        showSelectAll: false,
      });
    },
  }),
);
