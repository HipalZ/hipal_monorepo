import { create } from "zustand";
import useBusinessData from "./useBusinessData";

export enum Step {
  SETUP = "setup",
  CREATE_EDIT = "create_edit",
  SUBMIT = "submit",
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
  AUTOMATION = "automation",
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
        const newVariables = [...state.bodyVariables, ""];
        const newBodyText = `${state.bodyText} {{${newVariables.length}}} `;
        return { bodyVariables: newVariables, bodyText: newBodyText };
      });
    },

    updateVariable: (index: number, value: string) => {
      set((state) => {
        const newVariables = [...state.bodyVariables];
        const newBodySequence = [...state.bodyVariableSequence];
        newVariables[index] = value;
        newBodySequence[index] = value;
        return {
          bodyVariables: newVariables,
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

    buttonText: "",
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
      });
    },

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
        actionType: ActionType.VisitWebsite,
        buttonText: "",
        urlType: "Static",
        websiteUrl: `https://hipalz.com/${
          useBusinessData.getState().businessData?.name || ""
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
  };
});

export default useWhatsapp;
