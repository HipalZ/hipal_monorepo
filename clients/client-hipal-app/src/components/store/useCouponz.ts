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

  // missingOutCoupon
  missingOutCoupon: Coupon[];
  setMissingOutCoupon: (coupon: Coupon[]) => void;

  // upcoming Couponz
  upcomingCouponz: Coupon[];
  setUpcomingCouponz: (couponz: Coupon[]) => void;

  // user coupon for that business
  userCouponz: Coupon[];
  setUserCouponz: (couponz: Coupon[]) => void;

  showPopup: boolean;
  setShowPopup: (show: boolean) => void;

  greatDeals: Coupon[];
  setGreatDeals: (coupon: Coupon[]) => void;
  missingOut: Coupon[];
  setMissingOut: (coupon: Coupon[]) => void;

  updateCoupons: (billValue: number) => void;

  channelId: string;
  setChannelId: (channelId: string) => void;

  promoteOnBillCouponz: Coupon[];
  setPromoteOnBillCouponz: (couponz: Coupon[]) => void;
}

export const useCouponz = create(
  persist<IUseCouponz>(
    (set, get) => ({
      selectedCoupon: {},
      setSelectedCoupon: (coupon) => set(() => ({ selectedCoupon: coupon })),

      couponz: [],
      setCouponz: (couponz) => set(() => ({ couponz: couponz })),

      currentPage: ICouponPage.SINGLECOUPON,
      setCurrentPage: (page) => set(() => ({ currentPage: page })),

      couponOccasion: "",
      setCouponOccasion: (occasion) =>
        set(() => ({ couponOccasion: occasion })),

      direction: "couponz",
      setDirection: (direction) => set(() => ({ direction })),

      availedCoupon: {},
      setAvailedCoupon: (coupon) => set(() => ({ availedCoupon: coupon })),

      missingOutCoupon: [],
      setMissingOutCoupon: (coupon) =>
        set(() => ({ missingOutCoupon: coupon })),

      upcomingCouponz: [],
      setUpcomingCouponz: (couponz) =>
        set(() => ({ upcomingCouponz: couponz })),

      userCouponz: [],
      setUserCouponz: (couponz) => set(() => ({ userCouponz: couponz })),

      showPopup: false,
      setShowPopup: (show) => set(() => ({ showPopup: show })),

      greatDeals: [],
      setGreatDeals: (coupon) => set(() => ({ greatDeals: coupon })),

      missingOut: [],
      setMissingOut: (coupon) => set(() => ({ missingOut: coupon })),

      updateCoupons: (billValue: number) => {
        const { userCouponz, availedCoupon } = get();
        const greatDeals = userCouponz.filter(
          (coupon) => billValue >= coupon.conditions.billValue,
        );
        const missingOut = userCouponz.filter(
          (coupon) => billValue < coupon.conditions.billValue,
        );
        const filteredGreatDeals = greatDeals.filter(
          (coupon) => coupon._id !== availedCoupon?._id,
        );
        const missingOutCoupon = [...missingOut, ...filteredGreatDeals];
        set({
          greatDeals,
          missingOut,
          missingOutCoupon,
        });
      },

      channelId: "",
      setChannelId: (channelId) => set(() => ({ channelId })),

      promoteOnBillCouponz: [],
      setPromoteOnBillCouponz: (couponz) => set(() => ({ couponz: couponz })),
    }),
    {
      name: "couponz",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
