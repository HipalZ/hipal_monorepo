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
      ) => {
        set(() => ({
          isButtonExists: isButton,
          isPatternExists: isPatternExists,
          selectedBannerType: id,
          bannerPage: BannerPage.CREATE,
          isLoading: false,
        }));
      },
    }),
    {
      name: "banner-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
