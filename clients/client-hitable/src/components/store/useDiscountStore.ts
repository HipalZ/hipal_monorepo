import { create } from 'zustand';

interface DiscountStore {
  discount: number;
  selectedPaymentMethod: string;
  duesPersons: any[];
  dineInUser: number;
  selectedPerson: null | { id: string; name: string };
  discountDescription: string;
  multiplePaymentMethods: string[];
  tips: number;

  setDiscount: (value: number) => void;
  setDiscountDescription: (value: string) => void;
  setSelectedPaymentMethod: (method: string) => void;
  setDuesPersons: (value: any[]) => void;
  setDineInUser: (value: number) => void;
  setSelectedPerson: (user: { id: string; name: string }) => void;
  setMultiplePaymentMethods: (methods: string[]) => void;
  setTips: (value: number) => void;
}

const useDiscountStore = create<DiscountStore>((set) => ({
  discount: 0,
  selectedPaymentMethod: '',
  duesPersons: [],
  selectedPerson: null,
  discountDescription: '',
  dineInUser: 0,
  multiplePaymentMethods: [],
  tips: 0,

  setDiscount: (value) => set({ discount: value }),
  setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  setDuesPersons: (duesPersons) => set({ duesPersons }),
  setDiscountDescription: (value) => set({ discountDescription: value }),
  setSelectedPerson: (user) => set({ selectedPerson: user }),
  setDineInUser: (value) => set({ dineInUser: value }),
  setMultiplePaymentMethods: (methods) => set({ multiplePaymentMethods: methods }),
  setTips: (value) => set({ tips: value }),
}));

export default useDiscountStore;
