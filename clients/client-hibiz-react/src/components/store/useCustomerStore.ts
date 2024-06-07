import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '../types/businessData';

export const useStore = create(
  persist<{
    selectedCustomer: Customer | null;
    selectCustomer: (customer: Customer) => void;
  }>(
    (set) => ({
      selectedCustomer: null,
      selectCustomer: (customer) => set({ selectedCustomer: customer }),
    }),
    {
      name: 'useSelectedCustomer',
    },
  ),
);
