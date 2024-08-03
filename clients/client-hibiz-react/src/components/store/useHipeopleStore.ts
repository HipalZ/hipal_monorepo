import { create } from "zustand";
import type { Payment } from "../types/businessData";

export type HiPeoplePages = "SUMMARY" | "CLIENTS" | "TARGET GROUPS" | "ACTIONS";

export type NavItems = "RECENT BILLS" | "TAGS & NOTES" | "COINZ USAGE";

interface IHiPeople {
  selectedPage: HiPeoplePages;
  setSelectedPage: (page: HiPeoplePages) => void;

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
}

const useHiPeopleStore = create<IHiPeople>((set,get) => ({
  selectedPage: "SUMMARY",
  setSelectedPage: (page: HiPeoplePages) => set({ selectedPage: page }),

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
}));


export default useHiPeopleStore;
