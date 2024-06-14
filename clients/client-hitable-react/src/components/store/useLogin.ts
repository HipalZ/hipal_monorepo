import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IUserLogin {
  [x: string]: any;
  name: string;
  phone: string;
  _id: string;
  email?: string;
  role: string;
  customRole: {
    businessId: string;
    customRoleId: string;
    permissions: string[];
    roleName: string;
  }[];
}

interface IUseLogin {
  businessName?: string;
  password: string;
  time?: string;
  isLogin?: boolean;
  zoneName?: string;
  loyaltyId?: string;
  childId?: string
  userDetails: IUserLogin
  selectedZone?: {
    businessId: string;
    zoneName: string;
    zoneType: string;
    startTime: string;
    endTime: string;
    staff: string[];
    tables: string[];
    Occupied: number;
    charges: any[];
    id: string;
  };
  grouped_customers?: {};

  setBusinessName: (d: string) => void;
  setZoneName: (d: string) => void;
  setLoyaltyId: (loyaltyId: string) => void;
  setPassword: (d: string) => void;
  setTime: (d: string) => void;
  setUserDetails: (d: IUserLogin) => void;
  setIsLogin: (d: boolean) => void;
  setGrouped_customers: (d: any) => void;
  setSelectedZone: (zone: any) => void;
  setChildId: (d: string) => void
}

export const useLogin = create(
  persist<IUseLogin>(
    (set) => ({
      businessName: "",
      password: "",
      time: "",
      userDetails: {
        _id: "",
        name: "",
        phone: "",
        role: "",
        customRole: [
          {
            businessId: "",
            customRoleId: "",
            permissions: [],
            roleName: "",
          },
        ],
      },
      isLogin: false,
      zoneName: "",
      loyaltyId: "",
      grouped_customers: {},
      selectedZone: undefined,
      childId: "",
      setChildId: (d: string) => set({ childId: d }),
      setSelectedZone: (zone: any) => set({ selectedZone: zone }),
      setBusinessName: (d: string) => set({ businessName: d }),
      setPassword: (d: string) => set({ password: d }),
      setTime: (d: string) => set({ time: d }),
      setUserDetails: (d: IUserLogin) => set({ userDetails: d }),
      setIsLogin: (d: boolean) => set({ isLogin: d }),
      setZoneName: (d: string) => set({ zoneName: d }),
      setLoyaltyId: (loyaltyId: string) => set({ loyaltyId: loyaltyId }),
      setGrouped_customers: (d: any) => set({ grouped_customers: d }),
    }),
    {
      name: "waiterLogin",
    }
  )
);
