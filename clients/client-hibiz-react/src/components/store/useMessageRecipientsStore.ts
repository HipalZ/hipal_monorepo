import { create } from "zustand";
import { toast } from "react-hot-toast";
import { persist, createJSONStorage } from "zustand/middleware";
import useWhatsapp from "./useWhatsapp";

interface Group {
  _id: string;
  userIds: string[];
  name: string;
  memberCount: number;
}

interface BulkCustomer {
  name: string;
  phone: string;
}

export enum ShowOptions {
  ALL_CUSTOMERS = "allCustomers",
  ADD_GROUPS = "addGroups",
  BULK_UPLOAD_CUSTOMERS = "bulkUploadCustomers",
}

interface MessageRecipientsState {
  selectedOptions: string[];
  selectedGroups: string[];
  customerPhone: string;
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  uploadedFileName: string | null;
  setUploadedFileName: (name: string) => void;
  bulkCustomers: BulkCustomer[];
  handleOptionChange: (option: string) => void;
  handleGroupToggle: (groupId: string) => void;
  setCustomerPhone: (phone: string) => void;
  handleFileUpload: (file: File) => void;
  handleRemoveFile: () => void;
  setBulkCustomers: (customers: BulkCustomer[]) => void;
  sendLaterTime: number;
  setSendLaterTime: (time: number) => void;
  sendOptions: string;
  setSendOptions: (options: string) => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
  scheduledDate: string;
  setScheduledDate: (date: string) => void;
  testNumber: string;
  setTestNumber: (number: string) => void;
  clearMessageRecipientsStore: () => void;
}

export const useMessageRecipientsStore = create<MessageRecipientsState>()(
  persist(
    (set) => ({
      selectedOptions: [],
      selectedGroups: [],
      customerPhone: "",
      groups: [],
      setGroups: (groups) => set({ groups }),
      uploadedFileName: null,
      setUploadedFileName: (name) => set({ uploadedFileName: name }),
      bulkCustomers: [],
      handleOptionChange: (option) => {
        set((state) => {
          const isSelected = state.selectedOptions.includes(option);
          const newSelection = isSelected
            ? state.selectedOptions.filter((item) => item !== option)
            : [option];
          return { selectedOptions: newSelection };
        });
      },
      handleGroupToggle: (groupId) => {
        const walletBalance = useWhatsapp.getState().walletBalance;
        const templateType = useWhatsapp.getState().templateType;
        const typeAmount = templateType === "MARKETING" ? 0.9 : 0.2;
        set((state) => {
          const isSelected = state.selectedGroups.includes(groupId);
          const newSelection = isSelected
            ? state.selectedGroups.filter((id) => id !== groupId)
            : [...state.selectedGroups, groupId];

          if (newSelection.length > 2) {
            toast.error("You can select only 2 groups at a time.");
            return state;
          }

          const count = newSelection.reduce((sum, id) => {
            const group = state.groups.find((g) => g._id === id);
            return sum + (group?.userIds?.length || 0);
          }, 0);
          if (count > 0 && walletBalance < count * typeAmount) {
            toast(
              `You need at least ${
                count * typeAmount
              } credits to send to ${count} customers`,
            );
          }

          return {
            selectedGroups: newSelection,
          };
        });
      },
      setCustomerPhone: (phone) => set({ customerPhone: phone }),
      handleFileUpload: (file) => {
        set({ uploadedFileName: file.name });
        toast.success(`${file.name} has been successfully uploaded.`);
      },
      handleRemoveFile: () =>
        set({ uploadedFileName: null, bulkCustomers: [] }),
      setBulkCustomers: (customers) => {
        const walletBalance = useWhatsapp.getState().walletBalance;
        const templateType = useWhatsapp.getState().templateType;
        const typeAmount = templateType === "MARKETING" ? 0.9 : 0.2;
        set((state) => {
          const newSelectedOptions = [...state.selectedOptions];
          if (!newSelectedOptions.includes(ShowOptions.BULK_UPLOAD_CUSTOMERS)) {
            newSelectedOptions.push(ShowOptions.BULK_UPLOAD_CUSTOMERS);
          }
          return {
            bulkCustomers: customers,
            selectedOptions: newSelectedOptions,
          };
        });
        if (
          customers?.length &&
          walletBalance < customers.length * typeAmount
        ) {
          toast(
            `You need at least ${
              customers.length * typeAmount
            } credits to send to ${customers.length} customers`,
          );
        }
        toast.success(
          `${customers.length} customers have been added to bulk upload.`,
        );
      },

      sendLaterTime: 0,
      setSendLaterTime: (time) => set({ sendLaterTime: time }),

      sendOptions: "sendNow",
      setSendOptions: (options) => set({ sendOptions: options }),

      scheduledTime: "",
      setScheduledTime: (time) => set({ scheduledTime: time }),

      scheduledDate: "",
      setScheduledDate: (date) => set({ scheduledDate: date }),

      testNumber: "",
      setTestNumber: (number) => set({ testNumber: number }),

      clearMessageRecipientsStore: () =>
        set({
          selectedOptions: [],
          selectedGroups: [],
          customerPhone: "",
          groups: [],
          uploadedFileName: null,
          bulkCustomers: [],
          sendLaterTime: 0,
          sendOptions: "sendNow",
          scheduledTime: "",
          scheduledDate: "",
          testNumber: "",
        }),
    }),
    {
      name: "message-recipients-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
