import { create } from "zustand";
import { toast } from "react-hot-toast";

interface Group {
  id: string;
  name: string;
  memberCount: number;
}

interface MessageRecipientsState {
  selectedOptions: string[];
  selectedGroups: string[];
  customerPhone: string;
  totalAvailableCustomers: number;
  groups: Group[];
  uploadedFileName: string | null;
  handleOptionChange: (option: string) => void;
  handleGroupToggle: (groupId: string) => void;
  setCustomerPhone: (phone: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
}

export const useMessageRecipientsStore = create<MessageRecipientsState>(
  (set) => ({
    selectedOptions: [],
    selectedGroups: [],
    customerPhone: "",
    totalAvailableCustomers: 1234,
    groups: [
      { id: "1", name: "Regular Customers", memberCount: 150 },
      { id: "2", name: "VIP Members", memberCount: 50 },
      { id: "3", name: "New Customers", memberCount: 75 },
      { id: "4", name: "Loyalty Program", memberCount: 200 },
    ],
    uploadedFileName: null,
    handleOptionChange: (option) => {
      set((state) => {
        const isSelected = state.selectedOptions.includes(option);
        const newSelection = isSelected
          ? state.selectedOptions.filter((item) => item !== option)
          : [...state.selectedOptions, option];

        if (newSelection.length > 2) {
          toast.error("You can select only 2 options at a time.");
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
          toast.error("You can select only 2 groups at a time.");
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
    handleFileUpload: (event) => {
      const file = event.target.files?.[0];
      if (file) {
        set({ uploadedFileName: file.name });
        toast.success(`${file.name} has been successfully uploaded.`);
      }
    },
    handleRemoveFile: () => set({ uploadedFileName: null }),
  }),
);
