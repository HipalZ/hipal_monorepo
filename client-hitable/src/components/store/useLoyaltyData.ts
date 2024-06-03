// loyaltyStore.ts
import {create} from "zustand";
import { persist } from "zustand/middleware";

type LoyaltyState = {
  businessId: string;
  setReward: number;
  setClaimAmount: number;
  password: string;
  loyaltyId: string;
  origin: boolean;
  cardPattern: string;
  cardColor: string;
  fontColor: string;
  logo: string;
  id: string;
  setLoyaltyData: (data: Partial<LoyaltyState>) => void;
};

export const useLoyaltyStore = create(
  persist<LoyaltyState>(
    (set) => ({
      businessId: "",
      setReward: 0,
      setClaimAmount: 0,
      password: "",
      loyaltyId: "",
      origin: true,
      cardPattern: "",
      cardColor: "",
      fontColor: "",
      logo: "",
      id: "",
      setLoyaltyData: (data) => set((state) => ({ ...state, ...data })),
    }),
    {
      name: "loyalty-data", // unique name
      getStorage: () => localStorage, // default
    }
  )
);
