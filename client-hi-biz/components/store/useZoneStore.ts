import { create } from 'zustand'
import type { IDineIn, ITables } from '../types/businessData'
export type IData = {
    data: IDineIn,
    setData: (data: Partial<IDineIn>) => void;
    addTable: (tableData: ITables) => void;
    editTable: (tableData: ITables) => void;
}
export const useZoneStore = create<IData>((set) => ({
    data: {
        tables: [],
        zones: [],
        staff: [],
        charges: [],
        categories: []
    },
    setData: (newData) => set((state) => ({
        data: { ...state.data, ...newData }
    })),
    addTable: (tableData) => set((state) => {
        const updatedTables = [...state.data.tables, tableData];

        const updatedZones = state?.data?.zones.map((zone) => {
            if (zone._id === tableData.zoneId) {
                const updatedZoneTables = zone.tables ? [...zone.tables, tableData._id] : [tableData._id];
                return { ...zone, tables: updatedZoneTables };
            }
            return zone;
        });

        return {
            data: {
                ...state.data,
                tables: updatedTables,
                zones: updatedZones
            }
        };
    }),
    editTable: (tableData) => set((state) => {
        const updatedTables = state?.data?.tables.map(table => {
            if (table._id === tableData._id) {
                return { ...table, ...tableData };
            }
            return table;
        });

        return {
            data: {
                ...state.data,
                tables: updatedTables
            }
        };
    }),

}));
