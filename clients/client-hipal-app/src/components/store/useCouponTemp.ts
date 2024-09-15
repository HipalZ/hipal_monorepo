import { create } from "zustand";

interface IApplyCoupon {
  applyCouponz: boolean;
  setApplyCouponz: (applyCoupon: boolean) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  showPopup: boolean;
  setShowPopup: (show: boolean) => void;

  showAlert: boolean;
  setShowAlert: (show: boolean) => void;

  openTc: boolean;
  setOpenTc: (show: boolean) => void;

  displayTermsAndConditions: (openTc: boolean) => void;
}

// if we remove circle bracket from arrow function then it will become the function now we returning the object coz we added circle bracket
const useCouponTemp = create<IApplyCoupon>((set) => ({
  applyCouponz: false,
  setApplyCouponz: (applyCouponz: boolean) => set({ applyCouponz }),

  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  showPopup: false,
  setShowPopup: (show: boolean) => set({ showPopup: show }),

  showAlert: false,
  setShowAlert: (show: boolean) => set({ showAlert: show }),

  openTc: false,
  setOpenTc: (show: boolean) => set({ openTc: show }),

  displayTermsAndConditions: (openTc: boolean) => set({ openTc: !openTc }),
}));

export default useCouponTemp;
