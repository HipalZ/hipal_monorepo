import { create } from "zustand";
import useBusinessData from "./useBusinessData";
import type { WhatsAppTemplatePayload } from "../types/businessData";

export enum Step {
  SETUP = "setup",
  CREATE_EDIT = "create_edit",
  WALLET_HISTORY = "wallet_history",
}

export enum HeaderInterface {
  None = "NONE",
  Text = "TEXT",
  Image = "IMAGE",
  Video = "VIDEO",
  Document = "DOCUMENT",
}

export enum TemplateType {
  Marketing = "MARKETING",
  Utility = "UTILITY",
}

export enum ActionType {
  VisitWebsite = "Visit Website",
  CallUs = "Call Us",
}

export enum whastappSteps {
  MainForm = "MainForm",
  TemplateForm = "TemplateForm",
  ManageCampaign = "ManageCampaign",
  Automation = "Automation",
  Events = "Events",
  Loyalty = "Loyalty",
  Couponz = "Couponz",
  Qrs = "Qrs",
}

export enum TemplateSteps {
  CREATE_EDIT = "create_edit",
  MODIFY = "modify",
  SHOW_OPTIONS = "showOptions",
  SEND = "send",
}

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
}

export enum Tabs {
  TEMPLATES = "templates",
  CAMPAIGNS = "campaigns",
}

export interface ITotalData {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
}

export interface ITemplateAnalytics {
  templateName: string;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  cost: number;
}

export interface WalletTransaction {
  _id: string;
  businessId: string;
  userId: string;
  amount: number;
  discount: number;
  date: number;
  createdAt: string;
  updatedAt: string;
}

interface whatsappTemplate {
  step: Step;
  setStep: (step: Step) => void;

  whatzAppSteps: whastappSteps;
  setWhatzAppSteps: (whatzAppSteps: whastappSteps) => void;

  templates: any[];
  setTemplates: (templates: any) => void;

  templateType: string;
  setTemplateType: (templateType: string) => void;

  templateName: string;
  setTemplateName: (templateName: string) => void;

  language: string;
  setLanguage: (language: string) => void;

  headerType: HeaderInterface;
  setHeaderType: (headerType: HeaderInterface) => void;

  headerText: string;
  setHeaderText: (headerText: string) => void;

  imagePreview: string;
  setImagePreview: (imagePreview: string) => void;

  videoPreview: string;
  setVideoPreview: (preview: string) => void;

  bodyText: string;
  setBodyText: (bodyText: string) => void;

  footerText: string;
  setFooterText: (footerText: string) => void;

  headerVariables: string[];
  setHeaderVariables: (variables: string[]) => void;

  bodyVariables: string[];
  setBodyVariables: (variables: string[]) => void;

  addVariable: () => void;

  updateVariable: (index: number, value: string) => void;

  updateBodySequenceVariable: (index: number, value: string) => void;

  removeVariable: (index: number) => void;

  actionType: string;
  setActionType: (actionType: string) => void;

  buttonText: string;
  setButtonText: (buttonText: string) => void;

  urlType: string;
  setUrlType: (urlType: string) => void;

  websiteUrl: string;
  setWebsiteUrl: (websiteUrl: string) => void;

  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;

  templateId: string;
  setTemplateId: (templateId: string) => void;

  setTemplateData: (data: any) => void;

  templateStatus: string;
  setTemplateStatus: (status: string) => void;

  resetTemplateData: () => void;

  // revised whatsapp
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;

  showNotifications: boolean;
  setShowNotifications: (showNotifications: boolean) => void;

  walletBalance: number;
  setWalletBalance: (walletBalance: number) => void;

  activeTab: Tabs;
  setActiveTab: (activeTab: Tabs) => void;

  notEditPopup: boolean;
  setNotEditPopup: (notEditPopup: boolean) => void;

  templateSteps: TemplateSteps;
  setTemplateSteps: (templateSteps: TemplateSteps) => void;

  bodyVariableSequence: string[];
  setBodyVariableSequence: (bodyVariableSequence: string[]) => void;

  preDefinedTemplate: boolean;
  setPreDefinedTemplate: (modifyTemplate: boolean) => void;

  showCropper: boolean;
  setShowCropper: (showCropper: boolean) => void;

  cropping: {
    image: any;
    type: string;
  };

  setCropping: (cropping: { image: any; type: string }) => void;

