// src/components/store/usePermissions.ts
import { create } from "zustand";

export type PermissionKey =
  | "normal_settle" //
  | "sale_summary" //
  | "bill" //
  | "order_accept"
  | "place_order" //
  | "offline_settle"
  | "transfer_item_or_table" //
  | "re_print_kot" //
  | "print_bill" //
  | "settle_bill_print" //
  | "add_coins" //
  | "add_discount" //
  | "add_coupon" //
  | "add_or_remove_service_charge" //
  | "split_bill" //
  | "e_bill" //
  | "merge_table" //
  | "delete_kot" //
  | "temp_item" //
  | "add_pax"; //

export const ALL_PERMISSION_KEYS: PermissionKey[] = [
  "normal_settle",
  "sale_summary",
  "bill",
  "order_accept",
  "place_order",
  "offline_settle",
  "transfer_item_or_table",
  "re_print_kot",
  "print_bill",
  "settle_bill_print",
  "add_coins",
  "add_discount",
  "add_coupon",
  "add_or_remove_service_charge",
  "split_bill",
  "e_bill",
  "merge_table",
  "temp_item",
  "delete_kot",
  "add_pax",
];

export type StaffPermissionsMap = Record<PermissionKey, boolean>;

interface StaffPermissionState {
  permissions: StaffPermissionsMap | null;

  setPermissions: (perms: Partial<Record<PermissionKey, boolean>>) => void;

  clearPermissions: () => void;

  hasPermission: (key: PermissionKey) => boolean;
}

export const useStaffPermissionStore = create<StaffPermissionState>(
  (set, get) => ({
    permissions: null,

    setPermissions: (perms) => {
      // Normalize to a full map so we always overwrite old state
      const normalized: StaffPermissionsMap = ALL_PERMISSION_KEYS.reduce(
        (acc, key) => {
          acc[key] = Boolean(perms?.[key]);
          return acc;
        },
        {} as StaffPermissionsMap,
      );

      set({ permissions: normalized });
    },

    clearPermissions: () => set({ permissions: null }),

    hasPermission: (key) => {
      const perms = get().permissions;
      if (!perms) return false;
      return !!perms[key];
    },
  }),
);
