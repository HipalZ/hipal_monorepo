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
  | "EDIT_MAIN_CATEGORY"
  | "EDIT_SUB_CATEGORY"
  | "LINK_DISH";
export type categoryType = "MAIN_CATEGORY" | "SUB_CATEGORY" | "";
export type Addon = "ADD_ON" | "ADD_CHOICE" | "LINK_DISHES" |"EDIT_ADDON";
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
  | "LINK_ADD_TAGS"
  | "CONFIRM_DELETE";

export enum DishSteps {
  DISH_STEP_1 = "DISH_STEP_1",
  DISH_STEP_2 = "DISH_STEP_2",
  PORTION_STEP = "PORTION_STEP",
  LINK_CATEGORY_STEP = "LINK_CATEGORY_STEP",
  LINK_RECOMMENDATION_STEP = "LINK_RECOMMENDATION_STEP",
  LINK_ADDON_STEP = "LINK_ADDON_STEP",
  LINK_ADD_TAGS = "LINK_ADD_TAGS",
  CONFIRM_DELETE = "CONFIRM_DELETE",
}
export type ImageFiles = {
  first: File | null;
  second: File | null;
  third: File | null;
};

export interface Choice {
  uuid: string;
  name: string;
  price: number;
  description: string;
  visibility: boolean;
  availability: boolean;
  maxQuantity: number;
  choiceDishType: string[];
}

