import { create } from "zustand";
import type {
  CurrencyCode,
  CurrencyCodeSymbol,
  IDish,
  SocialMediaLink,
} from "../types/businessData";
import useBusinessData from "./useBusinessData";
import facebook from "@/assets/socialMedia/fb.png";
import instagram from "@/assets/socialMedia/instagram.png";
import twitter from "@/assets/socialMedia/twitter.png";
import telegram from "@/assets/socialMedia/telegram.png";
import youtube from "@/assets/socialMedia/youtube.png";
import website from "@/assets/socialMedia/website.png";
interface DayTiming {
  day: string;
  openTime: string;
  closeTime: string;
}
interface ExploreTempState {
  clearOriginalDishes: () => void;
  selectedDishes: string[];
  setSelectedDishes: (dishes: string[]) => void;
  dishes: IDish[];
  setDishes: (dishes: IDish[]) => void;
  description: string;
  setDescription: (description: string) => void;
  originalDishes: IDish[];
  setOriginalDishes: (dishes: IDish[]) => void;
  phone: string;
  setPhone: (phone: string) => void;

  location: string;
  setLocation: (location: string) => void;

  avgPricingForTwo: string;
  setAvgPricingForTwo: (avgPricingForTwo: string) => void;

  tags: string[];
  setTags: (tags: string[]) => void;

  amenities: string[];
  setAmenities: (amenities: string[]) => void;

  address: string;
  setAddress: (address: string) => void;

  openTimings: boolean;
  setOpenTimings: (openTimings: boolean) => void;

  showCustomTime: boolean;
  setShowCustomTime: (showCustomTime: boolean) => void;

  customTimings: DayTiming[];
  setCustomTimings: (customTimings: []) => void;

  currencyCode: CurrencyCode;
  setCurrencyCode: (currencyCode: CurrencyCode) => void;

  currencySymbol: CurrencyCodeSymbol;
  setCurrencySymbol: (currencySymbol: CurrencyCodeSymbol) => void;

  fixedTime: {
    openTime: string;
    closeTime: string;
  };

  setFixedTime: (fixedTime: { openTime: string; closeTime: string }) => void;

  updateBizInfo: (payload) => void;

  socialMediaLinks: SocialMediaLink[];
  setSocialMediaLinks: (data: SocialMediaLink[]) => void;

  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useExploreTemp = create<ExploreTempState>((set, get) => {
  return {
    selectedDishes: [],
    setSelectedDishes: (dishes: string[]) => set({ selectedDishes: dishes }),

    dishes: [],
    setDishes: (dishes) => set(() => ({ dishes })),

    originalDishes: [],
    setOriginalDishes: (dishes) => set(() => ({ originalDishes: dishes })),
    clearOriginalDishes: () => set(() => ({ originalDishes: [] })),

    description: "",
    setDescription: (description: string) => set({ description }),

    phone: "",
    setPhone: (phone: string) => set({ phone }),

    location: "",
    setLocation: (location: string) => set({ location }),

    avgPricingForTwo: "",
    setAvgPricingForTwo: (avgPricingForTwo: string) =>
      set({ avgPricingForTwo }),

    tags: ["", "", ""],
    setTags: (tags: string[]) => set({ tags }),

    amenities: [],
    setAmenities: (amenities: string[]) => set({ amenities }),

    address: "",
    setAddress: (address: string) => set({ address }),

    openTimings: false,
    setOpenTimings: (openTimings: boolean) => set({ openTimings }),

    currencyCode: "INR",
    setCurrencyCode: (currencyCode: CurrencyCode) => set({ currencyCode }),

    currencySymbol: "₹",
    setCurrencySymbol: (currencySymbol: CurrencyCodeSymbol) =>
      set({ currencySymbol }),

    showCustomTime: false,
    setShowCustomTime: (showCustomTime: boolean) => set({ showCustomTime }),

    customTimings: [
      { day: "Monday", openTime: "", closeTime: "" },
      { day: "Tuesday", openTime: "", closeTime: "" },
      { day: "Wednesday", openTime: "", closeTime: "" },
      { day: "Thursday", openTime: "", closeTime: "" },
      { day: "Friday", openTime: "", closeTime: "" },
      { day: "Saturday", openTime: "", closeTime: "" },
      { day: "Sunday", openTime: "", closeTime: "" },
    ],
    setCustomTimings: (customTimings: []) => set({ customTimings }),

    fixedTime: { openTime: "", closeTime: "" },
    setFixedTime: (newFixedTime) =>
      set((state) => ({
        fixedTime: { ...state.fixedTime, ...newFixedTime },
      })),

    updateBizInfo: (payload) => {
      const outletInfo = useBusinessData.getState().outletInfo;

      const {
        description,
        phone,
        location,
        avgPricingForTwo,
        tags,
        amenities,
        newAmenities,
        address,
        selectedDishes,
        fixOpenTime,
        fixCloseTime,
        customTiming,
        currencyCode,
        currencySymbol,
      } = payload;

      set({
        description: description || "",
        phone: phone || "",
        location: location || "",
        currencyCode: currencyCode || "INR",
        currencySymbol: currencySymbol || "₹",
        avgPricingForTwo: avgPricingForTwo || "",
        tags:
          tags?.length > 0
            ? [...tags, ...Array(3 - tags.length).fill("")]
            : ["", "", ""],
        amenities:
          outletInfo?.outLetType === "HOTEL"
            ? newAmenities?.length > 0
              ? newAmenities
              : []
            : amenities?.length > 0
              ? amenities
              : [],
        address: address || "",
        selectedDishes: selectedDishes || [],
        fixedTime: {
          openTime: fixOpenTime || "",
          closeTime: fixCloseTime || "",
        },
      });

      if (customTiming?.length > 0) {
        const flattenedCustomTimings = customTiming.flat();
        const currentCustomTimings = get().customTimings;

        const updatedTimings = currentCustomTimings.map((timing) => {
          const matchingBizTiming = flattenedCustomTimings.find(
            (bizTiming) => bizTiming.day === timing.day,
          );
          return matchingBizTiming
            ? { ...timing, ...matchingBizTiming }
            : timing;
        });

        set({ customTimings: updatedTimings });
      }
    },
    socialMediaLinks: [
      { _id: 1, icon: "instagram", logo: instagram, link: "" },
      { _id: 2, icon: "facebook", logo: facebook, link: "" },
      { _id: 3, icon: "twitter", logo: twitter, link: "" },
      { _id: 4, icon: "telegram", logo: telegram, link: "" },
      { _id: 5, icon: "youtube", logo: youtube, link: "" },
      { _id: 6, icon: "website", logo: website, link: "" },
    ],
    setSocialMediaLinks: (data) => set({ socialMediaLinks: data }),

    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),
  };
});
