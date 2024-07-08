import type { IBusinessData } from '@/components/types/businessData';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface IExistingLoyalty {
  signUpBonus: number;
  rewardLimit: number;
  loyaltyId: string;
  cardColor: string;
  fontColor: string;
  password: string;
  expiryDate: string;
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
        loyaltyId: '',
        cardColor: '',
        fontColor: '',
        setReward: 0,
        setClaimAmount: 0,
        logo: '',
        password: '',
        expiryDate: '',
        rewardLimit: 0,
        signUpBonus: 0,
      },
      setExistingLoyalty: (existingLoyalty: IExistingLoyalty) => set({ existingLoyalty: existingLoyalty }),
      isLoyaltyExists: false,
      setIsLoyaltyExists: (isLoyaltyExists: boolean) => set({ isLoyaltyExists: isLoyaltyExists }),
    }),
    {
      name: 'data',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useBusinessData;
