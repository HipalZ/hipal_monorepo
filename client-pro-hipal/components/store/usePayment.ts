import {create} from 'zustand';
import { persist } from 'zustand/middleware';

type PaymentStore = {
    razorPayPaymentId: string;
    razorPayOrderId: string;
    razorPaySignature: string;
    setRazorPayPaymentId: (paymentId: string) => void;
    setRazorPayOrderId: (orderId: string) => void;
    setRazorPaySignature: (signature: string) => void;
};

const usePayment = create<PaymentStore>(
  persist(
    (set) => ({
      razorPayPaymentId: '',
      razorPayOrderId: '',
      razorPaySignature: '',
      setRazorPayPaymentId: (paymentId) => set({ razorPayPaymentId: paymentId }),
      setRazorPayOrderId: (orderId) => set({ razorPayOrderId: orderId }),
      setRazorPaySignature: (signature) => set({ razorPaySignature: signature }),
    }),
    {
      name: 'payment-store', 
      getStorage: () => localStorage,
    }
  )
);

export default usePayment;