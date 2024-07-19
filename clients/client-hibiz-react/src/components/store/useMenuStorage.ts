import type {
  DishType,
  DishTypeEnumType,
  PortionType,
  TagsEnumType,
} from "@hi/db-models/src/validators";
import { create } from "zustand";

export type MenuPageType =
  | "DISHES"
  | "MAIN_CATEGORY"
  | "SUB_CATEGORY"
  | "ADD_ON";
export type CategoryTypeToggle = "MAIN_CATEGORY" | "SUB_CATEGORY" | "";
export type CategoryStep =
  | "CATEGORY_STEP_1"
  | "CATEGORY_STEP_2"
  | "CATEGORY_STEP_3"
  | ""
  | "LINK_MAIN_CATEGORY"
  | "LINK_SUB_CATEGORY"
  | "LINK_DISH";
export type categoryType = "MAIN_CATEGORY" | "SUB_CATEGORY" | "";
export type categorySubtypes =
  | ""
  | "LINK_MAIN_CATEGORY"
  | "LINK_SUB_CATEGORY"
  | "LINK_DISH";
export type DishStep =
  | "DISH_STEP_1"
  | "DISH_STEP_2"
  | "PORTION_STEP"
  | "LINK_CATEGORY_STEP"
  | "LINK_RECOMMENDATION_STEP"
  | "LINK_ADDON_STEP"
  | "LINK_ADD_TAGS";
export enum DishSteps {
  DISH_STEP_1 = "DISH_STEP_1",
  DISH_STEP_2 = "DISH_STEP_2",
  PORTION_STEP = "PORTION_STEP",
  LINK_CATEGORY_STEP = "LINK_CATEGORY_STEP",
  LINK_RECOMMENDATION_STEP = "LINK_RECOMMENDATION_STEP",
  LINK_ADDON_STEP = "LINK_ADDON_STEP",
  LINK_ADD_TAGS = "LINK_ADD_TAGS",
}
export type ImageFiles = {
  first: File | null;
  second: File | null;
  third: File | null;
};

export type ImagePreviews = {
  first: string | ArrayBuffer | null;
  second: string | ArrayBuffer | null;
  third: string | ArrayBuffer | null;
};

export type SetImageFilesFunction = (
  update: (prev: ImageFiles) => ImageFiles,
) => void;
export type SetImagePreviewsFunction = (
  update: (prev: ImagePreviews) => ImagePreviews,
) => void;

interface MenuPageStore {
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

  sortOrder: string;
  setSortOrder: (order: string) => void;

  resetStore: () => void;

  imagePreview: string | null;
  setImagePreview: (image: string | null) => void;

  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;

  //dishes
  dishes: DishType[];
  setDishes: (dishes: DishType[]) => void;

  selectedDish: string;
  setSelectedDish: (dish: string) => void;

  dishName: string;
  setDishName: (name: string) => void;

  dishPrice: number;
  setDishPrice: (price: number) => void;

  visibility: boolean;
  setVisibility: (visibility: boolean) => void;

  avgTime: number;
  setAvgTime: (time: number) => void;

  dishTypes: DishTypeEnumType[];
  setDishTypes: (types: DishTypeEnumType[]) => void;

  categoryIds: string[];
  setCategoryIds: (ids: string[]) => void;

  portions: PortionType[];
  setPortions: (portions: PortionType[]) => void;

  addons: string[];
  setAddons: (addons: string[]) => void;

  dishImages: string[];
  setDishImages: (images: string[]) => void;

  tags: TagsEnumType[];
  setTags: (tags: TagsEnumType[]) => void;

  delayTime: number;
  setDelayTime: (time: number) => void;

  availability: boolean;
  setAvailability: (avail: boolean) => void;

  calories: string;
  setCalories: (calories: string) => void;

  recommendations: string[];
  setRecommendations: (rec: string[]) => void;

  dishStep: DishStep;
  setDishStep: (step: DishStep) => void;

  selectedCatIds: string[];
  setSelectedCatIds: (ids: string[]) => void;

  recommendationIds: string[];
  setRecommendationIds: (ids: string[]) => void;

  dishDescription: string;
  setDishDescription: (description: string) => void;

  addonIds: string[];
  setAddonIds: (ids: string[]) => void;

  imageFiles: ImageFiles;
  setImageFiles: SetImageFilesFunction;

  imagePreviews: ImagePreviews;
  setImagePreviews: SetImagePreviewsFunction;

  showCropper: boolean;
  setShowCropper: (show: boolean) => void;

  cropping: { image: string; type: string };
  setCropping: (crop: { image: string; type: string }) => void;

  cropperRef: React.MutableRefObject<any>;
}

