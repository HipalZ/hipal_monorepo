import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IBiz } from "../types/businessData";

export const useBusinessDetails = create(
  persist<{
    businessDetails: IBiz;
    setBusinessDetails: (businessDetails: IBiz) => void;
  }>(
    (set) => ({
      businessDetails: {
        businessName: "",
        registeredName: "",
        businessType: "",
        gstRegistered: false,
        multipleOutlets: false,
        description: "",
        tags: [],
        customLink: "",
        logo: "",
        address: "",
        staff: [],
        _id: "",
        close: "",
        createdAt: "",
        fssaiLicenseNumber: "",
        gstNumber: "",
        gstPercentage: 0,
        hibiz: false,
        hikitchen: false,
        hipeople: false,
        hitable: false,
        isHasDishData: false,
        isHasGst: false,
        isHasSetting: false,
        isPaymentIntegrated: false,
        kotPrinter: false,
        likes: [],
        loyalty: false,
        open: "",
        serviceCharge: false,
        serviceChargePercentage: 0,
        serviceChargeRemovalPass: "",
        serviceControl: {
          discountPassword: "",
        },
        status: false,
        takeAwayName: "",
        tier: "",
        updatedAt: "",
        wallpaper: "",
        withPopCorn: false,
        __v: 0,
        id: "",
      },
      setBusinessDetails: (businessDetails: IBiz) => set({ businessDetails: businessDetails }),
    }),
    {
      name: "useBusinessDetails",
    }
  )
);

export default useBusinessDetails;
