import { BASE_URL } from "@/configs";
import { createWithEqualityFn } from "zustand/traditional";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ICouponzLinks,
  IWhatsappHeaderType,
  WhatsAppTemplatePayload,
} from "../types/businessData";
import useBusinessData from "./useBusinessData";

export enum Step {
  SETUP = "setup",
  CREATE_EDIT = "create_edit",
  WALLET_HISTORY = "wallet_history",
  TRANSACTIONS = "transactions",
  CHATS = "chats",
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
  INTERACTIVE_FLOW = "INTERACTIVE_FLOW",
}

export enum ActionType {
  VisitWebsite = "Visit Website",
  CallUs = "Call Us",
  MarketingOptOut = "Marketing Opt Out",
  Custom = "Custom",
  Flow = "Flow",
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
  NONE = "none",
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
  userId: {
    _id: string;
    name: string;
  };
  date: number;
  status: string;
  order_id: {
    _id: string;
    total: number;
    billValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface defaultOptions {
  value: string;
  label: string;
}

export interface IMerchantDetails {
  businessId: string;
  razorpayKeyId: string;
  razorpayMerchantId: string;
}

interface whatsappTemplate {
  step: Step;
  setStep: (step: Step) => void;

  whatzAppSteps: whastappSteps;
  setWhatzAppSteps: (whatzAppSteps: whastappSteps) => void;

  templates: WhatsAppTemplatePayload[];
  setTemplates: (templates: WhatsAppTemplatePayload[]) => void;

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

  addCouponzText: (couponz: ICouponzLinks) => void;

  updateVariable: (index: number, value: string) => void;

  updateBodySequenceVariable: (index: number, value: string) => void;

  updateDisplayBodySequenceVariable: (index: number, value: string) => void;

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

  secondButtonText: string;
  setSecondButtonText: (secondButtonText: string) => void;

  buttonFooterText: string;
  setButtonFooterText: (buttonFooterText: string) => void;

  templateId: string;
  setTemplateId: (templateId: string) => void;

  setTemplateData: (data: WhatsAppTemplatePayload) => void;

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

  notEditPopup: boolean;
  setNotEditPopup: (notEditPopup: boolean) => void;

  templateSteps: TemplateSteps;
  setTemplateSteps: (templateSteps: TemplateSteps) => void;

  bodyVariableSequence: string[];
  setBodyVariableSequence: (bodyVariableSequence: string[]) => void;

  displayBodyVariableSequence: string[];
  setDisplayBodyVariableSequence: (
    displayBodyVariableSequence: string[],
  ) => void;

  showCropper: boolean;
  setShowCropper: (showCropper: boolean) => void;

  cropping: {
    image: string | null;
    type: string | null;
  };

  setCropping: (cropping: { image: string; type: string }) => void;

  imageFiles: File | null;

  setImageFiles: (imageFiles: File | null) => void;

  firstButtonEnable: boolean;
  setFirstButtonEnable: (firstButtonEnable: boolean) => void;

  secondButtonEnable: boolean;
  setSecondButtonEnable: (secondButtonEnable: boolean) => void;

  showSuccessPopup: boolean;
  setShowSuccessPopup: (showSuccessPopup: boolean) => void;

  templateAnalytics: ITemplateAnalytics[];
  setTemplateAnalytics: (analytics: ITemplateAnalytics[]) => void;

  singleTemplateAnalytics: ITemplateAnalytics;
  setSingleTemplateAnalytics: (analytic: ITemplateAnalytics) => void;

  totalData: ITotalData[];
  setTotalData: (totalData: ITotalData[]) => void;

  walletHistory: WalletTransaction[];
  setWalletHistory: (walletHistory: WalletTransaction[]) => void;

  couponzLinks: ICouponzLinks[];
  setCouponzLinks: (couponzLinks: ICouponzLinks[]) => void;

  selectedCoupon: string;
  setSelectedCoupon: (selectedCoupon: string) => void;

  confirmCreate: boolean;
  setConfirmCreate: (confirmCreate: boolean) => void;

  merchantDetails: IMerchantDetails;
  setMerchantDetails: (merchantDetails: IMerchantDetails) => void;

  showError: boolean;
  setShowError: (showError: boolean) => void;

  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;

  variableOptions: defaultOptions[];
  setVariableOptions: (variableOptions: defaultOptions[]) => void;

  isOpenEditModal: boolean;
  setIsOpenEditModal: (isOpenEditModal: boolean) => void;

  paymentSuccessFull: boolean;
  setPaymentSuccessFull: (paymentSuccessFull: boolean) => void;

  whatzappFormEnabled: boolean;
  setWhatzappFormEnabled: (value: boolean) => void;
}

export const useWhatsapp = createWithEqualityFn(
  persist<whatsappTemplate>(
    (set, get) => {
      const businessName = useBusinessData.getState().businessData?.name || "";
      useBusinessData.subscribe((state) => {
        if (state.businessData?.name) {
          set({ websiteUrl: `${BASE_URL}/${state.businessData?.name || ""}` });
        }
      });
      return {
        step: Step.SETUP,
        setStep: (step: Step) => set({ step }),

        whatzAppSteps: whastappSteps.MainForm,
        setWhatzAppSteps: (whatzAppSteps: whastappSteps) =>
          set({ whatzAppSteps }),

        templates: [],
        setTemplates: (templates: WhatsAppTemplatePayload[]) =>
          set({ templates }),

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

        addCouponzText: (couponz) => {
          set((state) => {
            const newBodyText = `${state.bodyText} ${couponz?.name} ${couponz?.link}`;
            return { bodyText: newBodyText };
          });
        },

        footerText: "Powered by Hipalz",
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
            newVariables[index] = value || "rajesh";
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

        updateDisplayBodySequenceVariable: (index: number, value: string) => {
          set((state) => {
            const newBodySequence = [...state.displayBodyVariableSequence];
            newBodySequence[index] = value;
            return {
              displayBodyVariableSequence: newBodySequence,
            };
          });
        },

        removeVariable: (index: number) => {
          set((state) => {
            const newVariables = state.bodyVariables.filter(
              (_, i) => i !== index,
            );
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

        websiteUrl: `${BASE_URL}/${businessName}`,
        setWebsiteUrl: (websiteUrl: string) => set({ websiteUrl }),

        phoneNumber: "",
        setPhoneNumber: (phoneNumber: string) => set({ phoneNumber }),

        secondButtonText: "Stop Promotions",
        setSecondButtonText: (secondButtonText: string) =>
          set({ secondButtonText }),

        buttonFooterText: "Not Interested? Tap to stop promotions",
        setButtonFooterText: (buttonFooterText: string) =>
          set({
            buttonFooterText,
          }),

        templateId: "",
        setTemplateId: (templateId: string) => set({ templateId }),

        setTemplateData: (data: any) => {
          const headerComponent = data.components.find(
            (component: IWhatsappHeaderType) => component.type === "HEADER",
          );
          const bodyComponent = data.components.find(
            (component: IWhatsappHeaderType) => component.type === "BODY",
          );
          const footerComponent = data.components.find(
            (component: IWhatsappHeaderType) => component.type === "FOOTER",
          );
          const buttonsComponent = data.components.find(
            (component: IWhatsappHeaderType) => component.type === "BUTTONS",
          );

          const variables =
            bodyComponent?.example?.body_text[0]?.map((text: string) => text) ||
            [];
          const headerImage = headerComponent?.example?.header_handle[0] || "";
          set({
            templateType: data.category,
            templateName: data.name,
            headerType: headerComponent?.format || HeaderInterface.Text,
            headerText: headerComponent?.text,
            imagePreview: headerImage || headerComponent?.imagePreview,
            bodyText: bodyComponent?.text,
            bodyVariables: variables,
            footerText: footerComponent?.text,
            actionType:
              buttonsComponent?.buttons[0]?.type === "URL"
                ? ActionType.VisitWebsite
                : buttonsComponent?.buttons[0]?.type === "PHONE_NUMBER"
                  ? ActionType.CallUs
                  : ActionType.Flow,
            buttonText: buttonsComponent?.buttons[0]?.text || "",
            urlType:
              buttonsComponent?.buttons[0]?.type === "URL"
                ? "Static"
                : undefined,
            websiteUrl: buttonsComponent?.buttons[0]?.url,
            phoneNumber: buttonsComponent?.buttons[0]?.phone_number?.replace(
              /^\+91/,
              "",
            ),
            templateId: data.id,
            templateStatus: data?.status,
            bodyVariableSequence: variables,
            firstButtonEnable: buttonsComponent?.buttons[0]?.text?.length > 0,
            secondButtonEnable: buttonsComponent?.buttons[1]?.text?.length > 0,
            displayBodyVariableSequence: variables.map(
              (variable: string) =>
                get().variableOptions.find(
                  (option) => option.label === variable,
                )?.value || variable,
            ),
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
            websiteUrl: `${BASE_URL}/${
              useBusinessData.getState().businessData?.customLink || ""
            }`,
            phoneNumber: "",
            templateId: "",
            imageFiles: null,
            cropping: {
              image: null,
              type: null,
            },
            templateStatus: "",
            imageUrl: "",
            couponzLinks: [],
          });
        },

        notifications: [
          { id: 1, message: "New template available!", isRead: false },
          { id: 2, message: "Campaign completed successfully", isRead: false },
        ],
        setNotifications: (notifications: Notification[]) =>
          set({ notifications }),

        showNotifications: false,
        setShowNotifications: (showNotifications: boolean) =>
          set({ showNotifications }),

        walletBalance: 500,
        setWalletBalance: (walletBalance: number) => set({ walletBalance }),

        notEditPopup: false,
        setNotEditPopup: (notEditPopup: boolean) => set({ notEditPopup }),

        templateSteps: TemplateSteps.SHOW_OPTIONS,
        setTemplateSteps: (templateSteps: TemplateSteps) =>
          set({ templateSteps }),

        bodyVariableSequence: [],
        setBodyVariableSequence: (bodyVariableSequence: string[]) =>
          set({ bodyVariableSequence }),

        displayBodyVariableSequence: [],
        setDisplayBodyVariableSequence: (
          displayBodyVariableSequence: string[],
        ) => set({ displayBodyVariableSequence }),

        showCropper: false,
        setShowCropper: (showCropper: boolean) => set({ showCropper }),

        cropping: {
          image: null,
          type: null,
        },

        setCropping: (cropping) => set(() => ({ cropping })),

        imageFiles: null,
        setImageFiles: (imageFile) => set({ imageFiles: imageFile }),

        firstButtonEnable: false,
        setFirstButtonEnable: (firstButtonEnable) => set({ firstButtonEnable }),

        secondButtonEnable: false,
        setSecondButtonEnable: (secondButtonEnable) =>
          set({ secondButtonEnable }),

        showSuccessPopup: false,
        setShowSuccessPopup: (showSuccessPopup: boolean) =>
          set({ showSuccessPopup }),

        templateAnalytics: [],
        setTemplateAnalytics: (analytics: ITemplateAnalytics[]) =>
          set({ templateAnalytics: analytics }),

        singleTemplateAnalytics: {},
        setSingleTemplateAnalytics: (analytic: ITemplateAnalytics) =>
          set({ singleTemplateAnalytics: analytic }),

        totalData: [],
        setTotalData: (totalData: ITotalData[]) => set({ totalData }),

        walletHistory: [],
        setWalletHistory: (walletHistory: WalletTransaction[]) =>
          set({ walletHistory }),

        couponzLinks: [],
        setCouponzLinks: (data: ICouponzLinks[]) => set({ couponzLinks: data }),

        selectedCoupon: "",
        setSelectedCoupon: (selectedCoupon: string) => set({ selectedCoupon }),

        confirmCreate: false,
        setConfirmCreate: (confirmCreate: boolean) => set({ confirmCreate }),

        merchantDetails: {
          businessId: "",
          razorpayKeyId: "",
          razorpayMerchantId: "",
        },
        setMerchantDetails: (merchantDetails: IMerchantDetails) =>
          set({ merchantDetails }),

        showError: false,
        setShowError: (showError: boolean) => set({ showError }),

        imageUrl: "",
        setImageUrl: (imageUrl: string) => set({ imageUrl }),

        variableOptions: [
          {
            label: "name",
            value: "Rajesh",
          },
          {
            label: "email",
            value: "rajesh@gmail.com",
          },
          {
            label: "businessName",
            value: businessName,
          },
          {
            label: "phone",
            value: "+913456789090",
          },
          {
            label: "address",
            value: "Bangalore",
          },
          {
            label: "time",
            value: "10:00 AM",
          },
          {
            label: "date",
            value: "31st Dec, 2024",
          },
        ],

        setVariableOptions: (variableOptions: defaultOptions[]) =>
          set({ variableOptions }),

        isOpenEditModal: false,
        setIsOpenEditModal: (isOpenEditModal: boolean) =>
          set({ isOpenEditModal }),

        paymentSuccessFull: false,
        setPaymentSuccessFull: (paymentSuccessFull: boolean) =>
          set({ paymentSuccessFull }),

        whatzappFormEnabled: false,
        setWhatzappFormEnabled: (value: boolean) =>
          set({ whatzappFormEnabled: value }),
      };
    },
    {
      name: "whatsapp-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useWhatsapp;
