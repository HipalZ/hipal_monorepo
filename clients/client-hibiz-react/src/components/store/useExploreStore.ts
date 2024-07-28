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

  imageFiles: ImageFiles;
  setImageFiles: SetImageFilesFunction;

  img: ImagePreviews;
  setImg: SetImagePreviewsFunction;

  toggleBizInfo: boolean;
  setToggleBizInfo: (toggle: boolean) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export type ImagePreviews = {
  banner: string | ArrayBuffer | null;
  logo: string | ArrayBuffer | null;
  footer: string | ArrayBuffer | null;
};

export type SetImageFilesFunction = (
  update: (prev: ImageFiles) => ImageFiles,
) => void;
export type SetImagePreviewsFunction = (
  update: (prev: ImagePreviews) => ImagePreviews,
) => void;

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
        banner: null,
        logo: null,
        footer: null,
      } as ImagePreviews,
      setImg: (
        previews: ImagePreviews | ((prev: ImagePreviews) => ImagePreviews),
      ) =>
        set((state) => ({
          img: typeof previews === "function" ? previews(state.img) : previews,
        })),
      imageFiles: { banner: null, logo: null, footer: null } as ImageFiles,
      setImageFiles: (files: Partial<ImageFiles>) =>
        set((state) => ({
          imageFiles: { ...state.imageFiles, ...files },
        })),

      toggleBizInfo: false,
      setToggleBizInfo: (toggle) => set(() => ({ toggleBizInfo: toggle })),
      isLoading: false,
      setIsLoading: (loading) => set(() => ({ isLoading: loading })),
    }),
    {
      name: "explore-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
