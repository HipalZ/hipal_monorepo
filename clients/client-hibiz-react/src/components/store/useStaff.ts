import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type State = {
  selectedStaff: string;
  setSelectedStaff: (text: string) => void;
  selectedWaiter: string;
  setSelectedWaiter: (text: string) => void;
};

export const useStaff = create(
  persist<State>(
    (set) => ({
      selectedStaff: '',
      setSelectedStaff: (text: string) => set({ selectedStaff: text }),
      selectedWaiter: '',
      setSelectedWaiter: (text: string) => set({ selectedWaiter: text }),
    }),
    {
      name: 'useStaff',
    },
  ),
);
