import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
  customRole: CustomRole[];
  password: string;
  id: string;
  accessControl: {
    dish: boolean;
    staff: boolean;
    loyalty: boolean;
    sale: boolean;
    reports: boolean;
    zones_tables: boolean;
  };
}

interface CustomRole {
  businessId: string;
  customRoleId: string;
}

export interface IUserLogin {
  phoneNumber: string;
  password: string;
  isLogin: boolean;
  businessId: string;
  user: User;

  setPhoneNumber: (d: string) => void;
  setPassword: (d: string) => void;
  setIsLogin: (d: boolean) => void;
  setBusinessId: (d: string) => void;
  setUser: (d: User) => void;
}

export const useOwnerLogin = create(
  persist<IUserLogin>(
    (set) => ({
      phoneNumber: "",
      password: "",
      businessId: "",
      isLogin: false,
      user: {
        name: "",
        email: "",
        phone: "",
        role: "",
        customRole: [],
        password: "",
        id: "",
        accessControl: {
          dish: false,
          staff: false,
          loyalty: false,
          sale: false,
          reports: false,
          zones_tables: false,
        },
      },

      setPhoneNumber: (d: string) => set({ phoneNumber: d }),
      setPassword: (d: string) => set({ password: d }),
      setIsLogin: (d: boolean) => set({ isLogin: d }),
      setBusinessId: (d: string) => set({ businessId: d }),
      setUser: (d: User) => set({ user: d }),
    }),
    {
      name: "ownerLogin",
    }
  )
);
