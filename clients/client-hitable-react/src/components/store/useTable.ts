import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IMerge } from "../types/hiTableData";

interface ITable {
  tableData: {
    [x: string]: any;
    activeUser?: number;
    businessId?: string;
    capacity?: number;
    deliverDish?: number;
    id: string;
    hiCode?: string;
    name?: string;
    staff?: string[];
    status?: string;
    time?: string;
    totalDishQuantity?: number;
    zoneId?: string;
    edit?: boolean;
    isMerge?: boolean;
    hierarchy?: string;
    parentTableId?: string;
    parentZoneId?: string;
    mergeTables?: IMerge[];
  };
  setTableData: (data: ITable["tableData"]) => void;
}

export const useTable = create(
  persist<ITable>(
    (set) => ({
      tableData: {
        activeUser: 0,
        businessId: "",
        capacity: 0,
        deliverDish: 0,
        id: "",
        name: "",
        hiCode: "",
        staff: [],
        status: "",
        time: "",
        totalDishQuantity: 0,
        zoneId: "",
        edit: false,
        isMerge: false,
        hierarchy: '',
        parentTableId: '',
        parentZoneId: '',
        mergeTables: [],
      },
      setTableData: (data) =>
        set((prevState) => ({
          tableData: {
            ...prevState.tableData,
            ...data,
          },
        })),
    }),
    {
      name: "tableDataStorage",
    }
  )
);
