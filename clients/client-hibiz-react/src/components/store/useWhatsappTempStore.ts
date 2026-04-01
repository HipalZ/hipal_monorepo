import { create } from "zustand";
import { ISelectedFlowType } from "../helpers/whatzAppHelpers";
import type {
  IWhatsAppFlows,
  IWhatsAppMessage,
  WhatsAppTemplatePayload,
} from "../types/businessData";

export enum Tabs {
  TEMPLATES = "templates",
  CAMPAIGNS = "campaigns",
  FLOWS = "flows",
  CHATS = "chats",
  SETTINGS = "settings",
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
  lastUserMessageAt?: number;
}

export interface Subscriber {
  whatsappMsgUnseenCount: number;
  userId: UserId;
  businessId: string;
}

export interface TemplateAnalytics {
  id: string;
  blocked: number;
  failed: number;
  templateId: string;
  templateName: string;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  cost: number;
}

export interface Campaign {
  campaignName: string;
  _id: string;
  businessId: string;
  name: string;
  phone: string;
  templateId: string;
  status: string;
  date: number;
  campaignId: string;
}

export interface CampaignAnalytics {
  userId: {
    name: string;
    phone: string;
  };
  _id: string;
  businessId: string;
  name: string;
  phone: string;
  templateId: string;
  status: string;
  date: number;
  campaignId: string;
}

export interface OverAllCount {
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  failed: number;
  blocked: number;
}

export interface CampaignsData {
  overAllCount: OverAllCount;
  campaignAnalytics: CampaignAnalytics[];
}
export interface ExampleFlow {
  name: string;
  status: string;
  categories: string[];
  validation_errors: string[];
  id: string;
}

export const exampleFlow2: ExampleFlow = {
  name: "Example Flow 2",
  status: "DRAFT",
  categories: ["CUSTOMER_SUPPORT", "SURVEY"],
  validation_errors: [],
  id: "505786989151477",
};

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

  whatzappStatus: boolean;
  setWhatzappStatus: (value: boolean) => void;

  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;

  checkReg: boolean;
  setCheckReg: (value: boolean) => void;

  openAnalytics: boolean;
  setOpenAnalytics: (value: boolean) => void;

  selectedTemplate: TemplateAnalytics;
  setSelectedTemplate: (value: TemplateAnalytics) => void;

  selectedCampaign: Campaign;
  setSelectedCampaign: (value: Campaign) => void;

  campaignsData: CampaignsData;
  setCampaignsData: (value: CampaignsData) => void;

  allCampaignsList: Campaign[];
  setAllCampaignsList: (value: Campaign[]) => void;

  pageNumber: number;
  setPageNumber: (value: number) => void;

  status: string;
  setStatus: (value: string) => void;

  openExport: boolean;
  setOpenExport: (value: boolean) => void;

  selectedPhones: string[];
  setSelectedPhones: (value: string[]) => void;

  addPhone: (phone: string) => void;
  removePhone: (phone: string) => void;
  clearSelectedPhones: () => void;
  addMultiplePhones: (phones: string[]) => void;

  loadingTemplateId: string | null;
  setLoadingTemplateId: (value: string | null) => void;

  openAccordionId: string | null;
  setOpenAccordionId: (value: string | null) => void;

  selectedFlowType: ISelectedFlowType | null;
  setSelectedFlowType: (value: ISelectedFlowType | null) => void;

  createEditFlow: boolean;
  setCreateEditFlow: (value: boolean) => void;

  editFlowObject: IWhatsAppFlows | null;
  setEditFlowObject: (value: IWhatsAppFlows | null) => void;

  flowBuilderOpen: boolean;
  setFlowBuilderOpen: (value: boolean) => void;

  flow: ExampleFlow;
  setFlow: (flow: ExampleFlow) => void;
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

  termsAccepted: false,
  setTermsAccepted: (value: boolean) => set({ termsAccepted: value }),

  whatzappStatus: false,
  setWhatzappStatus: (value: boolean) => set({ whatzappStatus: value }),

  checkReg: false,
  setCheckReg: (value: boolean) => set({ checkReg: value }),

  openAnalytics: false,
  setOpenAnalytics: (value: boolean) => set({ openAnalytics: value }),

  selectedTemplate: {
    templateId: "",
    id: "",
    templateName: "",
    delivered: 0,
    read: 0,
    clicked: 0,
    cost: 0,
    blocked: 0,
    failed: 0,
    sent: 0,
  },
  setSelectedTemplate: (value: TemplateAnalytics) =>
    set({ selectedTemplate: value }),

  selectedCampaign: {
    campaignName: "",
    _id: "",
    businessId: "",
    name: "",
    phone: "",
    templateId: "",
    status: "",
    date: 0,
    campaignId: "",
  },
  setSelectedCampaign: (value: Campaign) => set({ selectedCampaign: value }),

  campaignsData: {
    overAllCount: {
      sent: 0,
      delivered: 0,
      read: 0,
      clicked: 0,
      failed: 0,
      blocked: 0,
    },
    campaignAnalytics: [],
  },

  setCampaignsData: (value: CampaignsData) => set({ campaignsData: value }),

  allCampaignsList: [],
  setAllCampaignsList: (value: Campaign[]) => set({ allCampaignsList: value }),

  pageNumber: 1,
  setPageNumber: (value: number) => set({ pageNumber: value }),

  status: "",
  setStatus: (value: string) => set({ status: value }),

  openExport: false,
  setOpenExport: (value: boolean) => set({ openExport: value }),

  selectedPhones: [],
  setSelectedPhones: (value: string[]) => set({ selectedPhones: value }),

  addPhone: (phone) =>
    set((state) => ({
      selectedPhones: state.selectedPhones.includes(phone)
        ? state.selectedPhones
        : [...state.selectedPhones, phone],
    })),

  removePhone: (phone) =>
    set((state) => ({
      selectedPhones: state.selectedPhones.filter((p) => p !== phone),
    })),

  clearSelectedPhones: () => set({ selectedPhones: [] }),

  addMultiplePhones: (phones) =>
    set((state) => ({
      selectedPhones: Array.from(new Set([...state.selectedPhones, ...phones])),
    })),

  loadingTemplateId: null,
  setLoadingTemplateId: (value: string | null) =>
    set({ loadingTemplateId: value }),

  openAccordionId: null,
  setOpenAccordionId: (value: string | null) => set({ openAccordionId: value }),

  selectedFlowType: ISelectedFlowType.SAME_DAY,
  setSelectedFlowType: (value: ISelectedFlowType | null) =>
    set({ selectedFlowType: value }),

  createEditFlow: false,
  setCreateEditFlow: (value: boolean) => set({ createEditFlow: value }),

  editFlowObject: null,
  setEditFlowObject: (value: IWhatsAppFlows | null) =>
    set({ editFlowObject: value }),

  flowBuilderOpen: false,
  setFlowBuilderOpen: (value: boolean) => set({ flowBuilderOpen: value }),

  flow: {},
  setFlow: (value: ExampleFlow) => set({ flow: value }),
}));
