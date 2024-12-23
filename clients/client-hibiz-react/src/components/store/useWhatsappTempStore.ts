import { create } from "zustand";
import type {
  IWhatsAppMessage,
  WhatsAppTemplatePayload,
} from "../types/businessData";

export enum Tabs {
  TEMPLATES = "templates",
  CAMPAIGNS = "campaigns",
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: string;
  status: "sent" | "delivered" | "read";
}

export interface UserId {
  _id: string;
  name: string;
  phone: string;
}

export interface Subscriber {
  whatsappMsgUnseenCount: number;
  userId: UserId;
  businessId: string;
}

export interface Campaign {
  templateName: string;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  cost: number;
}

interface ITempStore {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  activeTab: Tabs;
  setActiveTab: (activeTab: Tabs) => void;

  allTemplates: WhatsAppTemplatePayload[];
  setAllTemplates: (allTemplates: WhatsAppTemplatePayload[]) => void;

  message: string;
  setMessage: (message: string) => void;

  selectedUser: UserId | null;
  setSelectedUser: (selectedUser: UserId | null) => void;

  users: Subscriber[];
  setUsers: (users: Subscriber[]) => void;

  userChat: IWhatsAppMessage[];
  setUserChat: (userChat: IWhatsAppMessage[]) => void;

  isMobileListView: boolean;
  setIsMobileListView: (value: boolean) => void;

  step: number;
  setStep: (value: number) => void;

  displayNumber: string;
  setDisplayNumber: (value: string) => void;

  displayName: string;
  setDisplayName: (value: string) => void;

  email: string;
  setEmail: (value: string) => void;

  facebookId: string;
  setFacebookId: (value: string) => void;

  facebookPassword: string;
  setFacebookPassword: (value: string) => void;

  resetFormData: () => void;

  whatzappFormEnabled: boolean;
  setWhatzappFormEnabled: (value: boolean) => void;

  whatzappStatus: boolean;
  setWhatzappStatus: (value: boolean) => void;

  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;

  checkReg: boolean;
  setCheckReg: (value: boolean) => void;

  openAnalytics: boolean;
  setOpenAnalytics: (value: boolean) => void;

  selectedCampaign: Campaign;
  setSelectedCampaign: (value: Campaign) => void;
}

export const useWhatsappTempStore = create<ITempStore>((set) => ({
  isLoading: false,
  setIsLoading: (value: boolean) => set({ isLoading: value }),

  activeTab: Tabs.TEMPLATES,
  setActiveTab: (activeTab: Tabs) => set({ activeTab }),

  allTemplates: [],
  setAllTemplates: (allTemplates: WhatsAppTemplatePayload[]) =>
    set({ allTemplates }),

  message: "",
  setMessage: (message: string) => set({ message }),

  selectedUser: null,
  setSelectedUser: (selectedUser: UserId | null) => set({ selectedUser }),

  users: [],
  setUsers: (users: Subscriber[]) => set({ users }),

  userChat: [],
  setUserChat: (userChat: IWhatsAppMessage[]) => set({ userChat }),

  isMobileListView: true,
  setIsMobileListView: (value: boolean) => set({ isMobileListView: value }),

  step: 0,
  setStep: (value: number) => set({ step: value }),

  displayNumber: "",
  setDisplayNumber: (value: string) => set({ displayNumber: value }),

  displayName: "",
  setDisplayName: (value: string) => set({ displayName: value }),

  email: "",
  setEmail: (value: string) => set({ email: value }),

  facebookId: "",
  setFacebookId: (value: string) => set({ facebookId: value }),

  facebookPassword: "",
  setFacebookPassword: (value: string) => set({ facebookPassword: value }),

  resetFormData: () =>
    set({
      displayNumber: "",
      displayName: "",
      email: "",
      facebookId: "",
      facebookPassword: "",
    }),

  whatzappFormEnabled: false,
  setWhatzappFormEnabled: (value: boolean) =>
    set({ whatzappFormEnabled: value }),

  termsAccepted: false,
  setTermsAccepted: (value: boolean) => set({ termsAccepted: value }),

  whatzappStatus: false,
  setWhatzappStatus: (value: boolean) => set({ whatzappStatus: value }),

  checkReg: false,
  setCheckReg: (value: boolean) => set({ checkReg: value }),

  openAnalytics: false,
  setOpenAnalytics: (value: boolean) => set({ openAnalytics: value }),

  selectedCampaign: {
    templateName: "",
    sent: 0,
    delivered: 0,
    read: 0,
    clicked: 0,
    cost: 0,
  },
  setSelectedCampaign: (value: Campaign) => set({ selectedCampaign: value }),
}));