export type AddonChoice = "CHECKBOX" | "NUMBER";

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
  setSelectedIds: (ids: string[]) => void;
  handleCategoryChange: (categoryId: string) => void;

  editingMainCat: boolean;
  setEditingMainCat: (editing: boolean) => void;

  editingSubCat: boolean;
  setEditingSubCat: (editing: boolean) => void;

  catId: string;
  setCatId: (id: string) => void;

  search: string;
  setSearch: (search: string) => void;

  searchVisible: boolean;
  setSearchVisible: (show: boolean) => void;

  visibilityFilter: string;
  setVisibilityFilter: (filter: string) => void;

  sortOrder: string;
  setSortOrder: (order: string) => void;

  resetStore: () => void;
  setEditDishFunction: (data: DishType) => void;

  imagePreview: string | null;
  setImagePreview: (image: string | null) => void;

  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;

  //dishes
  dishes: DishType[];
  setDishes: (dishes: DishType[]) => void;

  editDish: DishType;
  setEditDish: (dish: DishType) => void;

  selectedDish: string;
  setSelectedDish: (dish: string) => void;

  dishName: string;
  setDishName: (name: string) => void;

  dishPrice: number;
  setDishPrice: (price: number) => void;

  visibility: boolean;
  setVisibility: (visibility: boolean) => void;

  dishTypes: DishTypeEnumType[];
  setDishTypes: (types: DishTypeEnumType[]) => void;

  categoryIds: string[];
  setCategoryIds: (ids: string[]) => void;

  idCheck: string[];
  setIdCheck: (id: string[]) => void;

  portions: PortionType[];
  setPortions: (portions: PortionType[]) => void;

  addons: string[];
  setAddons: (addons: string[]) => void;

  dishImages: string[];
  setDishImages: (images: string[]) => void;

  tags: TagsEnumType[];
  setTags: (tags: TagsEnumType[]) => void;

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

  cropping: {
    image: string;
    type: string;
  };
  setCropping: (crop: { image: string; type: string }) => void;

  cropperRef: React.MutableRefObject<any>;

  editOpenMenu: boolean;
  setEditOpenMenu: (menu: boolean) => void;

  removeCategoryIds: string[];
  removeAddOnIds: string[];
  removeRecommendationIds: string[];

  setRemoveCategoryIds: (ids: string[]) => void;
  setRemoveAddOnIds: (ids: string[]) => void;
  setRemoveRecommendationIds: (ids: string[]) => void;

  resetDishStore: () => void;
  showDeleteDish: boolean;
  setShowDeleteDish: (show: boolean) => void;

  resetEditDish: () => void;
  addOnToggle: Addon;
  setAddOnToggle: (addon: Addon) => void;

  addOnId: string;
  setAddOnId: (id: string) => void;

  addOnName: string;
  setAddOnName: (name: string) => void;

  minChoices: number;
  setMinChoices: (choices: number) => void;

  maxChoices: number;
  setMaxChoices: (choices: number) => void;

  addOnChoice: AddonChoice;
  setAddOnChoice: (choice: AddonChoice) => void;

  choiceName: string;
  setChoiceName: (name: string) => void;

  choicePrice: number;
  setChoicePrice: (price: number) => void;

  choiceQuantity: number;
  setChoiceQuantity: (quantity: number) => void;

  choiceDishTypes: DishTypeEnumType[];
  setChoiceDishTypes: (types: DishTypeEnumType[]) => void;

  addOnVisible: boolean;
  setAddOnVisible: (visible: boolean) => void;

  choiceVisible: boolean;
  setChoiceVisible: (visible: boolean) => void;

  addOnAvailable: boolean;
  setAddOnAvailable: (available: boolean) => void;

  choiceAvailable: boolean;
  setChoiceAvailable: (available: boolean) => void;

  choices: Choice[];
  setChoices: (choices: Choice[]) => void;
  addChoice: (choice: Choice) => void;
  resetChoiceFields: () => void;
  deleteChoice: (choiceId: string) => void;
  editChoiceId: string;
  setEditChoiceId: (id: string) => void;
  updateChoice: (updatedChoice: Choice) => void;
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

  idCheck: [],
  setIdCheck: (id: string[]) => set({ idCheck: id }),

  selectedIds: [],
  setSelectedIds: (ids: string[]) => set({ selectedIds: ids }),
  handleCategoryChange: (newId: string) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(newId)
        ? state.selectedIds.filter((id) => id !== newId)
        : [...state.selectedIds, newId],
    })),

  editingMainCat: false,
  setEditingMainCat: (editing: boolean) => set({ editingMainCat: editing }),

  editingSubCat: false,
  setEditingSubCat: (editing: boolean) => set({ editingSubCat: editing }),

  catId: "",
  setCatId: (id: string) => set({ catId: id }),

  search: "",
  setSearch: (search: string) => set({ search }),

  searchVisible: false,
  setSearchVisible: (show: boolean) => set({ searchVisible: show }),

  visibilityFilter: "all",
  setVisibilityFilter: (filter: string) => set({ visibilityFilter: filter }),

  availability: true,
  setAvailability: (avail: boolean) => set({ availability: avail }),

  sortOrder: "asc",
  setSortOrder: (order: string) => set({ sortOrder: order }),

  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file }),

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
      dishes: [],
      dishTypes: [],
      categoryIds: [],
      portions: [],
      addons: [],
      dishImages: [],
      tags: [],
      recommendations: [],
      selectedCatIds: [],
      recommendationIds: [],
      dishDescription: "",
      addonIds: [],
      catId: "",
      idCheck: [],
      imageFiles: { first: null, second: null, third: null },
      imagePreviews: { first: null, second: null, third: null },
      showCropper: false,
      cropping: { image: "", type: "" },
      cropperRef: { current: null },
      addOnToggle: "ADD_ON",
      addOnName: "",
      minChoices: 0,
      maxChoices: 0,
      addOnChoice: "CHECKBOX",
      choiceName: "",
      choicePrice: 0,
      choiceQuantity: 0,
      choiceDishTypes: [],
      addOnVisible: false,
      choiceVisible: false,
      addOnAvailable: true,
      choiceAvailable: true,
      choices: [],
      editChoiceId: "",
      removeCategoryIds: [],
      removeAddOnIds: [],
      removeRecommendationIds: [],
      editOpenMenu: false,
      showDeleteDish: false,
      addOnId: "",
    }),

  imagePreview: null,
  setImagePreview: (image) => set({ imagePreview: image }),

  //dishes
  dishes: [],
  setDishes: (dishes: DishType[]) => set({ dishes }),

  editDish: {},
  setEditDish: (dish: DishType) => set({ editDish: dish }),

  selectedDish: "",
  setSelectedDish: (dish: string) => set({ selectedDish: dish }),

  dishName: "",
  setDishName: (name: string) => set({ dishName: name }),

  dishPrice: 0,
  setDishPrice: (price: number) => set({ dishPrice: price }),

  visibility: true,
  setVisibility: (visibility: boolean) => set({ visibility: visibility }),

  dishTypes: [],
  setDishTypes: (types: DishTypeEnumType[]) => set({ dishTypes: types }),

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

  removeCategoryIds: [],
  removeAddOnIds: [],
  removeRecommendationIds: [],

  setRemoveCategoryIds: (ids: string[]) => set({ removeCategoryIds: ids }),
  setRemoveAddOnIds: (ids: string[]) => set({ removeAddOnIds: ids }),
  setRemoveRecommendationIds: (ids: string[]) =>
    set({ removeRecommendationIds: ids }),

  resetDishStore: () =>
    set({
      dishName: "",
      dishPrice: 0,
      visibility: true,
      dishTypes: [],
      portions: [],
      addons: [],
      dishImages: [],
      tags: [],
      availability: true,
      calories: "",
      recommendationIds: [],
      dishDescription: "",
      addonIds: [],
      imageFiles: { first: null, second: null, third: null },
      imagePreviews: { first: null, second: null, third: null },
      showCropper: false,
      cropping: { image: "", type: "" },
      selectedCatIds: [],
    }),

  editOpenMenu: false,

  setEditOpenMenu: (menu: boolean) => set({ editOpenMenu: menu }),

  showDeleteDish: false,

  setShowDeleteDish: (show: boolean) => set({ showDeleteDish: show }),

  setEditDishFunction: (editDish) => {
    set({
      _id: Object(editDish?._id),
      dishName: editDish?.name,
      dishPrice: editDish?.price,
      dishTypes: editDish?.dishTypes || [],
      portions: editDish?.portions || [],
      tags: Object(editDish?.tags) || [],
      availability: editDish?.availability,
      calories: editDish?.calories ?? "",
      dishDescription: editDish?.description ?? "",
      recommendationIds: Object(editDish?.recommendationIds) ?? [],
      addonIds: Object(editDish?.addOnIds) || [],
      selectedCatIds: Object(editDish?.categoryIds) || [],
      imagePreviews: {
        first: editDish?.images?.[0] ?? null,
        second: editDish?.images?.[1] ?? null,
        third: editDish?.images?.[2] ?? null,
      },
      visibility: editDish?.visibility,
    });
  },

  resetEditDish: () => {
    set({
      _id: "",
      dishName: "",
      dishPrice: 0,
      dishTypes: [],
      portions: [],
      tags: [],
      availability: true,
      visibility: true,
      calories: "",
      dishDescription: "",
      recommendationIds: [],
      addonIds: [],
      selectedCatIds: [],
      imageFiles: { first: null, second: null, third: null },
      imagePreviews: { first: null, second: null, third: null },
      showCropper: false,
      cropping: { image: "", type: "" },
    });
  },
  addOnToggle: "ADD_ON",
  setAddOnToggle: (addon: Addon) => set({ addOnToggle: addon }),

  addOnId: "",
  setAddOnId: (id: string) => set({ addOnId: id }),

  addOnName: "",
  setAddOnName: (name: string) => set({ addOnName: name }),

  minChoices: 0,
  setMinChoices: (choices: number) => set({ minChoices: choices }),

  maxChoices: 0,
  setMaxChoices: (choices: number) => set({ maxChoices: choices }),

  addOnChoice: "CHECKBOX",
  setAddOnChoice: (choice: AddonChoice) => set({ addOnChoice: choice }),

  choiceName: "",
  setChoiceName: (name: string) => set({ choiceName: name }),

  choicePrice: 0,
  setChoicePrice: (price: number) => set({ choicePrice: price }),

  choiceQuantity: 0,
  setChoiceQuantity: (quantity: number) => set({ choiceQuantity: quantity }),

  choiceDishTypes: [],
  setChoiceDishTypes: (types: DishTypeEnumType[]) =>
    set({ choiceDishTypes: types }),

  addOnVisible: false,
  setAddOnVisible: (visible: boolean) => set({ addOnVisible: visible }),

  choiceVisible: false,
  setChoiceVisible: (visible: boolean) => set({ choiceVisible: visible }),

  addOnAvailable: true,
  setAddOnAvailable: (available: boolean) => set({ addOnAvailable: available }),

  choiceAvailable: true,
  setChoiceAvailable: (available: boolean) =>
    set({ choiceAvailable: available }),

  choices: [],
  setChoices: (choices: Choice[]) => set({ choices }),
  addChoice: (choice) =>
    set((state) => ({ choices: [...state.choices, choice] })),
  deleteChoice: (choiceId) =>
    set((state) => ({
      choices: state.choices.filter((choice) => choice.uuid !== choiceId),
    })),
  updateChoice: (updatedChoice) =>
    set((state) => ({
      choices: state.choices.map((choice) =>
        choice.uuid === updatedChoice.uuid ? updatedChoice : choice,
      ),
    })),
  setEditChoiceId: (id) => set({ editChoiceId: id }),
  resetChoiceFields: () =>
    set({ choiceName: "", choicePrice: 0, dishTypes: [], editChoiceId: "" }),
}));

export default useMenuPageStore;
