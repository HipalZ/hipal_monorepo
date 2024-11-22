import { create } from "zustand";

export enum Tabs {
  TEMPLATES = "templates",
  CAMPAIGNS = "campaigns",
}
interface ITempStore {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  activeTab: Tabs;
  setActiveTab: (activeTab: Tabs) => void;
}

export const useWhatsappTempStore = create<ITempStore>((set) => ({
  isLoading: false,
  setIsLoading: (value: boolean) => set({ isLoading: value }),

  activeTab: Tabs.TEMPLATES,
  setActiveTab: (activeTab: Tabs) => set({ activeTab }),
}));
