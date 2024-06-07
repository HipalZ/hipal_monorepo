import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface IDetails {
	tableId: string
	tableName: string
	zoneId: string
	businessId: string
	parentTableId: string
	parentZoneId: string
	hierarchy: string
	isMerge: boolean
	tableHiCode: string
	setHierarchy: (hierarchy: string) => void
	setIsMerge: (isMerge: boolean) => void
	setTableHiCode: (tableHicode: string) => void
	setParentTableId: (tableId: string) => void
	setParentZoneId: (zoneId: string) => void
	setTableId: (tableId: string) => void
	setTableName: (name: string) => void
	setZoneId: (zoneId: string) => void
	setBusinessId: (businessId: string) => void
}

const useIdDetails = create(
	persist<IDetails>(
		(set, get) => ({
			tableId: '',
			tableName: '',
			zoneId: '',
			businessId: '',
			parentTableId: '',
			parentZoneId: '',
			hierarchy: '',
			isMerge: false,
			tableHiCode: '',
			setHierarchy: (d: string) => set({ hierarchy: d }),
			setIsMerge: (d: boolean) => set({ isMerge: d }),
			setTableHiCode: (d: string) => set({ tableHiCode: d }),
			setParentZoneId: (d: string) => set({ parentZoneId: d }),
			setParentTableId: (d: string) => set({ parentTableId: d }),
			setTableId: (d: string) => set({ tableId: d }),
			setTableName: (d: string) => set({ tableName: d }),
			setZoneId: (d: string) => set({ zoneId: d }),
			setBusinessId: (d: string) => set({ businessId: d }),
		}),
		{
			name: 'idDetails',
		},
	),
)

export default useIdDetails
