import type {
  CustomRole,
  HiClientzData,
} from "@/components/types/hiClientzData";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HiClientzStore {
  captainData: HiClientzData;
  setCaptainData: (value: HiClientzData) => void;
  selectedBiz: CustomRole;
  setSelectedBiz: (value: CustomRole) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;

  pushToken: string;
  setPushToken: (value: string) => void;

  notification: boolean;
  setNotification: (value: boolean) => void;

  platform: string;
  setPlatform: (platform: string) => void;
}

export const useHiClientZ = create(
  persist<HiClientzStore>(
    (set) => ({
      captainData: {} as HiClientzData,
      setCaptainData: (value) =>
        set((state) => ({
          captainData: { ...state.captainData, ...value },
        })),
      selectedBiz: {} as CustomRole,
      setSelectedBiz: (value) => set({ selectedBiz: value }),
      phoneNumber: "",
      setPhoneNumber: (value) => set({ phoneNumber: value }),

      pushToken: "",
      setPushToken: (value) => set({ pushToken: value }),

      notification: true,
      setNotification: (value) => set({ notification: value }),

      platform: "web",
      setPlatform: (value: string) => set({ platform: value }),
    }),
    {
      name: "hiClientZ-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
