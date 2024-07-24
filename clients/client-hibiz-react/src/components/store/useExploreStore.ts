import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IBanner, IBizInfo, IDish } from "../types/businessData";

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
    }),
    {
      name: "explore-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
