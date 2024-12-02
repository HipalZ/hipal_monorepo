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
}));
