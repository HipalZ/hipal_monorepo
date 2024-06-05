import { create } from "zustand";
import { IOrder } from "../types/hiTableData";

// Define the interface for alert data
interface IAlertData {
  businessId: string;
  tableName: string;
  tableId: string;
  staffId: string;
  status: string;
  time: string;
  message: string;
  isAlertOn: boolean;
  id: string;
  _id: string;
  isExtraSelected: boolean;
}

interface IPayAlert extends IAlertData {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpayAcquirerData: Record<string, any>;
  mode: string;
  razorpayEventId?: string;
}

interface IAlertStore {
  alertData: IAlertData[];
  orderData: IOrder[];
  historyData: IAlertData[];
  isExtraSelected: boolean;
  paymentsData: IPayAlert[];
  setPaymentsData: (newData: IPayAlert[]) => void;
  setAlertData: (newData: IAlertData[]) => void;
  setHistoryData: (newData: IAlertData[]) => void;
  payCount: number;
  setPayAlertsCount: (count: number) => void;
  newAlertsCount: number;
  setNewAlertsCount: (count: number) => void;
  newOrderCount: number;
  setNewOrderCount: (count: number) => void;
  setOrderData: (newData: IOrder[]) => void;
  setIsExtraSelected: (isExtraSelected: boolean) => void;
}

// Create a Zustand store for alert data and history data
export const useAlert = create<IAlertStore>((set) => ({
  alertData: [] as IAlertData[],
  historyData: [] as IAlertData[],
  orderData: [] as IOrder[],
  newAlertsCount: 0,
  newOrderCount: 0,
  isExtraSelected: false,
  payCount: 0,
  paymentsData: [] as IPayAlert[],
  setPaymentsData: (newData: IPayAlert[]) => set({ paymentsData: newData }),
  setPayAlertsCount: (count: number) => set({ payCount: count }),
  setAlertData: (newData: IAlertData[]) => set({ alertData: newData }),
  setHistoryData: (newData: IAlertData[]) => set({ historyData: newData }),
  setNewAlertsCount: (count: number) => set({ newAlertsCount: count }),
  setNewOrderCount: (count: number) => set({ newOrderCount: count }),
  setOrderData: (newData: IOrder[]) => set({ orderData: newData }),
  setIsExtraSelected: (isExtraSelected: boolean) => set({ isExtraSelected }), // Added this line
}));
