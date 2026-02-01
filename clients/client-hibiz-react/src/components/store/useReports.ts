import type {
  BusinessAddonReport,
  BusinessCategoryReport,
  BusinessDiscountReport,
  BusinessItemReport,
  BusinessDishTypeReport,
  BusinessItemVariantReport,
  BusinessParentCategoryReport,
  ServiceChargeReport,
} from "@/hooks/useReportHook.ts";
import { create } from "zustand";

export type ReportsTypes =
  | "category"
  | "parentCategory"
  | "item"
  | "itemVariant"
  | "dishType"
  | "discount"
  | "serviceCharge"
  | "combined"
  | "addOn"
  | "deleted_items";

export type LayoutType = "table" | "compact";

interface ReportsState {
  reportPage: ReportsTypes;
  setReportPage: (reportPage: ReportsTypes) => void;

  categoryReports: BusinessCategoryReport[];
  setCategoryReports: (categoryReports: BusinessCategoryReport[]) => void;

  parentCategoryReports: BusinessParentCategoryReport[];
  setParentCategoryReports: (reports: BusinessParentCategoryReport[]) => void;

  itemReports: BusinessItemReport[];
  setItemReports: (reports: BusinessItemReport[]) => void;

  discountReports: BusinessDiscountReport[];
  setDiscountReports: (reports: BusinessDiscountReport[]) => void;

  addonReports: BusinessAddonReport[];
  setAddonReports: (reports: BusinessAddonReport[]) => void;

  serviceChargeReports: ServiceChargeReport[];
  setServiceChargeReports: (reports: ServiceChargeReport[]) => void;

  dishTypeReports: BusinessDishTypeReport[];
  setDishTypeReports: (reports: BusinessDishTypeReport[]) => void;

  itemVariantReports: BusinessItemVariantReport[];
  setItemVariantReports: (reports: BusinessItemVariantReport[]) => void;

  layoutType: LayoutType;
  setLayoutType: (layoutType: LayoutType) => void;
}

const useReports = create<ReportsState>((set) => ({
  reportPage: "category",
  setReportPage: (reportPage: ReportsTypes) => set({ reportPage }),

  categoryReports: [],
  setCategoryReports: (categoryReports: BusinessCategoryReport[]) =>
    set({ categoryReports }),

  parentCategoryReports: [],
  setParentCategoryReports: (parentCategoryReports: BusinessParentCategoryReport[]) =>
    set({ parentCategoryReports }),

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

  dishTypeReports: [],
  setDishTypeReports: (reports: BusinessDishTypeReport[]) =>
    set({ dishTypeReports: reports }),

  itemVariantReports: [],
  setItemVariantReports: (reports: BusinessItemVariantReport[]) =>
    set({ itemVariantReports: reports }),

  layoutType: "table",
  setLayoutType: (layoutType: LayoutType) => set({ layoutType }),
}));

export default useReports;
