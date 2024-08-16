import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IBanner, IBizInfo, IDish } from "../types/businessData";
export type ImageFiles = {
  banner: File | null;
  logo: File | null;
  footer: File | null;
};

export enum ExplorePages {
  BANNERS = "banners",
  BIZINFO = "bizinfo",
  MAINFORM = "mainform",
  BANNERLAYOUTS = "bannerlayouts",
  NEWBANNER = "newbanner",
  EDITBANNER = "editbanner",
}

interface ICropping {
  image: string | ArrayBuffer | null;
  type: string | null;
}

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

  toggleExplorePages: ExplorePages;
  setToggleExplorePages: (toggle: ExplorePages) => void;

  selectedSocialMedia: string;
  setSelectedSocialMedia: (icon: string) => void;

  showCropper: boolean;
  setShowCropper: (show: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  showUniquePopUp: boolean;
  setShowUniquePopUp: (show: boolean) => void;

  cropping: ICropping;
  setCropping: (cropping: ICropping) => void;
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
      setBizInfo: (newBizInfo) =>
        set(() => ({
          bizInfo: {
            _id: newBizInfo._id || "",
            amenities: newBizInfo.amenities || [],
            avgPricingForTwo: newBizInfo.avgPricingForTwo || "",
            businessId: newBizInfo.businessId || "",
            description: newBizInfo.description || "",
            location: newBizInfo.location || "",
            name: newBizInfo.name || "",
            phone: newBizInfo.phone || "",
            socialMediaLinks: newBizInfo.socialMediaLinks || [],
            fssai: newBizInfo.fssai || "",
            gst: newBizInfo.gst || "",
            tags: newBizInfo.tags || [],
            specialBannerUrl: newBizInfo.specialBannerUrl || "",
            logoUrl: newBizInfo.logoUrl || "",
            endBannerUrl: newBizInfo.endBannerUrl || "",
            footerDescription: newBizInfo.footerDescription || "",
            fixOpenTime: newBizInfo.fixOpenTime || "",
            fixCloseTime: newBizInfo.fixCloseTime || "",
            customTiming: newBizInfo.customTiming || [],
            isCustomTime: newBizInfo.isCustomTime || false,
            address: newBizInfo.address || "",
          },
        })),
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
      setBannerObj: (banner: IBanner) =>
        set(() => ({
          bannerObj: {
            _id: banner._id || "",
            isPublished: banner.isPublished || false,
            layout: banner.layout || "",
            businessId: banner.businessId || "",
            bannerType: banner.bannerType || "",
            bannerImage: banner.bannerImage || "",
            headingColor: banner.headingColor || "",
            headingFontWeight: banner.headingFontWeight || "",
            headingAlign: banner.headingAlign || "",
            paragraphColor: banner.paragraphColor || "",
            paragraphFontWeight: banner.paragraphFontWeight || "",
            paragraphAlign: banner.paragraphAlign || "",
            callToAction: banner.callToAction || "",
            backgroundColor: banner.backgroundColor || "",
            redirectionId: banner.redirectionId || "",
            redirectionType: banner.redirectionType || "",
            isDeleted: banner.isDeleted || false,
            buttonColor: banner.buttonColor || "",
            redirectionName: banner.redirectionName || "",
            heading: banner.heading || "",
            paragraph: banner.paragraph || "",
          },
        })),
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
      toggleExplorePages: ExplorePages.MAINFORM,
      setToggleExplorePages: (toggle) =>
        set(() => ({ toggleExplorePages: toggle })),
      selectedSocialMedia: "",
      setSelectedSocialMedia: (icon) =>
        set(() => ({ selectedSocialMedia: icon })),

      showCropper: false,
      setShowCropper: (show) => set(() => ({ showCropper: show })),

      searchQuery: "",
      setSearchQuery: (query) => set(() => ({ searchQuery: query })),

      showUniquePopUp: false,
      setShowUniquePopUp: (show) => set(() => ({ showUniquePopUp: show })),

      cropping: { image: null, type: null },
      setCropping: (cropping) => set(() => ({ cropping })),
    }),
    {
      name: "explore-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
