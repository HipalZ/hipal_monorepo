import type {
  IBusinessData,
  ILoyaltyData,
  IOutletInfo,
} from "@/components/types/businessData";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useBusinessData = create(
  persist<{
    businessData: IBusinessData | null;
    setBusinessData: (data: IBusinessData) => void;
    outletInfo: IOutletInfo | null; // Use the interface here
    setOutletInfo: (data: IOutletInfo) => void;
    themes: Record<string, any>;
    setThemes: (themes: Record<string, any>) => void;
    existingLoyalty: ILoyaltyData;
    setExistingLoyalty: (existingLoyalty: ILoyaltyData) => void;
    isLoyaltyExists: boolean;
    setIsLoyaltyExists: (isLoyaltyExists: boolean) => void;
    updateAppliedTheme: (theme: boolean) => void;
    updateThemeData: (data: Record<string, any>) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
  }>(
    (set, get) => ({
      businessData: null,
      setBusinessData: (data: IBusinessData) => set({ businessData: data }),
      outletInfo: null,
      setOutletInfo: (data: IOutletInfo) => set({ outletInfo: data }),
      themes: {},
      setThemes: (themes) => set({ themes: themes }),
      existingLoyalty: {
        businessId: "",
        password: "",
        loyaltyId: "",
        origin: false,
        cardPattern: "",
        cardColor: "",
        fontColor: "",
        setCashBackPercentage: 0,
        setClaimedPercentage: 0,
        logo: "",
        expiryDate: "",
        rewardLimit: 0,
        signUpBonus: 0,
        _id: "",
        createdAt: "",
        updatedAt: "",
        __v: 0,
      },
      setExistingLoyalty: (existingLoyalty: ILoyaltyData) =>
        set({ existingLoyalty: existingLoyalty }),
      isLoyaltyExists: false,
      setIsLoyaltyExists: (isLoyaltyExists: boolean) =>
        set({ isLoyaltyExists: isLoyaltyExists }),
      updateAppliedTheme: (theme: boolean) => {
        const currentBusinessData = get().businessData;
        if (currentBusinessData) {
          set({
            businessData: {
              ...currentBusinessData,
              themeApplied: theme,
            },
          });
        }
      },
      updateThemeData: (data) => {
        const currentBusinessData = get().businessData;
        if (currentBusinessData) {
          set({
            businessData: {
              ...currentBusinessData,
              ...data,
            },
          });
        }
      },
      isLoading: false,
      setIsLoading: (isLoading: boolean) => set({ isLoading: isLoading }),
    }),
    {
      name: "data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useBusinessData;
