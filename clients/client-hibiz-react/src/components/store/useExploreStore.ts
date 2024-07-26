import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IBanner, IBizInfo, IDish } from "../types/businessData";
export type ImageFiles = {
  banner: File | null;
  logo: File | null;
  footer: File | null;
};
interface IExploreStore {
  clearOriginalDishes: () => void;
  dishes: IDish[];
  setDishes: (dishes: IDish[]) => void;
  bizInfo: IBizInfo;
  setBizInfo: (bizInfo: IBizInfo) => void;
  selectedDishes: IDish[];
  setSelectedDishes: (dishes: IDish[]) => void;
  originalDishes: IDish[];
  setOriginalDishes: (dishes: IDish[]) => void;
  uniquelyDishes: IDish[];
  setUniquelyDishes: (dishes: IDish[]) => void;
  banners: IBanner[];
  setBanners: (banners: IBanner[]) => void;
  bannerObj: IBanner;
  setBannerObj: (banner: IBanner) => void;

  img: {
    banner: string | undefined;
    logo: string | undefined;
    footer: string | undefined;
  };
  setImg: (img: {
    banner: string | undefined;
    logo: string | undefined;
    footer: string | undefined;
  }) => void;

  imageFiles: {
    banner: File | null;
    logo: File | null;
    footer: File | null;
  };
  setImageFiles: (files: {
    banner: File | null;
    logo: File | null;
    footer: File | null;
  }) => void;
}

export const useExploreStore = create(
  persist<IExploreStore>(
    (set) => ({
      dishes: [],
      setDishes: (dishes) => set(() => ({ dishes })),
      bizInfo: {
        _id: "",
        amenities: [],
        avgPricingForTwo: "",
        businessId: "",
        description: "",
        location: "",
        name: "",
        phone: "",
        socialMediaLinks: [],
        fssai: "",
        gst: "",
        tags: [],
        specialBannerUrl: "",
        logoUrl: "",
        endBannerUrl: "",
        footerDescription: "",
        fixOpenTime: "",
        fixCloseTime: "",
        customTiming: [],
        isCustomTime: false,
        address: "",
      },
      setBizInfo: (bizInfo) => set(() => ({ bizInfo })),
      selectedDishes: [],
      setSelectedDishes: (dishes) => set(() => ({ selectedDishes: dishes })),
      originalDishes: [],
      setOriginalDishes: (dishes) => set(() => ({ originalDishes: dishes })),
      uniquelyDishes: [],
      setUniquelyDishes: (dishes) => set(() => ({ uniquelyDishes: dishes })),
      banners: [],
      setBanners: (banners) => set(() => ({ banners })),
      bannerObj: {
        _id: "",
        isPublished: false,
        layout: "",
        businessId: "",
        bannerType: "",
        bannerImage: "",
        headingColor: "",
        headingFontWeight: "",
        headingAlign: "",
        paragraphColor: "",
        paragraphFontWeight: "",
        paragraphAlign: "",
        callToAction: "",
        backgroundColor: "",
        redirectionId: "",
        redirectionType: "",
        isDeleted: false,
        buttonColor: "",
        redirectionName: "",
        heading: "",
        paragraph: "",
      },
      setBannerObj: (banner: IBanner) => set(() => ({ bannerObj: banner })),
      clearOriginalDishes: () => set(() => ({ originalDishes: [] })),

      img: {
        banner: "",
        logo: "",
        footer: "",
      },
      setImg: (img) => set({ img }),
      imageFiles: { banner: null, logo: null, footer: null } as ImageFiles,
      setImageFiles: (files: ImageFiles | ((prev: ImageFiles) => ImageFiles)) =>
        set((state) => ({
          imageFiles:
            typeof files === "function" ? files(state.imageFiles) : files,
        })),
    }),
    {
      name: "explore-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
