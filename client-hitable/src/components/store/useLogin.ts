import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IUseLogin {
  phoneNumber?: string;
  name?: string;
  businessName?: string;
  password: string;
  time?: string;
  isLogin?: boolean;
  zoneName?: string;
  loyaltyId?: string;
  childId?: string;
  userDetails: {
    _id: any;
    name?: string;
    phoneNumber?: string;
    phone?: string;
    id?: string;
    email?: string;
    role?: string;
    customRole?: {
      businessId: string;
      customRoleId: string;
      permissions: string[];
      roleName: string;
    }[];
  };

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

  setPhoneNumber: (d: string) => void;
  setName: (d: string) => void;
  setBusinessName: (d: string) => void;
  setZoneName: (d: string) => void;
  setLoyaltyId: (loyaltyId: string) => void;
  setPassword: (d: string) => void;
  setTime: (d: string) => void;
  setUserDetails: (d: any) => void;
  setIsLogin: (d: boolean) => void;
  setGrouped_customers: (d: any) => void;
  setSelectedZone: (zone: any) => void;
  setChildId: (d: string) => void;
}

export const useLogin = create(
  persist<IUseLogin>(
    (set, get) => ({
      phoneNumber: "",
      name: "",
      businessName: "",
      password: "",
      time: "",
      userDetails: {},
      isLogin: false,
      zoneName: "",
      loyaltyId: "",
      grouped_customers: {},
      selectedZone: undefined,
      childId: "",
      setChildId: (d: string) => set({ childId: d }),
      setSelectedZone: (zone: any) => set({ selectedZone: zone }),
      setPhoneNumber: (d: string) => set({ phoneNumber: d }),
      setName: (d: string) => set({ name: d }),
      setBusinessName: (d: string) => set({ businessName: d }),
      setPassword: (d: string) => set({ password: d }),
      setTime: (d: string) => set({ time: d }),
      setUserDetails: (d: any) => set({ userDetails: d }),
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
