/**
 * Menu Database Schema
 *
 * Defines the Dexie (IndexedDB) schema for Menu V2 offline-first data storage.
 * All types are imported from types/index.ts to ensure consistency.
 */

import Dexie, { type Table } from "dexie";
import type {
  IDraftOp,
  IPendingImage,
  MenuDish,
  MenuCategory,
  MenuAddon,
  MenuLayout,
  MenuKitchen,
  MenuZone,
  DishZoneKitchen,
} from "../types";

// Re-export types for backward compatibility
export type { IDraftOp, IPendingImage } from "../types";

// Pending image uploads (stored locally until Push Menu)
// IPendingImage is imported from types/index.ts

export class MenuDatabase extends Dexie {
  dishes!: Table<MenuDish, string>;
  categories!: Table<MenuCategory, string>;
  addons!: Table<MenuAddon, string>;
  menus!: Table<MenuLayout, string>;
  kitchens!: Table<MenuKitchen, number>;
  zones!: Table<MenuZone, string>;
  dishZoneKitchen!: Table<DishZoneKitchen, string>;
  draftOps!: Table<IDraftOp, number>;
  pendingImages!: Table<IPendingImage, number>;

  constructor() {
    super("HipalMenuDB");

    // v6: Added zones and dishZoneKitchen tables for kitchen routing
    // v5: Simplified schema - removed redundant mapping tables and overrides
    // Filtering is done directly by menuId on entities (dishes.menuId, categories.menuId, etc.)
    this.version(7).stores({
      dishes: "_id, businessId, menuId, kitchenId, name, nameKey",
      categories: "_id, businessId, menuId, parentId, name, nameKey",
      addons: "_id, businessId, menuId, name, nameKey",
      menus: "_id, businessId, name",
      kitchens: " _id, businessId, menuId, name", // Added kitchens table with menuId
      zones: "_id, businessId, name, [businessId+_id], active",
      dishZoneKitchen:
        "key, businessId, [businessId+zoneId], [businessId+dishId], [dishId+zoneId]",
      draftOps: "++id, businessId, createdAt",
      pendingImages:
        "++id, dishId, businessId, [dishId+imageIndex], [businessId+dishId]",
    });
  }
}

export const db = new MenuDatabase();
