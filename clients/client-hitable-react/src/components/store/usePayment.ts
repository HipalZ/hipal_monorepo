import {create} from "zustand";
import { persist } from "zustand/middleware";

const usePayment = create(
  persist(
    (set) => ({
      businessId: "",
      tableName: "",
      tableId: "",
      status: "",
      time: Date.now(),
      message: "",
      isAlertOn: false,
      zoneId: "",
      razorpayPaymentId: "",
      razorpayOrderId: "",
      razorpayAcquirerData: {
        rrn: "",
        upi_transaction_id: "",
      },
      mode: "",
      razorpayEventId: "",
      id: "",
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
      setRazorpayAcquirerData: (razorpayAcquirerData: {
        rrn: string;
        upi_transaction_id: string;
      }) =>
        set({
          razorpayAcquirerData,
        }),
    }),
    {
      name: "paymentData-hitable",
    }
  )
);

export default usePayment;
