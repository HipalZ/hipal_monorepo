import {create} from 'zustand';
import { persist } from 'zustand/middleware';

type TableDataStore = {
    tableName: string;
    setTableName: (name: string) => void;
};

const useTableData = create(
    persist<TableDataStore>(
        (set) => ({
            tableName: '',
            setTableName: (name) => set({ tableName: name }),
        }),
        {
            name: 'table-store',
        }
    )
);

export default useTableData;