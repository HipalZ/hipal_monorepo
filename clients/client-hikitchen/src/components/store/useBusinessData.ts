import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IData {
  businessName: string;
  businessType: string;
  gstRegistered: boolean;
  customLink: string;
  logo: string;
  address: string;
  staff: string[];
  tier: string;
  id: string;
}

interface IBusinessData {
  businessData: IData;
  setBusinessData: (data: IData) => void;
}

export const useBusinessData = create(
  persist<IBusinessData>(
    (set) => ({
        businessData: {
        businessName: "",
        businessType: "",
        gstRegistered: false,
        customLink: "",
        logo: "",
        address: "",
        staff: [],
        tier: "",
        id: "",
      },

      setBusinessData: (businessData) => set({ businessData }),
    }),
    {
      name: "businessData",
    }
  )
);
