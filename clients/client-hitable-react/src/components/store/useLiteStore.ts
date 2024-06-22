import {create} from 'zustand';
import {Alert, NavItemTypes, ISalesLite} from '@/components/types/hiClientzData';

interface ILiteStore {
  // handling popup views
  clickViewMore: boolean;
  setClickViewMore: (value: boolean) => void;

  // nav items toggling
  selectedNavItem : NavItemTypes;
  setSelectedNavItem : (value : NavItemTypes) => void;
  
  // confirm code operations
  clickedConfirm : boolean;
  setClickedConfirm : (value : boolean) => void;

  //online alerts
  onlineAlertData : Alert[];
  setOnlineAlertData : (value : Alert[]) => void;

  //offline alerts
  offlineAlertData : Alert[];
  setOfflineAlertData : (value : Alert[]) => void;

  //waiter Alerts
  historyData : Alert[];
  setHistoryData : (value : Alert[]) => void;

  salesData: ISalesLite;
  setSalesData: (value: ISalesLite) => void;
  // remove alert
  removeAlert: (id: string) => void;

  viewData: Alert;
  setViewData: (value: Alert) => void;
}


export const useLiteStore = create<ILiteStore>((set) => ({
  clickViewMore : false,
  setClickViewMore : (value) => set({clickViewMore : value}),
  selectedNavItem : "online",
  setSelectedNavItem : (value) => set({selectedNavItem : value}),
  clickedConfirm : false,
  setClickedConfirm : (value) => set({clickedConfirm : value}),
  onlineAlertData : [],
  setOnlineAlertData : (value) => set({onlineAlertData : value}),
  offlineAlertData : [],
  setOfflineAlertData : (value) => set({offlineAlertData : value}),
  historyData : [],
  setHistoryData : (value) => set({historyData : value}),
  salesData: {} as ISalesLite,
  setSalesData: (value) => set({salesData: value}),
  removeAlert: (id) => set((state) => ({
    onlineAlertData: state.onlineAlertData.filter(alert => alert._id !== id)
  })),
  viewData: {} as Alert,
  setViewData: (value) => set({viewData: value}),
}));
