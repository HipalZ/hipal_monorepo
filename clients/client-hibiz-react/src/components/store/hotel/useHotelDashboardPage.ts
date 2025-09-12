import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Reuse your enum (import if you keep it in a shared file)
export enum HotelInfoTabs {
  Essentials = "essentials",
  Integrations = "integrations",
  Actions = "actions",
  Analytics = "analytics",
  Payments = "payments",
}

type HotelInfoTabsState = {
  selectedTab: HotelInfoTabs;
  setSelectedTab: (tab: HotelInfoTabs) => void;
  reset: () => void;
};

export const useHotelInfoTabs = create<HotelInfoTabsState>()(
  persist(
    (set) => ({
      selectedTab: HotelInfoTabs.Essentials,
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      reset: () => set({ selectedTab: HotelInfoTabs.Essentials }),
    }),
    {
      name: "hotel-info-selected-tab",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // only persist what we need
      partialize: (state) => ({ selectedTab: state.selectedTab }),
    },
  ),
);
