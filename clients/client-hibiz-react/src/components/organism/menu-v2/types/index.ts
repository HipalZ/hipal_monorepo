/**
 * Menu V2 Type Definitions
 *
 * This file contains all TypeScript types and interfaces used in the menu-v2 module.
 * Types are properly defined to avoid using 'any' and ensure type safety.
 */

import type {
  DishType,
  CategoryType,
  AddOnType,
  MenuType,
} from "@hi/db-models/src/validators";

// ============================================================================
// Extended Entity Types (with menu-v2 specific fields)
// ============================================================================

/** Extended Dish type with nameKey for bulk operations */
export interface MenuDish extends DishType {
  _id: string;
  nameKey?: string;
  menuId: string;
  displayPrice?: number;
  displayVisibility?: boolean;
}

/** Extended Category type with nameKey and hierarchy support */
export interface MenuCategory extends CategoryType {
  _id: string;
  nameKey?: string;
  menuId: string;
  parentId?: string;
  parentCategoryIds: string[];
  hierarchy: "PARENT" | "CHILD";
}

/** Extended Addon type with nameKey */
export interface MenuAddon extends AddOnType {
  _id: string;
  nameKey?: string;
  menuId: string;
}

/** Extended Menu type */
export interface MenuLayout extends MenuType {
  _id: string;
  name?: string;
  menuType?: 1 | 2; // 1 = MAIN_SUB_DISH, 2 = SUB_DISH
}

/** Extended Kitchen type */
export interface MenuKitchen {
  _id: string; // Server ID (if synced) or temp ID
  businessId: string;
  menuId: string; // Linked Menu ID
  name: string;
  description?: string;
  staffIds?: string[];
  dishIds?: string[];
  serverId?: string; // Explicit server ID tracking if needed
  syncStatus?: "synced" | "pending" | "error";
  createdAt?: number;
  updatedAt?: number;
}

/** Zone type for offline-first zone management */
export interface MenuZone {
  _id: string; // Zone's MongoDB _id (internalZoneId)
  businessId: string;
  name: string;
  zoneId?: string; // Short nanoid identifier
  kitchenIds: string[]; // Array of kitchen ObjectIds
  isDeleted: boolean;
  active: boolean;
  visibility: boolean;
  staffIds?: string[];
  taxes?: number;
  couponIds?: string[];
  tableIds?: string[];
  pos?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/** Dish-Zone-Kitchen mapping for routing */
export interface DishZoneKitchen {
  key: string; // Primary key: `${dishId}_${zoneId}`
  businessId: string;
  dishId: string;
  zoneId: string;
  kitchenId: string;
  createdAtLocal: number;
  updatedAtLocal: number;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface DishRowProps {
  dish: MenuDish;
  pendingImages: Map<string, string[]>;
  onEdit: (dish: MenuDish) => void;
  onUploadImage: (dish: MenuDish) => void;
}

export interface CategoryRowProps {
  category: MenuCategory;
  dishCount: number;
  onEdit: (category: MenuCategory) => void;
  onToggleVisibility: (categoryId: string, visibility: boolean) => void;
  businessId: string;
}

export interface ChildCategoryRowProps {
  category: MenuCategory;
  parentName: string;
  dishCount: number;
  onEdit: (category: MenuCategory) => void;
  onToggleVisibility: (categoryId: string, visibility: boolean) => void;
  businessId: string;
}

export interface AddonRowProps {
  addon: MenuAddon;
  onEdit: (addon: MenuAddon) => void;
  onToggleAvailability: (addonId: string, availability: boolean) => void;
  businessId: string;
}

export interface DishEditModalProps {
  dish: MenuDish | null;
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  selectedMenuId: string;
  dishesGroupedByNameKey: Map<string, MenuDish[]>;
}

export interface CategoryEditModalProps {
  category: MenuCategory | null;
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export interface AddonEditModalProps {
  addon: MenuAddon | null;
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

// ============================================================================
// Portion Types
// ============================================================================

export interface Portion {
  name: string;
  price: number;
  default?: boolean; // Default portion flag
  portionTypes?: string[]; // Dish types for this portion (VEG, NON_VEG, EGG, etc.)
  _id?: string;
}

// ============================================================================
// Addon Choice Types
// ============================================================================

export interface AddonChoice {
  name: string;
  price: number;
  choiceMaxQuantity?: number;
  choiceDishType?: string | string[];
  visibility?: boolean;
  availability?: boolean;
  uuid?: string; // Required by server for choices
  _id?: string;
}

// ============================================================================
// Draft Operations Types
// ============================================================================

export type DraftEntityType = "DISH" | "CATEGORY" | "ADDON" | "KITCHEN" | "ZONE_KITCHENS" | "DISH_ZONE_KITCHEN";
export type DraftOpType = "CREATE" | "UPDATE" | "DELETE" | "UPSERT";

export interface IDraftOp {
  id?: number;
  businessId: string;
  menuId?: string; // Menu ID for the entity (used for grouping/filtering)
  entity: DraftEntityType;
  entityId: string;
  opType: DraftOpType;
  payload: Record<string, unknown>; // "after" state (new values)
  before?: Record<string, unknown>; // Snapshot of entity before this change (for revert)
  createdAt: number;
}

// ============================================================================
// Pending Images Types
// ============================================================================

export interface IPendingImage {
  id?: number;
  dishId: string;
  businessId: string;
  imageIndex: number; // 0, 1, or 2
  preview: string; // Base64 data URL
  uploadedUrl?: string; // URL after upload to cloud
  createdAt: number;
}

// ============================================================================
// View Data Types
// ============================================================================

export interface MenuViewData {
  selectedMenuId: string;
  menus: MenuLayout[];
  dishes: MenuDish[];
  dishesGroupedByNameKey: Map<string, MenuDish[]>;
  categories: MenuCategory[];
  parentCategories: MenuCategory[];
  childCategories: MenuCategory[];
  dishesByCategoryId: Map<string, MenuDish[]>;
  dishCountByCategoryId: Map<string, number>;
  addons: MenuAddon[];
  addonGroups: Array<{
    group: MenuAddon;
    items: MenuAddon[];
  }>;
  isLoading: boolean;
}

// ============================================================================
// Update Payload Types
// ============================================================================

export interface DishUpdatePayload {
  name?: string;
  price?: number;
  availability?: boolean;
  visibility?: boolean;
  portions?: Portion[];
  images?: string[];
}

export interface CategoryUpdatePayload {
  name?: string;
  visibility?: boolean;
  parentId?: string;
}

export interface AddonUpdatePayload {
  name?: string;
  availability?: boolean;
  visibility?: boolean;
  compulsory?: number;
  addOnMaxQuantity?: number;
  choices?: AddonChoice[];
}

// ============================================================================
// Zone Kitchen Routing Payload Types
// ============================================================================

export interface ZoneKitchensOpPayload {
  businessId: string;
  zoneId: string;
  kitchenIds: string[];
}

export interface DishZoneKitchenOpPayload {
  businessId: string;
  dishId: string;
  zoneId: string;
  kitchenId: string;
}
