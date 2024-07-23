import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Color, IBannerPayload } from "../types/businessData";

type Style = {
  textAlign: string;
  fontWeight: number;
  color: string;
};

interface IBannerStore {
  selectedNewBanner: boolean;
  setSelectedNewBanner: (banner: boolean) => void;
  addSpotlight: boolean;
  setAddSpotlight: (spotlight: boolean) => void;
  selectedBannerType: string;
  setSelectedBannerType: (bannerType: string) => void;
  headingStyle: Style;
  paragraphStyle: Style;
  buttonStyle: Style;
  selectedColor: Color;
  setSelectedColor: (color: Partial<Color>) => void;
  setHeadingStyle: (style: Partial<Style>) => void;
  setParagraphStyle: (style: Partial<Style>) => void;
  setButtonStyle: (style: Partial<Style>) => void;
  selectedBanner: IBannerPayload;
  setSelectedBanner: (banner: IBannerPayload) => void;
  isButtonExists: boolean;
  setIsButtonExists: (buttonExists: boolean) => void;
  patternType: string;
  setPatternType: (patternType: string) => void;
  createBannerPage: boolean;
  setCreateBannerPage: (toggleLayouts: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useBannerStore = create(
  persist<IBannerStore>(
    (set) => ({
      selectedNewBanner: false,
      setSelectedNewBanner: (banner) =>
        set(() => ({ selectedNewBanner: banner })),
      addSpotlight: false,
      setAddSpotlight: (spotlight) => set(() => ({ addSpotlight: spotlight })),
      selectedBannerType: "BANNER_TYPE_0",
      setSelectedBannerType: (bannerType) =>
        set(() => ({ selectedBannerType: bannerType })),
      headingStyle: {
        textAlign: "left",
        fontWeight: 400,
        color: "",
      },
      paragraphStyle: {
        textAlign: "left",
        fontWeight: 400,
        color: "",
      },
      buttonStyle: {
        textAlign: "left",
        fontWeight: 400,
        color: "",
      },
      selectedColor: {
        textColor: "",
        bgColor: "",
      },
      setHeadingStyle: (style) =>
        set((state) => ({ headingStyle: { ...state.headingStyle, ...style } })),
      setParagraphStyle: (style) =>
        set((state) => ({
          paragraphStyle: { ...state.paragraphStyle, ...style },
        })),
      setButtonStyle: (style) =>
        set((state) => ({ buttonStyle: { ...state.buttonStyle, ...style } })),
      setSelectedColor: (color) =>
        set((state) => ({
          selectedColor: { ...state.selectedColor, ...color },
        })),
      selectedBanner: {},
      setSelectedBanner: (banner) => set(() => ({ selectedBanner: banner })),
      isButtonExists: true,
      setIsButtonExists: (buttonExists) =>
        set(() => ({ isButtonExists: buttonExists })),
      patternType: "",
      setPatternType: (patternType) => set(() => ({ patternType })),
      createBannerPage: true,
      setCreateBannerPage: (toggleLayouts) =>
        set({ createBannerPage: toggleLayouts }),
      isLoading: false,
      setIsLoading: (loading) => set(() => ({ isLoading: loading })),
    }),
    {
      name: "banner-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
