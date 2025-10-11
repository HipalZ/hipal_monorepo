import { createWithEqualityFn } from "zustand/traditional";

interface TaxStore {
  linkDishModal: boolean;
  selectedTaxId: string | null;
  setLinkDishModal: (show: boolean) => void;
  setSelectedTaxId: (taxId: string | null) => void;
}

export const useTaxStore = createWithEqualityFn<TaxStore>((set) => ({
  linkDishModal: false,
  selectedTaxId: null,
  setLinkDishModal: (show) => set({ linkDishModal: show }),
  setSelectedTaxId: (taxId) => set({ selectedTaxId: taxId }),
}));
