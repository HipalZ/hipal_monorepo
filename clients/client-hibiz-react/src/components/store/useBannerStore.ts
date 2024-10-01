import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IBannerPayload, ICategory, IDish } from "../types/businessData";
import { BannerPage } from "../utils/bannerLayouts";

interface IBannerStore {
  selectedBannerType: string;
  setSelectedBannerType: (bannerType: string) => void;

  selectedBanner: IBannerPayload;
  setSelectedBanner: (banner: IBannerPayload) => void;

  isButtonExists: boolean;
  setIsButtonExists: (buttonExists: boolean) => void;

  isPatternExists: boolean;
  setIsPatternExists: (patternExists: boolean) => void;

  onlyImage: boolean;
  setOnlyImage: (image: boolean) => void;

  patternType: string;
  setPatternType: (patternType: string) => void;

  bannerPage: string;
  setBannerPage: (toggleLayouts: string) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  redirectCategories: ICategory[];
  setRedirectCategories: (categories: ICategory[]) => void;

  redirectDishes: IDish[];
  setRedirectDishes: (dishes: IDish[]) => void;

  handleBannerType: (
    id: string,
    isButton: boolean,
    isPatternExists: boolean,
    onlyImage?: boolean,
  ) => void;

  editBanner: string;
  setEditBanner: (id: string) => void;

  selectedRedirectionId: string;
  setSelectedRedirectionId: (id: string) => void;

  selectedRedirectionName: string;
  setSelectedRedirectionName: (name: string) => void;

  openPreview: boolean;
  setOpenPreview: (preview: boolean) => void;

  updateEditBannerz: (
    editingBanner: any,
    layoutFlags: {
      isButton: boolean;
      isPattern: boolean;
      onlyImage: boolean;
    },
  ) => void;
}

export const useBannerStore = create(
  persist<IBannerStore>(
    (set) => ({
      selectedBannerType: "BANNER_TYPE_0",
      setSelectedBannerType: (bannerType) =>
        set(() => ({ selectedBannerType: bannerType })),

      selectedBanner: {},
      setSelectedBanner: (banner) => set(() => ({ selectedBanner: banner })),

      isButtonExists: true,
      setIsButtonExists: (buttonExists) =>
        set(() => ({ isButtonExists: buttonExists })),

      patternType: "",
      setPatternType: (patternType) =>
        set(() => ({ patternType: patternType })),

      isPatternExists: false,
      setIsPatternExists: (patternExists) =>
        set(() => ({ isPatternExists: patternExists })),

      onlyImage: false,
      setOnlyImage: (image) => set(() => ({ onlyImage: image })),

      bannerPage: BannerPage.CREATE,
      setBannerPage: (toggleLayouts) => set({ bannerPage: toggleLayouts }),

      isLoading: false,
      setIsLoading: (loading) => set(() => ({ isLoading: loading })),

      redirectCategories: [],
      setRedirectCategories: (categories) =>
        set(() => ({ redirectCategories: categories })),

      redirectDishes: [],
      setRedirectDishes: (dishes) => set(() => ({ redirectDishes: dishes })),

      handleBannerType: (
        id: string,
        isButton: boolean,
        isPatternExists: boolean,
        onlyImage?: boolean,
      ) => {
        console.log(
          "handleBannerType",
          id,
          isButton,
          isPatternExists,
          onlyImage,
        );
        set(() => ({
          isButtonExists: isButton,
          isPatternExists: isPatternExists,
          onlyImage: onlyImage || false,
          selectedBannerType: id,
          bannerPage: BannerPage.CREATE,
          isLoading: false,
        }));
      },
      editBanner: "",
      setEditBanner: (id) => set(() => ({ editBanner: id })),

      selectedRedirectionId: "",
      setSelectedRedirectionId: (id) =>
        set(() => ({ selectedRedirectionId: id })),

      selectedRedirectionName: "",
      setSelectedRedirectionName: (name) =>
        set(() => ({ selectedRedirectionName: name })),

      openPreview: false,
      setOpenPreview: (preview) => set({ openPreview: preview }),

      updateEditBannerz: (editingBanner, layoutFlags) => {
        console.log(
          "updateEditBannerz",
          editingBanner,
          "layoutflags",
          layoutFlags,
        );
        const newState: Partial<IBannerStore> = {
          selectedRedirectionName: editingBanner?.redirectionName || "",
          selectedRedirectionId: editingBanner?.redirectionId || "",
        };

        if (layoutFlags && Object.keys(layoutFlags).length > 0) {
          newState.isButtonExists = layoutFlags?.isButton;
          newState.isPatternExists = layoutFlags?.isPattern;
          newState.onlyImage = layoutFlags?.onlyImage;
        }

        set(newState);
      },
    }),
    {
      name: "banner-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