const useMenuPageStore = create<MenuPageStore>((set) => ({
  selectedPage: "DISHES",
  setSelectedPage: (page: MenuPageType) => set({ selectedPage: page }),

  openMenu: false,
  setOpenMenu: (open: boolean) => set({ openMenu: open }),

  selectedCategory: "",
  setSelectedCategory: (category: CategoryTypeToggle) =>
    set({ selectedCategory: category }),

  categoryName: "",
  setCategoryName: (name: string) => set({ categoryName: name }),

  categoryStep: "CATEGORY_STEP_1",
  setCategoryStep: (step: CategoryStep) => set({ categoryStep: step }),

  selectedIds: [],
  handleCategoryChange: (newId: string) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(newId)
        ? state.selectedIds.filter((id) => id !== newId)
        : [...state.selectedIds, newId],
    })),

  search: "",
  setSearch: (search: string) => set({ search }),

  searchVisible: false,
  setSearchVisible: (show: boolean) => set({ searchVisible: show }),

  visibilityFilter: "all",
  setVisibilityFilter: (filter: string) => set({ visibilityFilter: filter }),

  sortOrder: "asc",
  setSortOrder: (order: string) => set({ sortOrder: order }),

  resetStore: () =>
    set({
      openMenu: false,
      selectedCategory: "",
      categoryName: "",
      selectedIds: [],
      categoryStep: "CATEGORY_STEP_1",
      selectedDish: "",
      dishName: "",
      dishStep: "DISH_STEP_1",
      search: "",
      searchVisible: false,
      imagePreview: null,
      selectedFile: null,
    }),
  imagePreview: null,
  setImagePreview: (image) => set({ imagePreview: image }),

  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file }),

  //dishes
  dishes: [],
  setDishes: (dishes: DishType[]) => set({ dishes }),

  selectedDish: "",
  setSelectedDish: (dish: string) => set({ selectedDish: dish }),

  dishName: "",
  setDishName: (name: string) => set({ dishName: name }),

  dishPrice: 0,
  setDishPrice: (price: number) => set({ dishPrice: price }),

  visibility: true,
  setVisibility: (visibility: boolean) => set({ visibility: visibility }),

  avgTime: 0,
  setAvgTime: (time: number) => set({ avgTime: time }),

  dishTypes: [],
  setDishTypes: (types: DishTypeEnumType[]) => set({ dishTypes: types }),

  categoryIds: [],
  setCategoryIds: (ids: string[]) => set({ categoryIds: ids }),

  portions: [],
  setPortions: (portions: PortionType[]) => set({ portions }),

  addons: [],
  setAddons: (addons: string[]) => set({ addons: addons }),

  dishImages: [],
  setDishImages: (images: string[]) => set({ dishImages: images }),

  tags: [],
  setTags: (tags: TagsEnumType[]) => set({ tags: tags }),

  delayTime: 0,
  setDelayTime: (time: number) => set({ delayTime: time }),

  availability: true,
  setAvailability: (avail: boolean) => set({ availability: avail }),

  calories: "",
  setCalories: (calories: string) => set({ calories }),

  recommendations: [],
  setRecommendations: (rec: string[]) => set({ recommendations: rec }),

  dishStep: DishSteps.DISH_STEP_1,
  setDishStep: (step: DishStep) => set({ dishStep: step }),

  selectedCatIds: [],
  setSelectedCatIds: (ids: string[]) => set({ selectedCatIds: ids }),

  recommendationIds: [],
  setRecommendationIds: (ids: string[]) => set({ recommendationIds: ids }),

  dishDescription: "",
  setDishDescription: (description: string) =>
    set({ dishDescription: description }),

  addonIds: [],
  setAddonIds: (ids: string[]) => set({ addonIds: ids }),

  imageFiles: { first: null, second: null, third: null } as ImageFiles,
  setImageFiles: (files: ImageFiles | ((prev: ImageFiles) => ImageFiles)) =>
    set((state) => ({
      imageFiles: typeof files === "function" ? files(state.imageFiles) : files,
    })),

  imagePreviews: { first: null, second: null, third: null } as ImagePreviews,
  setImagePreviews: (
    previews: ImagePreviews | ((prev: ImagePreviews) => ImagePreviews),
  ) =>
    set((state) => ({
      imagePreviews:
        typeof previews === "function"
          ? previews(state.imagePreviews)
          : previews,
    })),

  showCropper: false,
  setShowCropper: (show: boolean) => set({ showCropper: show }),

  cropping: { image: "", type: "" },
  setCropping: (crop: { image: string; type: string }) =>
    set({ cropping: crop }),

  cropperRef: { current: null },
}));

export default useMenuPageStore;
