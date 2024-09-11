import { create } from "zustand";

interface IApplyCoupon {
  applyCouponz: boolean;
  setApplyCouponz: (applyCoupon: boolean) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  couponOccasion: string;
  setCouponOccasion: (occasion: string) => void;
}

// if we remove circle bracket from arrow function then it will become the function now we returning the object coz we added circle bracket
const useCouponTemp = create<IApplyCoupon>((set) => ({
  applyCouponz: false,
  setApplyCouponz: (applyCouponz: boolean) => set({ applyCouponz }),

  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  couponOccasion: "",
  setCouponOccasion: (occasion: string) => set({ couponOccasion: occasion }),
}));

export default useCouponTemp;
