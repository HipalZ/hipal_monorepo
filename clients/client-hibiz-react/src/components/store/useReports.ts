import type {
  BusinessAddonReport,
  BusinessCategoryReport,
  BusinessDiscountReport,
  BusinessItemReport,
  ServiceChargeReport,
} from "@/hooks/useReportHook.ts";
import { create } from "zustand";

export type ReportsTypes =
  | "category"
  | "item"
  | "discount"
  | "serviceCharge"
  | "addOn";

export type LayoutType = "table" | "compact";

interface ReportsState {
  reportPage: ReportsTypes;
  setReportPage: (reportPage: ReportsTypes) => void;

  categoryReports: BusinessCategoryReport[];
  setCategoryReports: (categoryReports: BusinessCategoryReport[]) => void;

  itemReports: BusinessItemReport[];
  setItemReports: (reports: BusinessItemReport[]) => void;

  discountReports: BusinessDiscountReport[];
  setDiscountReports: (reports: BusinessDiscountReport[]) => void;

  addonReports: BusinessAddonReport[];
  setAddonReports: (reports: BusinessAddonReport[]) => void;

  serviceChargeReports: ServiceChargeReport[];
  setServiceChargeReports: (reports: ServiceChargeReport[]) => void;

  layoutType: LayoutType;
  setLayoutType: (layoutType: LayoutType) => void;
}

const useReports = create<ReportsState>((set) => ({
  reportPage: "category",
  setReportPage: (reportPage: ReportsTypes) => set({ reportPage }),

  categoryReports: [],
  setCategoryReports: (categoryReports: BusinessCategoryReport[]) =>
    set({ categoryReports }),

  itemReports: [],
  setItemReports: (reports: BusinessItemReport[]) =>
    set({ itemReports: reports }),

  discountReports: [],
  setDiscountReports: (reports: BusinessDiscountReport[]) =>
    set({ discountReports: reports }),

  addonReports: [],
  setAddonReports: (reports: BusinessAddonReport[]) =>
    set({ addonReports: reports }),

  serviceChargeReports: [],
  setServiceChargeReports: (reports: ServiceChargeReport[]) =>
    set({ serviceChargeReports: reports }),

  layoutType: "table",
  setLayoutType: (layoutType: LayoutType) => set({ layoutType }),
}));

export default useReports;
