// stores/kitchenStore.js
import { create } from "zustand";
import { IStaffs } from "../types/businessData";

type KitchenState = {
  kitchenName: string;
  selectedStaff: IStaffs[];
  selectStaff: (staff: IStaffs) => void;
  deselectStaff: (staffId: string) => void;
  setKitchenName: (name: string) => void;
  initializeKitchen: (kitchenName: string, selectedStaff: IStaffs[]) => void;
  reset: () => void;
};

const useKitchenStore = create<KitchenState>((set) => ({
  selectedStaff: [],
  kitchenName: "",
  setKitchenName: (name: string) => set({ kitchenName: name }),
  selectStaff: (staff) =>
    set((state) => ({ selectedStaff: [...state.selectedStaff, staff] })),
  deselectStaff: (staffId) =>
    set((state) => ({
      selectedStaff: state.selectedStaff.filter((s) => s.id !== staffId),
    })),
  initializeKitchen: (kitchenName, selectedStaff) =>
    set({ kitchenName, selectedStaff }),
  reset: () => set({ selectedStaff: [], kitchenName: "" }),
}));

export default useKitchenStore;
