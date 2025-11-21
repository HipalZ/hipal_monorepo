import type { IExistingPayments } from "@/components/types/sales.types";
import { create } from "zustand";

export type salesViewMode = "grid" | "table";

export interface Filter {
  key: string;
  value: string[];
}

export type Filters = Filter[];

interface SalesStore {
  open: boolean;
  setOpen: (open: boolean) => void;

  downloadCsv: boolean;
  setDownloadCsv: (downloadCsv: boolean) => void;

  salesData: IExistingPayments[];
  setSalesData: (salesData: IExistingPayments[]) => void;

  totalSales: number;
  setTotalSales: (totalSales: number) => void;

  historyData: IExistingPayments[];
  setHistoryData: (historyData: IExistingPayments[]) => void;

  viewMode: salesViewMode;
  setViewMode: (viewMode: salesViewMode) => void;

  selectedDiscountTypes: string[];
  setSelectedDiscountTypes: (selectedDiscountTypes: string[]) => void;

  selectedWarnings: string[];
  setSelectedWarnings: (selectedWarnings: string[]) => void;

  selectedPaymentModes: string[];
  setSelectedPaymentModes: (selectedPaymentModes: string[]) => void;

  openFilterModal: boolean;
  setOpenFilterModal: (openFilterModal: boolean) => void;

  selectedFilters: Filters;
  setSelectedFilters: (selectedFilters: Filters) => void;
}

export const useSalesStore = create<SalesStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),

  downloadCsv: false,
  setDownloadCsv: (downloadCsv) => set({ downloadCsv }),

  salesData: [],
  setSalesData: (salesData) => set({ salesData }),

  totalSales: 0,
  setTotalSales: (totalSales) => set({ totalSales }),

  historyData: [],
  setHistoryData: (historyData) => set({ historyData }),

  viewMode: "grid",
  setViewMode: (viewMode) => set({ viewMode }),

  selectedDiscountTypes: [],
  setSelectedDiscountTypes: (selectedDiscountTypes) =>
    set({ selectedDiscountTypes }),

  selectedWarnings: [],
  setSelectedWarnings: (selectedWarnings) => set({ selectedWarnings }),

  selectedPaymentModes: [],
  setSelectedPaymentModes: (selectedPaymentModes) =>
    set({ selectedPaymentModes }),

  openFilterModal: false,
  setOpenFilterModal: (openFilterModal) => set({ openFilterModal }),

  selectedFilters: [],
  setSelectedFilters: (selectedFilters) => set({ selectedFilters }),
}));
