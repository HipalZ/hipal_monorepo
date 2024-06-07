import { create } from "zustand";

interface DiscountStore {
  selectedPaymentMethod: string;
  multiplePaymentMethods: string[];

  setSelectedPaymentMethod: (method: string) => void;
  setMultiplePaymentMethods: (methods: string[]) => void;
}

const useDiscountStore = create<DiscountStore>((set) => ({
  selectedPaymentMethod: "",
  multiplePaymentMethods: [],

  setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  setMultiplePaymentMethods: (methods) =>
    set({ multiplePaymentMethods: methods }),
}));

export default useDiscountStore;
