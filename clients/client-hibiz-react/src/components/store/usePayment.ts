import { createWithEqualityFn } from "zustand/traditional";
import { createJSONStorage, persist } from "zustand/middleware";

interface PaymentStore {
  razorPayPaymentId: string;
  razorPayOrderId: string;
  razorPaySignature: string;
  setRazorPayPaymentId: (paymentId: string) => void;
  setRazorPayOrderId: (orderId: string) => void;
  setRazorPaySignature: (signature: string) => void;
}

const usePayment = createWithEqualityFn(
  persist<PaymentStore>(
    (set) => ({
      razorPayPaymentId: "",
      razorPayOrderId: "",
      razorPaySignature: "",
      setRazorPayPaymentId: (paymentId) =>
        set({ razorPayPaymentId: paymentId }),
      setRazorPayOrderId: (orderId) => set({ razorPayOrderId: orderId }),
      setRazorPaySignature: (signature) =>
        set({ razorPaySignature: signature }),
    }),
    {
      name: "paymentz-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default usePayment;
