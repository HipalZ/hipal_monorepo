import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IuseLoyaltyDatas {
  businessId: string;
  cardColor: string;
  cardPattern: string;
  fontColor: string;
  id: string;
  loyaltyId: string;
  password: string;
  setClaimAmount: number;
  setReward: number;
}
interface ILoyalty {
  loyaltyData: any;
  setLoyaltyData: (loyaltyData) => void;
}
export const useLoyaltyDatas = create(
  persist<ILoyalty>(
    (set, get) => ({
      loyaltyData: {},
      setLoyaltyData: (loyaltyData) => set({ loyaltyData }),
    }),
    {
      name: 'loyaltyDatas',
    },
  ),
);
