import { create } from "zustand";
import type { IBusinessData } from "../types/businessData";
import { persist } from "zustand/middleware";
import { beans } from "../atom/pathPattern";

interface IExistingLoyalty {
  rewardLimit: number;
  loyaltyId: string;
  cardColor: string;
  fontColor: string;
  cardPattern: Record<string, any>;
  password: string;
  expiryDate: string,
  setReward: number;
  setClaimAmount: number;
  logo?: string;
}

export const useBusinessData = create(
  persist<{
    businessData: IBusinessData | null;
    setBusinessData: (data: IBusinessData) => void;
    themes: Record<string, any>;
    setThemes: (themes: Record<string, any>) => void;
    existingLoyalty: IExistingLoyalty;
    setExistingLoyalty: (existingLoyalty: IExistingLoyalty) => void;
    isLoyaltyExists: boolean;
    setIsLoyaltyExists: (isLoyaltyExists: boolean) => void;
  }>(
    (set) => ({
      businessData: null,
      setBusinessData: (data: IBusinessData) => set({ businessData: data }),
      themes: {},
      setThemes: (themes) => set({ themes: themes }),
      existingLoyalty: {
        loyaltyId: "",
        cardColor: "",
        fontColor: "",
        cardPattern: beans("#000000"),
        setReward: 0,
        setClaimAmount: 0,
        logo: "",
        password: '',
        expiryDate: '',
        rewardLimit: 0,
      },
      setExistingLoyalty: (existingLoyalty: IExistingLoyalty) =>
        set({ existingLoyalty: existingLoyalty }),
      isLoyaltyExists: false,
      setIsLoyaltyExists: (isLoyaltyExists: boolean) =>
        set({ isLoyaltyExists: isLoyaltyExists }),
    }),
    {
      name: "data",
    }
  )
);

export default useBusinessData;
