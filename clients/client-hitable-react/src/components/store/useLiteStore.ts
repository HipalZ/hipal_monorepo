import type {
  Alert,
  NavItemTypes,
  ISalesLite,
  Cart,
} from "@/components/types/hiClientzData";
import { create } from "zustand";

interface ILiteStore {
  // handling popup views
  clickViewMore: boolean;
  setClickViewMore: (value: boolean) => void;

  // nav items toggling
  selectedNavItem: NavItemTypes;
  setSelectedNavItem: (value: NavItemTypes) => void;

  // confirm code operations
  clickedConfirm: boolean;
  setClickedConfirm: (value: boolean) => void;

  //online alerts
  onlineAlertData: Alert[];
  setOnlineAlertData: (value: Alert[]) => void;

  //offline alerts
  offlineAlertData: Alert[];
  setOfflineAlertData: (value: Alert[]) => void;

  //waiter Alerts
  historyData: Alert[];
  setHistoryData: (value: Alert[]) => void;

  salesData: ISalesLite;
  setSalesData: (value: ISalesLite) => void;
  // remove alert
  removeOnlineAlert: (id: string) => void;
  removeOfflineAlert: (id: string) => void;

  viewData: Alert;
  setViewData: (value: Alert) => void;

  // refetch online and offline data
  refetchOnlineAlerts: () => void;
  refetchOfflineAlerts: () => void;
  setRefetchOnlineAlerts: (fn: () => void) => void;
  setRefetchOfflineAlerts: (fn: () => void) => void;

  refetchCart: () => void;
  setRefetchCart: (fn: () => void) => void;

  // loading states
  loading: boolean;
  setLoading: (value: boolean) => void;

  // online order count
  onlineCount: number;
  setOnlineCount: (value: number) => void;

  // offline order count
  offlineCount: number;
  setOfflineCount: (value: number) => void;

  // cart count
  cartCount: number;
  setCartCount: (value: number) => void;

  // remove offline count on alert removal
  removeOfflineCount: () => void;
  removeOnlineCount: () => void;

  // state to trigger sound
  triggerSound: boolean;
  setTriggerSound: (value: boolean) => void;

  notificationStatus: boolean | null;
  setNotificationStatus: (notify: boolean) => void;

  cartData: Cart[];
  setCartData: (data: Cart[]) => void;
  removeCart: (id: string) => void;

  showSearchBox: boolean;
  setShowSearchBox: (value: boolean) => void;

  isAscending: boolean;
  setIsAscending: (value: boolean) => void;
}

export const useLiteStore = create<ILiteStore>((set) => ({
  clickViewMore: false,
  setClickViewMore: (value) => set({ clickViewMore: value }),
  selectedNavItem: "Tables",
  setSelectedNavItem: (value) => set({ selectedNavItem: value }),
  clickedConfirm: false,
  setClickedConfirm: (value) => set({ clickedConfirm: value }),
  onlineAlertData: [],
  setOnlineAlertData: (value) => set({ onlineAlertData: value }),
  offlineAlertData: [],
  setOfflineAlertData: (value) => set({ offlineAlertData: value }),
  historyData: [],
  setHistoryData: (value) => set({ historyData: value }),
  salesData: {} as ISalesLite,
  setSalesData: (value) => set({ salesData: value }),
  removeOnlineAlert: (id) =>
    set((state) => ({
      onlineAlertData: state.onlineAlertData.filter(
        (alert) => alert._id !== id,
      ),
    })),
  removeOfflineAlert: (id) =>
    set((state) => ({
      offlineAlertData: state.offlineAlertData.filter(
        (alert) => alert._id !== id,
      ),
    })),
  viewData: {} as Alert,
  setViewData: (value) => set({ viewData: value }),
  refetchOnlineAlerts: () => {},
  refetchOfflineAlerts: () => {},
  setRefetchOnlineAlerts: (fn) => set({ refetchOnlineAlerts: fn }),
  setRefetchOfflineAlerts: (fn) => set({ refetchOfflineAlerts: fn }),

  refetchCart: () => {},
  setRefetchCart: (fn) => set({ refetchCart: fn }),

  loading: false,
  setLoading: (value) => set({ loading: value }),
  onlineCount: 0,
  setOnlineCount: (value) => set({ onlineCount: value }),
  offlineCount: 0,
  setOfflineCount: (value) => set({ offlineCount: value }),
  removeOfflineCount: () =>
    set((state) => ({ offlineCount: state.offlineCount - 1 })),
  removeOnlineCount: () =>
    set((state) => ({ onlineCount: state.onlineCount - 1 })),
  triggerSound: false,
  setTriggerSound: (value) => set({ triggerSound: value }),

  cartData: [],
  setCartData: (data) => set({ cartData: data }),

  removeCart: (id: string) =>
    set((state) => ({
      cartData: state.cartData.filter((cart) => cart._id !== id),
    })),

  notificationStatus: true,
  setNotificationStatus: (value: boolean) => set({ notificationStatus: value }),

  cartCount: 0,
  setCartCount: (value) => set({ cartCount: value }),

  showSearchBox: false,
  setShowSearchBox: (value) => set({ showSearchBox: value }),

  isAscending: false,
  setIsAscending: (value) => set({ isAscending: value }),
}));
