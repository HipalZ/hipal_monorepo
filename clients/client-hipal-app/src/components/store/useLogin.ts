import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface IUserData {
  name?: string;
  email?: string;
  phone: string;
  role: string[];
  userDescription?: string;
  googleReviewCount?: number;
  reward?: number;
  count?: number;
  _id: string;
  dob: number;
  birthdayTriggerCount?: number;
}
interface IRole {
  role: string;
  customerName: string;
  customerPhone: string;
}

interface IUseLogin {
  userDetails: IUserData;
  isLogin?: boolean;
  hiCode: string;
  errorMsg: string;
  direction: string;
  role: IRole;
  fromPage: string;
  isPayment: boolean;
  userCoinZ: number;
  invoiceUrl: string;
  setUserDetails: (d: IUserData) => void;
  setRole: (d: IRole) => void;
  setIsLogin: (d: boolean) => void;
  setHiCode: (d: string) => void;
  setErrorMsg: (d: string) => void;
  setDirection: (d: string) => void;
  setFromPage: (d: string) => void;
  isLoginCred: () => boolean;
  sendOtp: () => Promise<any>;
  setIsPayment: (d: boolean) => void;
  setUserCoinZ: (d: number) => void;
  subscribeModal: boolean;
  setSubscribeModal: (d: boolean) => void;
  setInvoiceUrl: (d: string) => void;
  // review popup
  reviewPopup: boolean;
  setReviewPopup: (d: boolean) => void;

  googleReviewCount: number;
  setGoogleReviewCount: (d: number) => void;

  urlFrom: string;
  setUrlFrom: (d: string) => void;
}

export const useLogin = create(
  persist<IUseLogin>(
    (set, get) => ({
      userDetails: {
        id: "",
        count: 0,
        email: "",
        name: "",
        phone: "",
        reward: 0,
        role: [],
        userDescription: "",
        _id: "",
        dob: 0,
        birthdayTriggerCount: 0,
      },
      isLogin: false,
      showLogin: false,
      hiCode: "",
      errorMsg: "",
      role: {
        role: "",
        customerName: "",
        customerPhone: "",
      },
      direction: "",
      fromPage: "",
      isPayment: false,
      userCoinZ: 0,
      subscribeModal: false,
      invoiceUrl: "",
      setSubscribeModal: (d: boolean) => set({ subscribeModal: d }),

      setUserDetails: (d: IUserData) => set({ userDetails: d }),
      setIsLogin: (d: boolean) => set({ isLogin: d }),
      setHiCode: (d: string) => set({ hiCode: d }),
      setErrorMsg: (d: string) => set({ errorMsg: d }),
      setDirection: (d: string) => set({ direction: d }),
      setFromPage: (d: string) => set({ fromPage: d }),
      setRole: (d: IRole) => set({ role: d }),
      setIsPayment: (d: boolean) => set({ isPayment: d }),
      setUserCoinZ: (d: number) => set({ userCoinZ: d }),
      isLoginCred: () => get()?.userDetails.phone?.length === 10,
      sendOtp: async () => {
        toast.success("otp send successfully");
        const res = await apiRpc.users.resendOtp.$post({
          json: {
            phone: get().userDetails.phone,
          },
        });
        return await res.json();
      },
      setInvoiceUrl: (d: string) => set({ invoiceUrl: d }),
      reviewPopup: false,
      setReviewPopup: (d: boolean) => set({ reviewPopup: d }),
      googleReviewCount: 0,
      setGoogleReviewCount: (d: number) => set({ googleReviewCount: d }),
      urlFrom: "",
      setUrlFrom: (d: string) => set({ urlFrom: d }),
    }),
    {
      name: "useLogin",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