  imageFiles: File | null;

  setImageFiles: (imageFiles: File | null) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  allTemplates: WhatsAppTemplatePayload[];
  setAllTemplates: (allTemplates: WhatsAppTemplatePayload[]) => void;

  isButtonEnabled: boolean;
  setIsButtonEnabled: (isButtonEnabled: boolean) => void;

  showSuccessPopup: boolean;
  setShowSuccessPopup: (showSuccessPopup: boolean) => void;

  templateAnalytics: ITemplateAnalytics[];
  setTemplateAnalytics: (analytics: ITemplateAnalytics[]) => void;

  totalData: ITotalData[];
  setTotalData: (totalData: ITotalData) => void;

  walletHistory: WalletTransaction[];
  setWalletHistory: (walletHistory: WalletTransaction[]) => void;
}

export const useWhatsapp = create<whatsappTemplate>((set) => {
  const businessName = useBusinessData.getState().businessData?.name || "";
  return {
    step: Step.SETUP,
    setStep: (step: Step) => set({ step }),

    whatzAppSteps: whastappSteps.MainForm,
    setWhatzAppSteps: (whatzAppSteps: whastappSteps) => set({ whatzAppSteps }),

    templates: [],
    setTemplates: (templates: any) => set({ templates }),

    templateType: TemplateType?.Marketing,
    setTemplateType: (templateType: string) => set({ templateType }),

    templateName: "",
    setTemplateName: (templateName: string) => set({ templateName }),

    language: "en_US",
    setLanguage: (language: string) => set({ language }),

    headerType: HeaderInterface.Image,
    setHeaderType: (headerType: HeaderInterface) => set({ headerType }),

    headerText: "",
    setHeaderText: (headerText: string) => set({ headerText }),

    imagePreview: "",
    setImagePreview: (imagePreview: string) => set({ imagePreview }),

    videoPreview: "",
    setVideoPreview: (preview: string) => set({ videoPreview: preview }),

    bodyText: "Write your content here...",
    setBodyText: (bodyText: string) => set({ bodyText }),

    footerText: `Powered by ${businessName}`,
    setFooterText: (footerText: string) => set({ footerText }),

    headerVariables: [],
    setHeaderVariables: (variables: string[]) =>
      set({ headerVariables: variables }),

    bodyVariables: [],
    setBodyVariables: (variables: string[]) =>
      set({ bodyVariables: variables }),

    addVariable: () => {
      set((state) => {
        if (state.bodyVariables.length >= 5) {
          return state;
        }
        const newVariables = [...state.bodyVariables, ""];
        const newBodyText = `${state.bodyText} {{${newVariables.length}}} `;
        return { bodyVariables: newVariables, bodyText: newBodyText };
      });
    },

    updateVariable: (index: number, value: string) => {
      set((state) => {
        const newVariables = [...state.bodyVariables];
        newVariables[index] = value;
        return {
          bodyVariables: newVariables,
        };
      });
    },

    updateBodySequenceVariable: (index: number, value: string) => {
      set((state) => {
        const newBodySequence = [...state.bodyVariableSequence];
        newBodySequence[index] = value;
        return {
          bodyVariableSequence: newBodySequence,
        };
      });
    },

    removeVariable: (index: number) => {
      set((state) => {
        const newVariables = state.bodyVariables.filter((_, i) => i !== index);
        const newBodyText = state.bodyText.replace(`{{${index + 1}}}`, "");
        return { bodyVariables: newVariables, bodyText: newBodyText };
      });
    },

    actionType: ActionType.VisitWebsite,
    setActionType: (actionType: string) => set({ actionType }),

    buttonText: "Visit US",
    setButtonText: (buttonText: string) => set({ buttonText }),

    urlType: "Static",
    setUrlType: (urlType: string) => set({ urlType }),

    websiteUrl: `https://hipalz.com/${businessName}`,
    setWebsiteUrl: (websiteUrl: string) => set({ websiteUrl }),

    phoneNumber: "",
    setPhoneNumber: (phoneNumber: string) => set({ phoneNumber }),

    templateId: "",
    setTemplateId: (templateId: string) => set({ templateId }),

    setTemplateData: (data: any) => {
      const headerComponent = data.components.find(
        (component: any) => component.type === "HEADER",
      );
      const bodyComponent = data.components.find(
        (component: any) => component.type === "BODY",
      );
      const footerComponent = data.components.find(
        (component: any) => component.type === "FOOTER",
      );
      const buttonsComponent = data.components.find(
        (component: any) => component.type === "BUTTONS",
      );
      const variables =
        bodyComponent?.example?.body_text[0]?.map((text: string) => text) || [];
      const headerImage = headerComponent?.example?.header_handle[0];
      set({
        templateType: data.category,
        templateName: data.name,
        headerType: headerComponent?.format,
        headerText: headerComponent?.text,
        imagePreview: headerImage || headerComponent?.imagePreview,
        bodyText: bodyComponent?.text,
        bodyVariables: variables,
        footerText: footerComponent?.text,
        actionType:
          buttonsComponent?.buttons[0]?.type === "URL"
            ? ActionType.VisitWebsite
            : ActionType.CallUs,
        buttonText: buttonsComponent?.buttons[0]?.text,
        urlType:
          buttonsComponent?.buttons[0]?.type === "URL" ? "Static" : undefined,
        websiteUrl: buttonsComponent?.buttons[0]?.url,
        phoneNumber: buttonsComponent?.buttons[0]?.phone_number?.replace(
          /^\+91/,
          "",
        ),
        templateId: data.id,
        templateStatus: data?.status,
      });
    },

    templateStatus: "",
    setTemplateStatus: (status: string) => set({ templateStatus: status }),

    resetTemplateData: () => {
      set({
        step: Step.SETUP,
        templateType: TemplateType.Marketing,
        templateName: "",
        headerType: HeaderInterface.Text,
        headerText: "Hello",
        imagePreview: "",
        bodyText: "",
        footerText: "",
        bodyVariables: [],
        bodyVariableSequence: [],
        actionType: ActionType.VisitWebsite,
        buttonText: "",
        urlType: "Static",
        websiteUrl: `https://hipal-test.hipalz.com/${
          useBusinessData.getState().businessData?.customLink || ""
        }`,
        phoneNumber: "",
        templateId: "",
      });
    },

    notifications: [
      { id: 1, message: "New template available!", isRead: false },
      { id: 2, message: "Campaign completed successfully", isRead: false },
    ],
    setNotifications: (notifications: Notification[]) => set({ notifications }),

    showNotifications: false,
    setShowNotifications: (showNotifications: boolean) =>
      set({ showNotifications }),

    walletBalance: 500,
    setWalletBalance: (walletBalance: number) => set({ walletBalance }),

    activeTab: Tabs.TEMPLATES,
    setActiveTab: (activeTab: Tabs) => set({ activeTab }),

    notEditPopup: false,
    setNotEditPopup: (notEditPopup: boolean) => set({ notEditPopup }),

    templateSteps: TemplateSteps.SHOW_OPTIONS,
    setTemplateSteps: (templateSteps: TemplateSteps) => set({ templateSteps }),

    bodyVariableSequence: [],
    setBodyVariableSequence: (bodyVariableSequence: string[]) =>
      set({ bodyVariableSequence }),

    preDefinedTemplate: false,
    setPreDefinedTemplate: (modifyTemplate: boolean) =>
      set({ preDefinedTemplate: modifyTemplate }),

    showCropper: false,
    setShowCropper: (showCropper: boolean) => set({ showCropper }),

    cropping: {
      image: null,
      type: null,
    },

    setCropping: (cropping) => set(() => ({ cropping })),

    imageFiles: null,
    setImageFiles: (imageFile) => set({ imageFiles: imageFile }),

    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),

    allTemplates: [],
    setAllTemplates: (allTemplates: WhatsAppTemplatePayload[]) =>
      set({ allTemplates }),

    isButtonEnabled: false,
    setIsButtonEnabled: (isButtonEnabled) => set({ isButtonEnabled }),

    showSuccessPopup: false,
    setShowSuccessPopup: (showSuccessPopup: boolean) =>
      set({ showSuccessPopup }),

    templateAnalytics: [],
    setTemplateAnalytics: (analytics: ITemplateAnalytics[]) =>
      set({ templateAnalytics: analytics }),

    totalData: [],
    setTotalData: (totalData: ITotalData[]) => set({ totalData }),

    walletHistory: [],
    setWalletHistory: (walletHistory: WalletTransaction[]) =>
      set({ walletHistory }),
  };
});

export default useWhatsapp;
