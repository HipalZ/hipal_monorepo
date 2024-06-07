import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsData = create(
	persist<{
		settingsData: any;
		setSettingsData: (data: any) => void;
	}>(
		(set) => ({
			settingsData: null,
			setSettingsData: (data) => set({ settingsData: data }),
		}),
		{
			name: "useSettingsData",
		},
	),
);
