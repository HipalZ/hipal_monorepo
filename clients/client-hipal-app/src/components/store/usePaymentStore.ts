import { create } from "zustand";
import type { PageStates } from "../utils/helpers";

interface IUsePaymentStore {
  claimedCoinz: number;
  setClaimedCoinz: (coinz: number) => void;
  claimCouponz: number;
  setClaimCouponz: (coinz: number) => void;
  tips: number;
  setTips: (tips: number) => void;
  customTip: string;
  setCustomTip: (tip: string) => void;
  userCoinz: number;
  setUserCoinz: (coinz: number) => void;
  total: number;
  setTotal: (total: number) => void;
  billValue: number;
  setBillValue: (value: number) => void;
  // to show popup confirm code
  selectedPay: boolean;
  setSelectedPay: (selected: boolean) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  selectedMode: PageStates;
  setSelectedMode: (mode: PageStates) => void;

  selectedTip: string;
  setSelectedTip: (tip: string) => void;
}

export const usePaymentStore = create<IUsePaymentStore>((set) => ({
  claimedCoinz: 0,
  setClaimedCoinz: (coinz: number) => set(() => ({ claimedCoinz: coinz })),

  claimCouponz: 0,
  setClaimCouponz: (coinz: number) => set(() => ({ claimCouponz: coinz })),

  tips: 0,
  setTips: (tips: number) => set(() => ({ tips: tips })),

  customTip: "",
  setCustomTip: (tip: string) => set(() => ({ customTip: tip })),

  userCoinz: 0,
  setUserCoinz: (coinz: number) => set(() => ({ userCoinz: coinz })),

  total: 0,
  setTotal: (total: number) => set(() => ({ total: total })),

  billValue: 0,
  setBillValue: (value: number) => set(() => ({ billValue: value })),

  selectedPay: false,
  setSelectedPay: (selected: boolean) => set(() => ({ selectedPay: selected })),

  isLoading: false,
  setIsLoading: (loading: boolean) => set(() => ({ isLoading: loading })),

  selectedMode: "INVOICE",
  setSelectedMode: (mode: PageStates) => set(() => ({ selectedMode: mode })),

  selectedTip: "",
  setSelectedTip: (tip: string) => set(() => ({ selectedTip: tip })),
}));
