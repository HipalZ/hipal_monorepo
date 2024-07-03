import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useSelectedIcon = create(
  persist<{
    selectedIcon: string;
    setSelectedIcon: (text: string) => void;
    selectedSubIcon: string;
    setSelectedSubIcon: (text: string) => void;
  }>(
    (set) => ({
      selectedIcon: 'Home',
      setSelectedIcon: (text: string) => set({ selectedIcon: text }),
      selectedSubIcon: '',
      setSelectedSubIcon: (text: string) => set({ selectedSubIcon: text }),
    }),
    {
      name: 'useSelectedIcon',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
