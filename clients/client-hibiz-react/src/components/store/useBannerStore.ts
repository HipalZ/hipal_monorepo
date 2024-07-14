import { create } from 'zustand';
import type { IBannerPayload } from '../templates/explorePage/explorePageStore';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Color } from '../types/businessData';

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
  setSelectedColor: (color:Partial<Color>) =>void;
  setHeadingStyle: (style: Partial<Style>) => void;
  setParagraphStyle: (style: Partial<Style>) => void;
  setButtonStyle: (style: Partial<Style>) => void;
  selectedBanner: IBannerPayload,
  setSelectedBanner: (banner: IBannerPayload) => void;
}

export const useBannerStore = create(
  persist<IBannerStore>(
    (set) => ({
      selectedNewBanner: false,
      setSelectedNewBanner: (banner) => set(() => ({ selectedNewBanner: banner })),
      addSpotlight: false,
      setAddSpotlight: (spotlight) => set(() => ({ addSpotlight: spotlight })),
      selectedBannerType: 'BANNER_TYPE_0',
      setSelectedBannerType: (bannerType) => set(() => ({ selectedBannerType: bannerType })),
      headingStyle: {
        textAlign: 'left',
        fontWeight: 400,
        color: '',
      },
      paragraphStyle: {
        textAlign: 'left',
        fontWeight: 400,
        color: '',
      },
      buttonStyle: {
        textAlign: 'left',
        fontWeight: 400,
        color: '',
      },
      selectedColor: {
        textColor:'',
        bgColor:''
      },
      setHeadingStyle: (style) => set((state) => ({ headingStyle: { ...state.headingStyle, ...style } })),
      setParagraphStyle: (style) => set((state) => ({ paragraphStyle: { ...state.paragraphStyle, ...style } })),
      setButtonStyle: (style) => set((state) => ({ buttonStyle: { ...state.buttonStyle, ...style } })),
      setSelectedColor: (color) => set((state) => ({ selectedColor: { ...state.selectedColor, ...color } })),
      selectedBanner: {},
      setSelectedBanner: (banner) => set(() => ({ selectedBanner: banner })),
    }),
    {
      name: 'banner-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);