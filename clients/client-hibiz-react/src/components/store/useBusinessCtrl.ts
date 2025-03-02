import { create } from "zustand";
import useBusinessData from "./useBusinessData";

export type bussinessControlPages =
  | "BUSINESS_CONTROL"
  | "EXPLORE_PAGE"
  | "MENU_PAGE"
  | "SETTING"
  | "CONGRATULATION";
export type businessType =
  | "FOOD"
  | "OTHER"
  | "RESTAURANT"
  | "HOTEL"
  | "ECOMMERCE"
  | "CLINIC"
  | "FASHION_JEWELRY"
  | "PERSONAL_BRAND"
  | ""

export type MenuLayout = "MAIN_CATEGORY" | "MAIN_AND_SUB_CATEGORY";
export type exploreLayout = "BUTTER" | "SUNFLOWER";

interface BusinessCtrl {
  step: number;
  setStep: (step: number) => void;
  goNext: () => void;
  goPrevious: () => void;
 

  exploreLayout: exploreLayout;
  menuLayout: MenuLayout;
  setExploreLayout: (layout: exploreLayout) => void;
  setMenuLayout: (layout: MenuLayout) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;

  // Create business
  businessType: businessType;
  setBusinessType: (type: businessType) => void;
  outletType: string;
  setOutletType: (type: string) => void;
  businessName: string;
  setBusinessName: (name: string) => void;
  customLink: string;
  setCustomLink: (link: string) => void;
  branches: Array<{ _id: string; name: string }>;
  setBranches: (branches: Array<{ _id: string; name: string }>) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  menu: boolean;
  setMenu: (value: boolean) => void;
  themes: boolean;
  setThemes: (value: boolean) => void;
  rewards: boolean;
  setRewards: (value: boolean) => void;
  paymentAndBusinessSettings: boolean;
  setPaymentAndBusinessSettings: (value: boolean) => void;
  reset: () => void;
  layoutFlowEnabled: boolean;
  setLayoutFlowEnabled: (value: boolean) => void;
  enableLayoutFlow: () => void;
  disableLayoutFlow: () => void;
}

const useBusinessCtrl = create<BusinessCtrl>((set) => {
  const defaultPrimaryColor = "#EDDEB8";
  const defaultSecondaryColor = "#116D6E";
  const businessData = useBusinessData.getState().businessData;
  useBusinessData.subscribe((state) => {
    if (
      state.businessData?.primaryColor ||
      state.businessData?.secondaryColor
    ) {
      set({
        primaryColor: state.businessData.primaryColor || defaultPrimaryColor,
        secondaryColor:
          state.businessData.secondaryColor || defaultSecondaryColor,
      });
    }
  });
  return {
    step: 0,
    setStep: (step: number) => set({ step }),
    goNext: () => set((state) => ({ step: state.step + 1 })),
    goPrevious: () => set((state) => ({ step: state.step - 1 })),

    exploreLayout: "BUTTER",
    setExploreLayout: (layout: exploreLayout) => set({ exploreLayout: layout }),
    menuLayout: "MAIN_AND_SUB_CATEGORY",
    setMenuLayout: (layout: MenuLayout) => set({ menuLayout: layout }),
    primaryColor: businessData?.primaryColor || "#EDDEB8",
    setPrimaryColor: (color: string) => set({ primaryColor: color }),
    secondaryColor: businessData?.secondaryColor || "#116D6E",
    setSecondaryColor: (color: string) => set({ secondaryColor: color }),
    businessType: "",
    setBusinessType: (type: businessType) => set({ businessType: type }),
    outletType: "",
    setOutletType: (type: string) => set({ outletType: type }),
    businessName: "",
    setBusinessName: (name: string) => set({ businessName: name }),
    customLink: "",
    setCustomLink: (link: string) => set({ customLink: link }),
    branches: [],
    setBranches: (branches) => set({ branches }),
    selectedBranch: "",
    setSelectedBranch: (branch: string) => set({ selectedBranch: branch }),
    menu: false,
    setMenu: (value: boolean) => set({ menu: value }),
    themes: false,
    setThemes: (value: boolean) => set({ themes: value }),
    rewards: false,
    setRewards: (value: boolean) => set({ rewards: value }),
    paymentAndBusinessSettings: false,
    setPaymentAndBusinessSettings: (value: boolean) =>
      set({ paymentAndBusinessSettings: value }),
    reset: () =>
      set({
        step: 0,
        exploreLayout: "BUTTER",
        menuLayout: "MAIN_AND_SUB_CATEGORY",
        primaryColor: "",
        secondaryColor: "",
        businessType: "",
        outletType: "",
        businessName: "",
        customLink: "",
        branches: [],
        selectedBranch: "",
        menu: false,
        themes: false,
        rewards: false,
        paymentAndBusinessSettings: false,
      }),

    layoutFlowEnabled: false,
    setLayoutFlowEnabled: (value: boolean) => set({ layoutFlowEnabled: value }),
    enableLayoutFlow: () => set({ layoutFlowEnabled: true }),
    disableLayoutFlow: () => set({ layoutFlowEnabled: false }),
  };
});

export default useBusinessCtrl;
