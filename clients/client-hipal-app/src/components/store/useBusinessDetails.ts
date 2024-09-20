import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IBiz } from "../types/businessData";

export const useBusinessDetails = create(
  persist<{
    businessDetails: IBiz;
    setBusinessDetails: (businessDetails: IBiz) => void;
  }>(
    (set) => ({
      businessDetails: {
        businessId: "",
        branchName: "",
        name: "",
        registeredName: "",
        businessType: "",
        email: "",
        gstRegistered: false,
        multipleOutlets: false,
        description: "",
        tags: [],
        customLink: "",
        logo: "",
        logoUrl: "",
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
        placeUrl: "",
        googleReviewLink: "",
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
        location: "",
        phone: "",
        __v: 0,
        id: "",
        phoneNumber: "",
      },
      setBusinessDetails: (businessDetails: IBiz) =>
        set({ businessDetails: businessDetails }),
    }),
    {
      name: "useBusinessDetails",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useBusinessDetails;
