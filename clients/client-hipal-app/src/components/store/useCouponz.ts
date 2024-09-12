import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Coupon } from "../types/businessData";
import { ICouponPage } from "../utils/helpers";

interface IUseCouponz {
  // selected coupon for that business
  selectedCoupon: Coupon;
  setSelectedCoupon: (coupon: Coupon) => void;

  // couponz for that business
  couponz: Coupon[];
  setCouponz: (couponz: Coupon[]) => void;

  // couponz current steps
  currentPage: ICouponPage;
  setCurrentPage: (page: ICouponPage) => void;

  // occasion of coupon either dob or specialday
  couponOccasion: string;
  setCouponOccasion: (occasion: string) => void;

  // direction for the birthday popup
  direction: string;
  setDirection: (direction: string) => void;

  // applied coupon to redeem
  availedCoupon: Coupon;
  setAvailedCoupon: (coupon: Coupon) => void;

  // user coupon for that business
  userCouponz: Coupon[];
  setUserCouponz: (couponz: Coupon[]) => void;

  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
}

export const useCouponz = create(
  persist<IUseCouponz>(
    (set) => ({
      selectedCoupon: {},
      setSelectedCoupon: (coupon) => set(() => ({ selectedCoupon: coupon })),

      couponz: [],
      setCouponz: (couponz) => set(() => ({ couponz })),

      currentPage: ICouponPage.SINGLECOUPON,
      setCurrentPage: (page) => set(() => ({ currentPage: page })),

      couponOccasion: "",
      setCouponOccasion: (occasion) =>
        set(() => ({ couponOccasion: occasion })),

      direction: "couponz",
      setDirection: (direction) => set(() => ({ direction })),

      availedCoupon: {},
      setAvailedCoupon: (coupon) => set(() => ({ availedCoupon: coupon })),

      userCouponz: [],
      setUserCouponz: (couponz) => set(() => ({ userCouponz: couponz })),

      showPopup: false,
      setShowPopup: (show) => set(() => ({ showPopup: show })),
    }),
    {
      name: "couponz",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
