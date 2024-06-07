// store.ts
import { create } from 'zustand';
import type { IStatus } from '../types/hiTableData';

interface BillStore {
  billData: IStatus[];
  setBillData: (data: IStatus[]) => void;
}

export const useBillStore = create<BillStore>((set) => ({
  billData: [],
  setBillData: (data: IStatus[]) => set({ billData: data }),
}));
