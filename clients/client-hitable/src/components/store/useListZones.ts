// store/zonesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IZone {
  businessId: string;
  zoneName: string;
  zoneType: string;
  startTime: string;
  endTime: string;
  staff: string[];
  tables: string[];
  Occupied: number;
  id: string;
}

interface ZoneState {
  zones: IZone[];
  lastUpdate: number | null;
  setZones: (zones: IZone[]) => void;
  setLastUpdate: (timestamp: number) => void;
}

export const useListZone = create(
  persist<ZoneState>(
    (set) => ({
      zones: [],
      lastUpdate: null,
      setZones: (zones: IZone[]) => set({ zones: zones }),
      setLastUpdate: (lastUpdate: number) => set({ lastUpdate: lastUpdate }),
    }),
    {
      name: 'list-zones',
      getStorage: () => localStorage,
    },
  ),
);
