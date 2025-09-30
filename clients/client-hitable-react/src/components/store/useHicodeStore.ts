import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface TableCode {
  tableId: string;
  name: string;
  hiCode: string;
}

interface TableCodeStore {
  codes: TableCode[];
  addOrUpdateCode: (code: TableCode) => void;
  removeCode: (tableId: string) => void;
  clearCodes: () => void;
}

export const useTableCodeStore = create<TableCodeStore>()(
  persist(
    (set) => ({
      codes: [],

      addOrUpdateCode: (newCode) =>
        set((state) => {
          const existingIndex = state.codes.findIndex(
            (c) => c.tableId === newCode.tableId,
          );

          if (existingIndex >= 0) {
            // Update existing table if hiCode or name changed
            const updated = [...state.codes];
            updated[existingIndex] = {
              ...updated[existingIndex],
              name: newCode.name,
              hiCode: newCode.hiCode,
            };
            return { codes: updated };
          }

          // Otherwise, add new entry
          return { codes: [...state.codes, newCode] };
        }),

      removeCode: (tableId) =>
        set((state) => ({
          codes: state.codes.filter((c) => c.tableId !== tableId),
        })),

      clearCodes: () => set({ codes: [] }),
    }),
    {
      name: "table-code-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
