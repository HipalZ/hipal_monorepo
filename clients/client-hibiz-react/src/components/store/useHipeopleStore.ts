import { create } from "zustand";
import type { Payment, SummarizedPeopleData } from "../types/businessData";

export type HiPeoplePages = "SUMMARY" | "CLIENTS" | "TARGET GROUPS" | "ACTIONS";

export type NavItems = "RECENT BILLS" | "TAGS & NOTES" | "COINZ USAGE";

export type AddToGroup =
  | "ADD TO GROUP"
  | "CREATE GROUP"
  | "CONFIRM"
  | ""
  | "ADD MORE USERS";

const today = new Date();
const startOfToday = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  0,
  0,
  0,
  0,
).getTime();
const endOfToday = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  23,
  59,
  59,
  999,
).getTime();

interface IHiPeople {
  selectedPage: HiPeoplePages;
  setSelectedPage: (page: HiPeoplePages) => void;

  addGroupPage: AddToGroup;
  setAddGroupPage: (page: AddToGroup) => void;

  selectedUserIds: string[];

  toggleUserSelection: (id: string) => void;

  selectAllUsers: (ids: string[]) => void;

  clearAllUsers: () => void;

  selectedNavItem: NavItems;
  setSelectedNavItem: (item: NavItems) => void;

  openBillPopup: boolean;
  setOpenBillPopup: (open: boolean) => void;

  singleBillData: Payment;
  setSingleBillData: (data: Payment) => void;

  singleTagData: any;
  setSingleTagData: (data: any) => void;

  openTagPopup: boolean;
  setOpenTagPopup: (open: boolean) => void;

  peopleData: SummarizedPeopleData | null;
  setPeopleData: (data: SummarizedPeopleData) => void;

  dateRange: [Date, Date];
  setDateRange: (range: [Date, Date]) => void;

  selectedOption: string;
  setSelectedOption: (option: string) => void;

  openDatePickerModal: boolean;
  setOpenDatePickerModal: (open: boolean) => void;

  dateInTimeStamp: {
    from: number;
    to: number;
  };
  setDateInTimeStamp: (range: { from: number; to: number }) => void;

  addGroupModal: boolean;
  setAddGroupModal: (open: boolean) => void;

  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;

  selectedGroupName: string;
  setSelectedGroupName: (name: string) => void;

  reset: () => void;

  formData: {
    name: string;
    description: string;
    groupColor: string;
    groupType: string;
  };

  setFormData: (key: string, value: string) => void;
}

const useHiPeopleStore = create<IHiPeople>((set, get) => ({
  selectedPage: "SUMMARY",
  setSelectedPage: (page: HiPeoplePages) => set({ selectedPage: page }),

  addGroupPage: "",
  setAddGroupPage: (page: AddToGroup) => set({ addGroupPage: page }),

  selectedUserIds: [],

  toggleUserSelection: (id: string) => {
    const selectedUserIds = get().selectedUserIds;
    if (selectedUserIds.includes(id)) {
      set({
        selectedUserIds: selectedUserIds.filter((userId) => userId !== id),
      });
    } else {
      set({ selectedUserIds: [...selectedUserIds, id] });
    }
  },

  selectAllUsers: (ids: string[]) => set({ selectedUserIds: ids }),

  clearAllUsers: () => set({ selectedUserIds: [] }),

  selectedNavItem: "RECENT BILLS",
  setSelectedNavItem: (item: NavItems) => set({ selectedNavItem: item }),

  openBillPopup: false,
  setOpenBillPopup: (open: boolean) => set({ openBillPopup: open }),

  singleBillData: {} as Payment,
  setSingleBillData: (data: Payment) => set({ singleBillData: data }),

  singleTagData: {},
  setSingleTagData: (data: any) => set({ singleTagData: data }),

  openTagPopup: false,
  setOpenTagPopup: (open: boolean) => set({ openTagPopup: open }),

  peopleData: null,
  setPeopleData: (data: SummarizedPeopleData) => set({ peopleData: data }),

  dateRange: [new Date(), new Date()],
  setDateRange: (range) => set({ dateRange: range }),

  selectedOption: "Today",
  setSelectedOption: (option: string) => set({ selectedOption: option }),

  openDatePickerModal: false,
  setOpenDatePickerModal: (open: boolean) => set({ openDatePickerModal: open }),

  dateInTimeStamp: {
    from: startOfToday,
    to: endOfToday,
  },
  setDateInTimeStamp: (range) => set({ dateInTimeStamp: range }),

  addGroupModal: false,
  setAddGroupModal: (open: boolean) => set({ addGroupModal: open }),

  selectedGroupId: "",
  setSelectedGroupId: (id: string) => set({ selectedGroupId: id }),

  selectedGroupName: "",
  setSelectedGroupName: (name: string) => set({ selectedGroupName: name }),



  formData: {
    name: "",
    description: "",
    groupColor: "#161616",
    groupType: "MANUAL",
  },
  setFormData: (key: string, value: string) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    })),
    reset: () => {
      set({
        addGroupPage: "",
        openBillPopup: false,
        addGroupModal: false,
        selectedGroupId: "",
        selectedGroupName: "",
        formData: {
          name: "",
          description: "",
          groupColor: "#161616",
          groupType: "MANUAL",
        },

      });
    },
}));

export default useHiPeopleStore;
