import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LoyaltyCardLayout = "LAYOUT_ONE" | "LAYOUT_TWO" | "LAYOUT_THREE";

export type SelectedCardType =
  | "CARD_ONE"
  | "CARD_TWO"
  | "CARD_THREE"
  | "CARD_FOUR"
  | "CARD_FIVE"
  | "CARD_SIX";

export interface ILoyaltySetting {
  loyaltyId: string;
  expiryDate: string;
  businessId: string;
  _id: string;
  cardColor: string;
  fontColor: string;
  cardPattern: any;
  setCashBackPercentage: number;
  setClaimedPercentage: number;
  logo?: string;
  signUpBonus: number;
  rewardLimit: number;
  cardLayout: LoyaltyCardLayout;
  cardType: SelectedCardType;
}

export const useLoyaltyData = create(
  persist<{
    loyaltySetting: ILoyaltySetting;
    setLoyaltySetting: (loyaltySetting: ILoyaltySetting) => void;
  }>(
    (set) => ({
      loyaltySetting: {
        loyaltyId: "",
        businessId: "",
        setCashBackPercentage: 10,
        setClaimedPercentage: 20,
        _id: "",
        cardPattern: "",
        cardColor: "",
        fontColor: "",
        logo: "",
        signUpBonus: 0,
        expiryDate: "",
        rewardLimit: 0,
        cardLayout: "LAYOUT_ONE",
        cardType: "CARD_ONE",
      },
      setLoyaltySetting: (loyaltySetting: ILoyaltySetting) =>
        set({ loyaltySetting: loyaltySetting }),
    }),
    {
      name: "userLoyaltyData",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useLoyaltyData;
