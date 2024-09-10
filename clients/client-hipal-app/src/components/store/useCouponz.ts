import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Coupon } from "../types/businessData";

interface IUseCouponz {
  selectedCoupon: Coupon;
  setSelectedCoupon: (coupon: Coupon) => void;
}

export const useCouponz = create(
  persist<IUseCouponz>(
    (set) => ({
      selectedCoupon: {},
      setSelectedCoupon: (coupon) => set(() => ({ selectedCoupon: coupon })),
    }),
    {
      name: "couponz",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
