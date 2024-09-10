import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Coupon } from "../types/businessData";
import { ICouponPage } from "../utils/helpers";

interface IUseCouponz {
  selectedCoupon: Coupon;
  setSelectedCoupon: (coupon: Coupon) => void;

  couponz: Coupon[];
  setCouponz: (couponz: Coupon[]) => void;

  currentPage: ICouponPage;
  setCurrentPage: (page: ICouponPage) => void;
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
    }),
    {
      name: "couponz",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
