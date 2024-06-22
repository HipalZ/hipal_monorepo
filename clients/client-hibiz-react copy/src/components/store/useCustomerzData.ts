import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface customerzStore {
  customerzName: string;
  customerzPhone: string;
  setCustomerzName: (customerzName: string) => void;
  setCustomerzPhone: (customerzPhone: string) => void;
}

export const useCustomerzData = create(
  persist<customerzStore>(
    (set) => ({
      customerzName: '',
      customerzPhone: '',
      setCustomerzPhone: (customerzPhone: string) =>
        set(() => ({
          customerzPhone,
        })),
      setCustomerzName: (customerzName: string) =>
        set(() => ({
          customerzName,
        })),
    }),
    {
      name: 'useCustomerzData',
      getStorage: () => localStorage,
    },
  ),
);
