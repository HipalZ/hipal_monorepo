import { CustomRole, HiClientzData } from '@/components/types/hiClientzData';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HiClientzStore {
  captainData: HiClientzData;
  setCaptainData: (value: HiClientzData) => void;
  accessToken: string;
  setAccessToken: (value: string) => void;
  refreshToken: string;
  setRefreshToken: (value: string) => void;
  selectedBiz: CustomRole;
  setSelectedBiz: (value: CustomRole) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

export const useHiClientZ = create(
  persist<HiClientzStore>(
    (set) => ({
      captainData: {} as HiClientzData,
      setCaptainData: (value) =>
        set((state) => ({
          captainData: { ...state.captainData, ...value },
        })),
      accessToken: '',
      setAccessToken: (value) => set({ accessToken: value }),
      refreshToken: '',
      setRefreshToken: (value) => set({ refreshToken: value }),
      selectedBiz: {} as CustomRole,
      setSelectedBiz: (value) => set({ selectedBiz: value }),
      phoneNumber: '',
      setPhoneNumber: (value) => set({ phoneNumber: value }),
    }),
    {
      name: 'hiClientZ-store',
      getStorage: () => localStorage,
    },
  ),
);
