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

interface ZoneStore {

    createZoneModal: boolean;
    setCreateZoneModal: (value: boolean) => void;

    createTableModal: boolean;
    setCreateTableModal: (value: boolean) => void;

    linkModal: boolean;
    setLinkModal: (value: boolean) => void;

    linkModalType: link;
    setLinkModalType: (value: link) => void;

    editZoneId: string | null;
    setEditZoneId: (value: string | null) => void;

    zoneName: string;
    setZoneName: (value: string) => void;

    tableName: string;
    setTableName: (value: string) => void;

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

    allZones: IZone[];
    setAllZones: (value: IZone[]) => void;

    allStaff: UserProfile[];
    setAllStaff: (value: UserProfile[]) => void;

    selectZone: IZone | null;
    setSelectZone: (value: IZone | null) => void;

    setEditZone: (value: IZone | null) => void;

    resetAllValues: () => void;
}

const useZoneStore = create<ZoneStore>((set) => ({
    createZoneModal: false,
    setCreateZoneModal: (value) => set({ createZoneModal: value }),

    editZoneId: null,
    setEditZoneId: (value) => set({ editZoneId: value }),

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

    allStaff: [],
    setAllStaff: (value) => set({ allStaff: value }),

    selectedStaffIds: [],
    setSelectedStaffIds: (value) => set({ selectedStaffIds: value }),
    addStaffId: (value) => set((state) => ({ selectedStaffIds: [...state.selectedStaffIds, value] })),

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

    resetAllValues: () => {
        set({
            createZoneModal: false,
            createTableModal: false,
            linkModal: false,
            linkModalType: "table",
            zoneName: "",
            tax: 1,
            selectedTableIds: [],
            selectedCouponIds: [],
            selectedStaffIds: [],
            editZoneId: null,
            capacity: 0,
        })
    }
}));


export default useZoneStore;