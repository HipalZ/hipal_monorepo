import { create } from "zustand";
import type { PageStates } from "../utils/helpers";
import type { IMerchantDetails } from "../types/businessData";

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

  showError: boolean;
  setShowError: (error: boolean) => void;

  selectedMode: PageStates;
  setSelectedMode: (mode: PageStates) => void;

  selectedTip: string;
  setSelectedTip: (tip: string) => void;

  isTipActive: boolean;
  setIsTipActive: (active: boolean) => void;

  showInput: boolean;
  setShowInput: (show: boolean) => void;

  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;

  merchantDetails: IMerchantDetails;
  setMerchantDetails: (merchant: IMerchantDetails) => void;

  editBillModal: boolean;
  setEditBillModal: (open: boolean) => void;

  checkLogin: boolean;
  setCheckLogin: (login: boolean) => void;

  openBlastModal: boolean;
  setOpenBlastModal: (open: boolean) => void;

  coinz: number;
  setCoinz: (coinz: number) => void;
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

  showError: false,
  setShowError: (error: boolean) => set(() => ({ showError: error })),

  selectedMode: "INVOICE",
  setSelectedMode: (mode: PageStates) => set(() => ({ selectedMode: mode })),

  selectedTip: "",
  setSelectedTip: (tip: string) => set(() => ({ selectedTip: tip })),

  isTipActive: false,
  setIsTipActive: (active: boolean) =>
    set({
      isTipActive: active,
    }),

  showInput: false,
  setShowInput: (show: boolean) => set(() => ({ showInput: show })),

  isModalOpen: false,
  setIsModalOpen: (open: boolean) => set(() => ({ isModalOpen: open })),

  merchantDetails: {
    businessId: "",
    razorpayMerchantId: "",
    razorpayKeyId: "",
  },

  setMerchantDetails: (merchant: IMerchantDetails) =>
    set(() => ({ merchantDetails: merchant })),

  editBillModal: false,
  setEditBillModal: (open: boolean) => set(() => ({ editBillModal: open })),

  checkLogin: false,
  setCheckLogin: (login: boolean) => set(() => ({ checkLogin: login })),

  openBlastModal: false,
  setOpenBlastModal: (open: boolean) => set(() => ({ openBlastModal: open })),

  coinz: 0,
  setCoinz: (coinz: number) => set(() => ({ coinz: coinz })),
}));
