import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Zone {
  businessId: string;
  zoneName: string;
  zoneType: string;
  password: string;
  addCharges: Array<{
    chargeName: string;
    chargeType: string;
    value: number;
    typeOfValue: string;
  }>;
  commisions: Array<{
    chargeName: string;
    chargeType: string;
    value: number;
    typeOfValue: string;
  }>;
  tables: Array<any>;
  Occupied: number;
  id: string;
}

interface ZoneState {
  zone: Zone | null; // Zone can be null
  setZone: (zone: Zone) => void;
}

export const useZoneStore = create(
  persist<ZoneState>(
    (set) => ({
      zone: null,
      setZone: (zone) => set({ zone }),
    }),
    {
      name: "zone-storage",
    }
  )
);
