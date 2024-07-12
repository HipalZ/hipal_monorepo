import { create } from "zustand";

export type SettingPageTypes = "OUTLET_FORM" | "BUSINESS_FORM" | "MAIN";

interface ISettingsForm {
  pageToggle: SettingPageTypes;
  setPageToggle: (value: SettingPageTypes) => void;
}

export const useSettings = create<ISettingsForm>((set) => ({
  pageToggle: "MAIN",
  setPageToggle: (value: SettingPageTypes) => set({ pageToggle: value }),
}));
