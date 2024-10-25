import { create } from "zustand";

interface DayTiming {
  day: string;
  openTime: string;
  closeTime: string;
}
interface ExploreTempState {
  selectedDishes: string[];
  setSelectedDishes: (dishes: string[]) => void;
  description: string;
  setDescription: (description: string) => void;

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

  fixedTime: {
    openTime: string;
    closeTime: string;
  };

  setFixedTime: (fixedTime: { openTime: string; closeTime: string }) => void;

  updateBizInfo: (payload) => void;
}

export const useExploreTemp = create<ExploreTempState>((set, get) => ({
  selectedDishes: [],
  setSelectedDishes: (dishes: string[]) => set({ selectedDishes: dishes }),

  description: "",
  setDescription: (description: string) => set({ description }),

  phone: "",
  setPhone: (phone: string) => set({ phone }),

  location: "",
  setLocation: (location: string) => set({ location }),

  avgPricingForTwo: "",
  setAvgPricingForTwo: (avgPricingForTwo: string) => set({ avgPricingForTwo }),

  // space for tags to map them to the input field
  tags: ["", "", ""],
  setTags: (tags: string[]) => set({ tags }),

  amenities: [],
  setAmenities: (amenities: string[]) => set({ amenities }),

  address: "",
  setAddress: (address: string) => set({ address }),

  openTimings: false,
  setOpenTimings: (openTimings: boolean) => set({ openTimings }),

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

  fixedTime: {
    openTime: "",
    closeTime: "",
  },

  setFixedTime: (newFixedTime) =>
    set((state) => ({
      fixedTime: {
        ...state.fixedTime,
        ...newFixedTime,
      },
    })),

  updateBizInfo: (payload) => {
    const {
      description,
      phone,
      location,
      avgPricingForTwo,
      tags,
      amenities,
      address,
      selectedDishes,
      fixOpenTime,
      fixCloseTime,
      customTiming,
    } = payload;

    set({
      description: description || "",
      phone: phone || "",
      location: location || "",
      avgPricingForTwo: avgPricingForTwo || "",
      // all the tags are mapped to the input field
      tags:
        tags && tags.length > 0
          ? [...tags, ...Array(3 - tags.length).fill("")]
          : ["", "", ""],
      amenities: amenities && amenities.length > 0 ? [...amenities] : [],
      address: address || "",
      selectedDishes: selectedDishes || [],
      fixedTime: {
        openTime: fixOpenTime || "",
        closeTime: fixCloseTime || "",
      },
    });

    if (customTiming && customTiming.length > 0) {
      const flattenedCustomTimings = customTiming.flat();
      const currentCustomTimings = get().customTimings;

      const updatedTimings = currentCustomTimings.map((timing) => {
        const matchingBizTiming = flattenedCustomTimings.find(
          (bizTiming) => bizTiming.day === timing.day,
        );
        return matchingBizTiming ? { ...timing, ...matchingBizTiming } : timing;
      });

      set({ customTimings: updatedTimings });
    }
  },
}));
