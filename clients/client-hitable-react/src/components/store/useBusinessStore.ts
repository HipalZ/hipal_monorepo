import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export enum WeekDay {
  SUNDAY = 7,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export const dayNames: Record<WeekDay, string> = {
  [WeekDay.SUNDAY]: "Sunday",
  [WeekDay.MONDAY]: "Monday",
  [WeekDay.TUESDAY]: "Tuesday",
  [WeekDay.WEDNESDAY]: "Wednesday",
  [WeekDay.THURSDAY]: "Thursday",
  [WeekDay.FRIDAY]: "Friday",
  [WeekDay.SATURDAY]: "Saturday",
};

export type ServiceType = "DINE_IN" | "TAKE_AWAY" | "DELIVERY" | string;

export interface BusinessMenu {
  _id: string;
  name: string;
  businessId: string;
  zoneIds: string[];
  menuType: number;
  days: WeekDay[]; // 1–7 as per WeekDay enum
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  isActive: boolean;
  isDeleted: boolean;
  categoryLayout: number;
  cardLayout: number;
  primaryColor: string;
  secondaryColor: string;
  default: boolean;
  serviceType: ServiceType;
  __v?: number;
}

interface BusinessMenuState {
  businessId: string | null;
  menus: BusinessMenu[];
  selectedMenu: BusinessMenu | null;

  setBusinessMenus: (businessId: string, menus: BusinessMenu[]) => void;
  clearBusinessMenus: () => void;

  // user-controlled selection
  setSelectedMenu: (menu: BusinessMenu | null) => void;
  setSelectedMenuById: (menuId: string | null) => void;
}

export const useBusinessMenuStore = create<BusinessMenuState>()(
  persist(
    (set) => ({
      businessId: null,
      menus: [],
      selectedMenu: null,

      // Always overwrite with latest API result (including empty [])
      setBusinessMenus: (businessId, menus) =>
        set((state) => {
          let nextSelected = state.selectedMenu;

          // If there is a selectedMenu, keep it only if it still exists
          if (nextSelected && !menus.some((m) => m._id === nextSelected!._id)) {
            nextSelected = null;
          }

          // If no selectedMenu (or it was invalid), choose default or first
          if (!nextSelected) {
            if (menus.length > 0) {
              nextSelected = menus.find((m) => m.default) ?? menus[0];
            } else {
              nextSelected = null;
            }
          }

          return {
            businessId,
            menus,
            selectedMenu: nextSelected,
          };
        }),

      clearBusinessMenus: () =>
        set({
          businessId: null,
          menus: [],
          selectedMenu: null,
        }),

      setSelectedMenu: (menu) =>
        set({
          selectedMenu: menu,
        }),

      setSelectedMenuById: (menuId) =>
        set((state) => ({
          selectedMenu: menuId
            ? state.menus.find((m) => m._id === menuId) ?? null
            : null,
        })),
    }),
    {
      name: "business_menu",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
