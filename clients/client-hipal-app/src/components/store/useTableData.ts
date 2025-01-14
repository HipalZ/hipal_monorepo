import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface HiCodeUser {
  name: string;
  phone: string;
  success: boolean;
}

type TableDataStore = {
  tableName: string;
  setTableName: (name: string) => void;

  tableNameMissing: boolean;
  setTableNameMissing: (missing: boolean) => void;

  hiCode: string;
  setHiCode: (hiCode: string) => void;
  hiCodePopup: boolean;
  setHiCodePopup: (hiCodePopup: boolean) => void;
  hiCodeUser: HiCodeUser;
  setHiCodeUser: (user: HiCodeUser) => void;

  hiCodePromptTimer: number;
  setHiCodePromptTimer: (time: number) => void;

  tableNameTimeStamp: number | null;
  setTableNameTimeStamp: (timeStamp: number | null) => void;

  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
};

const useTableData = create(
  persist<TableDataStore>(
    (set) => ({
      tableName: "",
      setTableName: (name) => set({ tableName: name }),
      tableNameMissing: false,
      setTableNameMissing: (missing) => set({ tableNameMissing: missing }),
      hiCode: "",
      setHiCode: (hiCode) => set({ hiCode }),
      hiCodePopup: false,
      setHiCodePopup: (hiCodePopup) => set({ hiCodePopup }),
      hiCodeUser: { name: "", phone: "", success: false },
      setHiCodeUser: (user) => set({ hiCodeUser: user }),

      hiCodePromptTimer: 0,
      setHiCodePromptTimer: (time) => set({ hiCodePromptTimer: time }),

      tableNameTimeStamp: null,
      setTableNameTimeStamp: (timeStamp) =>
        set({ tableNameTimeStamp: timeStamp }),

      isVisible: false,
      setIsVisible: (visible: boolean) => set(() => ({ isVisible: visible })),
    }),
    {
      name: "table-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useTableData;
export const resetTableData = () => {
  useTableData.setState({
    tableName: "",
    hiCode: "",
    hiCodePopup: false,
    hiCodeUser: { name: "", phone: "", success: false },
    hiCodePromptTimer: 0,
    tableNameTimeStamp: null,
  });
};
