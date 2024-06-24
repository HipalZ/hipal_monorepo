import create from 'zustand';
import { persist } from 'zustand/middleware';

interface PaymentState {
  businessId: string;
  tableName: string;
  tableId: string;
  status: string;
  time: number;
  message: string;
  isAlertOn: boolean;
  zoneId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpayAcquirerData: {
    rrn: string;
    upi_transaction_id: string;
  };
  mode: string;
  razorpayEventId: string;
  id: string;
}

const usePayment = create<any>(
  persist(
    (set) => ({
      businessId: '',
      tableName: '',
      tableId: '',
      status: '',
      time: Date.now(),
      message: '',
      isAlertOn: false,
      zoneId: '',
      razorpayPaymentId: '',
      razorpayOrderId: '',
      razorpayAcquirerData: {
        rrn: '',
        upi_transaction_id: '',
      },
      mode: '',
      razorpayEventId: '',
      id: '',
      setId: (id: string) => set({ id }),
      setRazorpayEventId: (razorpayEventId: string) =>
        set({
          razorpayEventId,
        }),
      setMode: (mode: string) =>
        set({
          mode,
        }),
      setRazorpayPaymentId: (razorpayPaymentId: string) =>
        set({
          razorpayPaymentId,
        }),
      setRazorpayOrderId: (razorpayOrderId: string) =>
        set({
          razorpayOrderId,
        }),
      setRazorpayAcquirerData: (razorpayAcquirerData: { rrn: string; upi_transaction_id: string }) =>
        set({
          razorpayAcquirerData,
        }),
    }),
    {
      name: 'paymentData-hitable',
    },
  ),
);

export default usePayment;
