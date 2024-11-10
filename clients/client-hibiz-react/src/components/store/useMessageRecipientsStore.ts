import { create } from "zustand";
import { toast } from "react-hot-toast";

interface Group {
  _id: string;
  userIds: string[];
  id: string;
  name: string;
  memberCount: number;
}

interface BulkCustomer {
  name: string;
  phone: string;
}

interface MessageRecipientsState {
  selectedOptions: string[];
  selectedGroups: string[];
  customerPhone: string;
  totalAvailableCustomers: number;
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
}

export const useMessageRecipientsStore = create<MessageRecipientsState>(
  (set) => ({
    selectedOptions: [],
    selectedGroups: [],
    customerPhone: "",
    totalAvailableCustomers: 1234,
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
          : [...state.selectedOptions, option];

        if (newSelection.length > 2) {
          toast.error("You can select only 2 option at a time.");
          return state;
        }

        return { selectedOptions: newSelection };
      });
    },
    handleGroupToggle: (groupId) => {
      set((state) => {
        const isSelected = state.selectedGroups.includes(groupId);
        const newSelection = isSelected
          ? state.selectedGroups.filter((id) => id !== groupId)
          : [...state.selectedGroups, groupId];

        if (newSelection.length > 2) {
          toast.error("You can select only 2 groups at a timez.");
          return state;
        }

        const newTotal = newSelection.reduce((sum, id) => {
          const group = state.groups.find((g) => g.id === id);
          return sum + (group?.memberCount || 0);
        }, 0);

        let newSelectedOptions = [...state.selectedOptions];
        if (
          newSelection.length > 0 &&
          !newSelectedOptions.includes("addGroups")
        ) {
          newSelectedOptions.push("addGroups");
        } else if (newSelection.length === 0) {
          newSelectedOptions = newSelectedOptions.filter(
            (item) => item !== "addGroups",
          );
        }

        return {
          selectedGroups: newSelection,
          totalCustomers: newTotal,
          selectedOptions: newSelectedOptions,
        };
      });
    },
    setCustomerPhone: (phone) => set({ customerPhone: phone }),
    handleFileUpload: (file) => {
      set({ uploadedFileName: file.name });
      toast.success(`${file.name} has been successfully uploaded.`);
    },
    handleRemoveFile: () => set({ uploadedFileName: null, bulkCustomers: [] }),
    setBulkCustomers: (customers) => {
      set((state) => {
        const newSelectedOptions = [...state.selectedOptions];
        if (!newSelectedOptions.includes("bulkUploadCustomers")) {
          newSelectedOptions.push("bulkUploadCustomers");
        }
        return {
          bulkCustomers: customers,
          selectedOptions: newSelectedOptions,
          totalAvailableCustomers:
            state.totalAvailableCustomers + customers.length,
        };
      });
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
  }),
);
