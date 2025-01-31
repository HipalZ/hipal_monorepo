import { create } from "zustand";
export interface ISettleMode {
  _id: string;
  name: string;
  amount: number;
}

interface IDues {
  isUserAdded: boolean;
  setIsUserAdded: (value: boolean) => void;

  settleModes: ISettleMode[];
  setSettleModes: (modes: ISettleMode[]) => void;
  addSettleMode: (mode: ISettleMode) => void;
  updateSettleMode: (mode: ISettleMode) => void;
  removeSettleMode: (modeId: string) => void;
}

export const useDues = create<IDues>((set, get) => ({
  isUserAdded: false,
  setIsUserAdded: (value: boolean) => set({ isUserAdded: value }),

  settleModes: [],
  setSettleModes: (modes) => set({ settleModes: modes }),

  addSettleMode: (mode) => {
    const existing = get().settleModes.find((m) => m._id === mode._id);
    if (!existing) {
      set({ settleModes: [...get().settleModes, mode] });
    }
  },

  updateSettleMode: (newMode) => {
    const updated = get().settleModes.map((m) =>
      m._id === newMode._id ? { ...m, amount: newMode.amount } : m,
    );
    set({ settleModes: updated });
  },

  removeSettleMode: (modeId) => {
    set({
      settleModes: get().settleModes.filter((m) => m._id !== modeId),
    });
  },
}));
