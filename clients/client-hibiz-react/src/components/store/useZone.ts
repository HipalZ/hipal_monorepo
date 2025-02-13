import { create } from "zustand"
import type { UserProfile } from "../types/businessData";

export type link = "table" | "user" | "zone" | "coupon" | ""

export interface IZone {
    _id?: string;
    name: string;
    businessId: string;
    active: boolean;
    couponIds: string[];
    isDeleted: boolean;
    rank: number;
    staffIds: string[];
    tableIds: string[];
    taxes: number;
    visibility: boolean;
}

export interface ITable {
    _id?: string;
    name: string;
    internalZoneId: string;
    businessId: string;
    active: boolean;
    capacity: number;
    isDeleted?: boolean;
    rank?: number;
    staffIds: string[];
    taxes?: number;
    visibility?: boolean;
    status?: string;
}

interface ZoneStore {

    createZoneModal: boolean;
    setCreateZoneModal: (value: boolean) => void;

    showZoneDetails: boolean;
    setShowZoneDetails: (value: boolean) => void;

    saveZoneDetails: IZone | null;
    setSaveZoneDetails: (value: IZone | null) => void;

    createTableModal: boolean;
    setCreateTableModal: (value: boolean) => void;

    bulkCreateTableModal: boolean;
    setBulkCreateTableModal: (value: boolean) => void;

    linkModal: boolean;
    setLinkModal: (value: boolean) => void;

    linkModalType: link;
    setLinkModalType: (value: link) => void;

    editZoneId: string | null;
    setEditZoneId: (value: string | null) => void;

    editTableId: string | null;
    setEditTableId: (value: string | null) => void;

    zoneName: string;
    setZoneName: (value: string) => void;

    tableName: string;
    setTableName: (value: string) => void;

    currentStep: number;
    setCurrentStep: (value: number) => void;

    tableStart: number;
    setTableStart: (value: number) => void;
    tableEnd: number;
    setTableEnd: (value: number) => void;

    capacity: number;
    setCapacity: (value: number) => void;

    isAvailable: boolean;
    setIsAvailable: (value: boolean) => void;

    tax: number;
    setTax: (value: number) => void;

    selectedTableIds: string[];
    setSelectedTableIds: (value: string[]) => void;

    selectedCouponIds: string[];
    setSelectedCouponIds: (value: string[]) => void;

    selectedStaffIds: string[];
    setSelectedStaffIds: (value: string[]) => void;
    addStaffId: (value: string) => void;
    toggleStaffId: (value: string) => void;

    allZones: IZone[];
    setAllZones: (value: IZone[]) => void;

    allTables: ITable[];
    setAllTables: (value: ITable[]) => void;

    allStaff: UserProfile[];
    setAllStaff: (value: UserProfile[]) => void;

    selectZone: IZone | null;
    setSelectZone: (value: IZone | null) => void;

    setEditZone: (value: IZone | null) => void;

    setEditTable: (value: ITable | null) => void;

    resetAllValues: () => void;
}

const useZoneStore = create<ZoneStore>((set) => ({
    createZoneModal: false,
    setCreateZoneModal: (value) => set({ createZoneModal: value }),

    editZoneId: null,
    setEditZoneId: (value) => set({ editZoneId: value }),

    editTableId: null,
    setEditTableId: (value) => set({ editTableId: value }),

    bulkCreateTableModal: false,
    setBulkCreateTableModal: (value) => set({ bulkCreateTableModal: value }),

    showZoneDetails: false,
    setShowZoneDetails: (value) => set({ showZoneDetails: value }),

    saveZoneDetails: null,
    setSaveZoneDetails: (value) => set({ saveZoneDetails: value }),

    createTableModal: false,
    setCreateTableModal: (value) => set({ createTableModal: value }),

    linkModal: false,
    setLinkModal: (value) => set({ linkModal: value }),

    linkModalType: "table",
    setLinkModalType: (value) => set({ linkModalType: value }),

    zoneName: "",
    setZoneName: (value) => set({ zoneName: value }),

    tableName: "",
    setTableName: (value) => set({ tableName: value }),

    currentStep: 0,
    setCurrentStep: (value) => set({ currentStep: value }),

    tableStart: 0,
    setTableStart: (value) => set({ tableStart: value }),

    tableEnd: 0,
    setTableEnd: (value) => set({ tableEnd: value }),

    capacity: 0,
    setCapacity: (value) => set({ capacity: value }),


    isAvailable: true,
    setIsAvailable: (value) => set({ isAvailable: value }),

    tax: 1,
    setTax: (value) => set({ tax: value }),

    selectedTableIds: [],
    setSelectedTableIds: (value) => set({ selectedTableIds: value }),

    selectedCouponIds: [],
    setSelectedCouponIds: (value) => set({ selectedCouponIds: value }),

    allZones: [],
    setAllZones: (value) => set({ allZones: value }),

    allTables: [],
    setAllTables: (value) => set({ allTables: value }),

    allStaff: [],
    setAllStaff: (value) => set({ allStaff: value }),

    selectedStaffIds: [],
    setSelectedStaffIds: (value) => set({ selectedStaffIds: value }),
    addStaffId: (value) => set((state) => ({ selectedStaffIds: [...state.selectedStaffIds, value] })),
    toggleStaffId: (value) => set((state) => ({ selectedStaffIds: state.selectedStaffIds.includes(value) ? state.selectedStaffIds.filter((id) => id !== value) : [...state.selectedStaffIds, value] })),

    selectZone: null,
    setSelectZone: (value) => set({ selectZone: value }),

    setEditZone: (zone: IZone | null) =>
        set(() => ({
            editZone: zone,
            zoneName: zone?.name ?? "",
            isAvailable: zone?.visibility ?? false,
            tax: zone?.taxes ?? 1,
            selectedTableIds: zone?.tableIds ?? [],
            selectedCouponIds: zone?.couponIds ?? [],
            editZoneId: zone?._id ?? null
        })),

    setEditTable: (table: ITable | null) =>
        set((state) => ({
            editTable: table,
            tableName: table?.name ?? "",
            capacity: table?.capacity ?? 0,
            selectedStaffIds: table?.staffIds ?? [],
            selectZone: table ? state.allZones.find((zone) => zone._id === table.internalZoneId) : null,
            editTableId: table?._id ?? null
        })),

    resetAllValues: () => {
        set({
            createZoneModal: false,
            createTableModal: false,
            bulkCreateTableModal: false,
            linkModal: false,
            linkModalType: "table",
            zoneName: "",
            tableName: "",
            tableStart: 0,
            tableEnd: 0,
            isAvailable: true,
            tax: 1,
            selectedTableIds: [],
            selectedCouponIds: [],
            selectedStaffIds: [],
            editZoneId: null,
            capacity: 0,
            currentStep: 0,
            saveZoneDetails: null,
            showZoneDetails: false,
            editTableId: null,
            selectZone: null,
        })
    }
}));


export default useZoneStore;