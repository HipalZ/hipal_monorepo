import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PaymentMethod {
  businessId: string;
  mode: string;
  commission: number;
  id: string;
}

interface PaymentMethodsState {
  paymentMethods: PaymentMethod[];
  lastUpdated: number | null;
  setPaymentMethods: (paymentMethods: PaymentMethod[]) => void;
}

export const usePaymentMethodsStore = create(
  persist<PaymentMethodsState>(
    (set) => ({
      paymentMethods: [],
      lastUpdated: null,

      setPaymentMethods: (paymentMethods) =>
        set(() => ({
          paymentMethods,
          lastUpdated: Date.now(),
        })),
    }),
    {
      name: 'hibiz-payment-storage',
    },
  ),
);
