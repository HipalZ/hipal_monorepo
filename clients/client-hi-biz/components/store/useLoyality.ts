import { create } from 'zustand';

type IloyalityObj = {
  loyaltyId: string;
  businessId: string;
  rewardsValue: number;
  maximumClaim: number;
  origin: boolean;
  cardPattern: Record<string, string>;
  cardColor: string;
  fontColor: string;
  logo: string;
  expiryDate: string;
  rewardLimit: number;
  password: string;
  signUpBonus: number;
  setSignUpBonus: (bonus: number) => void;
  setPassword: (password: string) => void;
  setRewardLimit: (rewardLimit: number) => void;
  setExpiryDate: (expiryDate: string) => void;
  setLoyaltyId: (loyaltyId: string) => void;
  setBusinessId: (businessId: string) => void;
  setRewardsValue: (rewardsValue: number) => void;
  setMaximumClaim: (maximumClaim: number) => void;
  setOrigin: (origin: boolean) => void;
  setCardPattern: (cardPattern: Record<string, string>) => void;
  setCardColor: (cardColor: string) => void;
  setFontColor: (fontColor: string) => void;
  setLogo: (logo: string) => void;
};
export const useLoyalityData = create<IloyalityObj>((set) => ({
  loyaltyId: '',
  businessId: '',
  rewardsValue: 0,
  signUpBonus: 0,
  maximumClaim: 0,
  origin: true,
  cardPattern: {},
  cardColor: '',
  fontColor: '',
  logo: '',
  expiryDate: '',
  rewardLimit: 0,
  password: '',
  setSignUpBonus: (signUpBonus: number) => set({ signUpBonus }),
  setPassword: (password: string) => set({ password: password }),
  setRewardLimit: (rewardLimit: number) => set({ rewardLimit: rewardLimit }),
  setExpiryDate: (expiryDate: string) => set({ expiryDate: expiryDate }),
  setLoyaltyId: (loyaltyId: string) => set({ loyaltyId: loyaltyId }),
  setBusinessId: (businessId: string) => set({ businessId: businessId }),
  setRewardsValue: (rewardsValue: number) => set({ rewardsValue: rewardsValue }),
  setMaximumClaim: (maximumClaim: number) => set({ maximumClaim: maximumClaim }),
  setOrigin: (origin: boolean) => set({ origin: origin }),
  setCardPattern: (cardPattern: Record<string, string>) => set({ cardPattern: cardPattern }),
  setCardColor: (cardColor: string) => set({ cardColor: cardColor }),
  setFontColor: (fontColor: string) => set({ fontColor: fontColor }),
  setLogo: (logo: string) => set({ logo: logo }),
}));
