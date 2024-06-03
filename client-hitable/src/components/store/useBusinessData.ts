import { create } from "zustand";
import { persist } from "zustand/middleware";

type Staff = string;

export interface BusinessData {
  businessName: string;
  ownerPhone: string;
  registeredName: string;
  gstPercentage: number;
  businessType: string;
  gstRegistered: boolean;
  multipleOutlets: boolean;
  customLink: string;
  logo: string;
  address: string;
  staff: Staff[];
  gstNumber: string;
  fssaiLicenseNumber: string;
  status: boolean;
  likes: any[];
  wallpaper: string;
  tier: string;
  open: string;
  close: string;
  isHasSetting: boolean;
  isHasDishData: boolean;
  hikitchen: boolean;
  hitable: boolean;
  hipeople: boolean;
  hibiz: boolean;
  kotPrinter: boolean;
  serviceCharge:boolean;
  serviceChargePercentage: number;
  id: string;
  serviceControl: {
    discountPassword: number;
  };
}

interface BusinessStore {
  businessData: BusinessData | null;
  setBusinessData: (data: BusinessData) => void;
}

export const useBusinessStore = create(
  persist<BusinessStore>(
    (set, get) => ({
      businessData: null,
      setBusinessData: (data: BusinessData) => set({ businessData: data }),
    }),
    {
      name: "business_store",
    }
  )
);
