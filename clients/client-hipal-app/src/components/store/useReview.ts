import { create } from "zustand";
import type { User } from "../types/businessData";
interface IRipple {
  left: string;
  top: string;
  backgroundColor: string;
  opacity: number;
  position: string;
  borderRadius: string;
  transform: string;
  animation: string;
}
interface IUseReview {
  openComment: boolean;
  setOpenComment: (openComment: boolean) => void;

  showSuggestions: boolean;
  setShowSuggestions: (showSuggestions: boolean) => void;

  description: string;
  setDescription: (description: string) => void;

  selectedEmoji: number | null;
  setSelectedEmoji: (selectedEmoji: number | null) => void;

  showGoogleReview: boolean;
  setShowGoogleReview: (showGoogleReview: boolean) => void;

  tempSelectedStaff: string[];
  setTempSelectedStaff: (tempSelectedStaff: string[]) => void;

  staffs: User[];
  setStaffs: (staffs: User[]) => void;

  selectedStaff: string[];
  setSelectedStaff: (selectedStaff: string[]) => void;

  storeStaffId: string[];
  setStoreStaffId: (storeStaffId: string[]) => void;

  rippleStyle: IRipple;
  setRippleStyle: (rippleStyle: IRipple) => void;

  improve: Record<string, number | null>;
  setImprove: (improve: Record<string, number>) => void;

  bgColor: string;
  setBgColor: (bgColor: string) => void;

  curveColor: string;
  setCurveColor: (curveColor: string) => void;

  isPaymentDone: boolean;
  setIsPaymentDone: (isPayOnline: boolean) => void;
}

export const useReview = create<IUseReview>((set, get) => ({
  openComment: false,
  setOpenComment: (openComment) => set({ openComment }),

  showSuggestions: false,
  setShowSuggestions: (showSuggestions) => set({ showSuggestions }),

  description: "",
  setDescription: (description) => set({ description }),

  selectedEmoji: null,
  setSelectedEmoji: (selectedEmoji) => set({ selectedEmoji }),

  showGoogleReview: false,
  setShowGoogleReview: (showGoogleReview) => set({ showGoogleReview }),

  tempSelectedStaff: [],
  setTempSelectedStaff: (staffName) =>
    set((state) => {
      const currentStaff = state.tempSelectedStaff;
      if (currentStaff.includes(staffName)) {
        return {
          tempSelectedStaff: currentStaff.filter((name) => name !== staffName),
        };
      }
      return { tempSelectedStaff: [...currentStaff, staffName] };
    }),

  staffs: [],
  setStaffs: (staffs) => set({ staffs }),

  selectedStaff: [],
  setSelectedStaff: (selectedStaff) => set({ selectedStaff }),

  storeStaffId: [],
  setStoreStaffId: (id) => {
    set((state) => {
      const existingIds = state.storeStaffId;
      if (existingIds.includes(id)) {
        // If the id is already included, remove it
        return {
          storeStaffId: existingIds.filter((existingId) => existingId !== id),
        };
      }
      // Otherwise, add it to the array
      return { storeStaffId: [...existingIds, id] };
    });
  },

  rippleStyle: {},
  setRippleStyle: (rippleStyle) => set({ rippleStyle }),

  improve: {},
  setImprove: (improveChanges) => {
    set((state) => {
      const currentImprove = state.improve;
      const newImprove = { ...currentImprove, ...improveChanges };

      Object.keys(newImprove).forEach((key) => {
        if (newImprove[key] === null) {
          delete newImprove[key];
        }
      });

      return { improve: newImprove };
    });
  },

  bgColor: "#6A31DF",
  setBgColor: (bgColor) => set({ bgColor }),

  curveColor: "#D1C1F2",
  setCurveColor: (curveColor) => set({ curveColor }),

  isPaymentDone: false,
  setIsPaymentDone: (isPayOnline) => set({ isPaymentDone: isPayOnline }),
}));
