import { db, type IDraftOp } from "../db/menu.database";
import { v4 as uuidv4 } from "uuid";
import type {
  DishUpdatePayload,
  CategoryUpdatePayload,
  AddonUpdatePayload,
  Portion,
  MenuDish,
  MenuCategory,
  MenuAddon,
} from "../types";
import {
  buildDishPayload,
  buildAddonPayload,
  buildCategoryPayload,
} from "../utils/payloadBuilders";
import type { DishFormValues } from "../validations";
import { enforceUniqueKitchenDishIds } from "../utils/enforceUniqueKitchenDishIds";

// Helper to generate UUID v4
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper to normalize name for nameKey
const toKey = (s: string): string =>
  (s || "").trim().toLowerCase().replace(/\s+/g, " ");

export const DraftOpsRepository = {
  async addDraftOp(op: Omit<IDraftOp, "id" | "createdAt">) {
    await db.draftOps.add({
      ...op,
      createdAt: Date.now(),
    });
  },

  async getAll(): Promise<IDraftOp[]> {
    return await db.draftOps.orderBy("createdAt").toArray();
  },

  async getByEntityId(
    entity: "DISH" | "CATEGORY" | "ADDON",
    entityId: string,
  ): Promise<IDraftOp[]> {
    return await db.draftOps
      .where("entity")
      .equals(entity)
      .and((op) => op.entityId === entityId)
      .sortBy("createdAt");
  },

  async delete(opId: number): Promise<void> {
    await db.draftOps.delete(opId);
  },

  async getAllDraftOps(): Promise<IDraftOp[]> {
    return await db.draftOps.orderBy("createdAt").toArray();
  },

  async getDraftOpsCount(): Promise<number> {
    return await db.draftOps.count();
  },

  async clearDraftOps(): Promise<void> {
    await db.draftOps.clear();
  },

  /**
   * Remove draft operations for specific entities (by entityId and entity type)
   * Used to remove successful updates from the draft queue
   */
  async removeDraftOpsByEntityIds(
    entityIds: string[],
    entity:
      | "DISH"
      | "CATEGORY"
      | "ADDON"
      | "KITCHEN"
      | "ZONE_KITCHENS"
      | "DISH_ZONE_KITCHEN",
  ): Promise<void> {
    if (entityIds.length === 0) return;

    // Filter by entity type and entityId since we don't have a compound index
    await db.draftOps
      .filter((op) => op.entity === entity && entityIds.includes(op.entityId))
      .delete();
  },

  /**
   * Link kitchens to a zone (offline-first)
   */
  async linkKitchensToZone(
    zoneId: string,
    businessId: string,
    kitchenIds: string[],
  ): Promise<void> {
    await db.transaction("rw", db.zones, db.draftOps, async () => {
      // Update local zone
      await db.zones.update(zoneId, {
        kitchenIds: [...new Set(kitchenIds)],
        updatedAt: Date.now(),
      });

      // Create draft op
      await this.addDraftOp({
        businessId,
        entity: "ZONE_KITCHENS",
        entityId: zoneId,
        opType: "UPSERT",
        payload: {
          businessId,
          zoneId,
          kitchenIds: [...new Set(kitchenIds)],
        },
      });
    });
  },

  /**
   * Link dish to kitchen for a zone (offline-first)
   */
  async linkDishToKitchen(
    dishId: string,
    zoneId: string,
    kitchenId: string,
    businessId: string,
  ): Promise<void> {
    await db.transaction("rw", db.dishZoneKitchen, db.draftOps, async () => {
      const key = `${dishId}_${zoneId}`;
      const now = Date.now();

      // Upsert local mapping
      const existing = await db.dishZoneKitchen.get(key);
      await db.dishZoneKitchen.put({
        key,
        businessId,
        dishId,
        zoneId,
        kitchenId,
        createdAtLocal: existing?.createdAtLocal || now,
        updatedAtLocal: now,
      });

      // Create draft op
      await this.addDraftOp({
        businessId,
        entity: "DISH_ZONE_KITCHEN",
        entityId: key,
        opType: "UPSERT",
        payload: {
          businessId,
          dishId,
          zoneId,
          kitchenId,
        },
      });
    });
  },

  /**
   * Bulk link dishes to kitchen for a zone (offline-first)
   */
  async bulkLinkDishesToKitchen(
    dishIds: string[],
    zoneId: string,
    kitchenId: string,
    businessId: string,
  ): Promise<void> {
    await db.transaction("rw", db.dishZoneKitchen, db.draftOps, async () => {
      const now = Date.now();

      for (const dishId of dishIds) {
        const key = `${dishId}_${zoneId}`;

        // Upsert local mapping
        const existing = await db.dishZoneKitchen.get(key);
        await db.dishZoneKitchen.put({
          key,
          businessId,
          dishId,
          zoneId,
          kitchenId,
          createdAtLocal: existing?.createdAtLocal || now,
          updatedAtLocal: now,
        });

        // Create draft op
        await this.addDraftOp({
          businessId,
          entity: "DISH_ZONE_KITCHEN",
          entityId: key,
          opType: "UPSERT",
          payload: {
            businessId,
            dishId,
            zoneId,
            kitchenId,
          },
        });
      }
    });
  },

  // Helper: Update a dish and log the draft operation (with before snapshot)
  async updateDish(
    dishId: string,
    businessId: string,
    updates: DishUpdatePayload,
  ) {
    await db.transaction("rw", db.dishes, db.draftOps, async () => {
      // Read before state for revert
      const beforeDish = await db.dishes.get(dishId);
      const before = beforeDish
        ? {
            name: beforeDish.name,
            price: beforeDish.price,
            description: beforeDish.description,
            availability: beforeDish.availability,
            visibility: beforeDish.visibility,
            portions: beforeDish.portions,
            categoryIds: beforeDish.categoryIds,
            addonIds: (beforeDish as any).addonIds,
            images: beforeDish.images,
            tags: beforeDish.tags,
            recommendedDishIds: (beforeDish as any).recommendedDishIds,
            kitchenId: beforeDish.kitchenId,
            dishType: (beforeDish as any).dishType,
          }
        : undefined;

      await db.dishes.update(dishId, updates);

      await this.addDraftOp({
        businessId,
        menuId: beforeDish?.menuId,
        entity: "DISH",
        entityId: dishId,
        opType: "UPDATE",
        payload: updates,
        before,
      });
    });
  },

  /**
   * Bulk update all dishes that share the same normalized name (nameKey) for a business.
   * Used in "ALL" view to apply quick edits across multiple menus.
   */
  async updateDishesByNameKey(
    nameKey: string,
    businessId: string,
    updates: DishUpdatePayload,
  ) {
    await db.transaction("rw", db.dishes, db.draftOps, async () => {
      const dishes = (await db.dishes
        .where("businessId")
        .equals(businessId)
        .filter((d) => (d as MenuDish).nameKey === nameKey)
        .toArray()) as MenuDish[];

      if (!dishes.length) return;

      for (const dish of dishes) {
        // Read before state
        const before = {
          name: dish.name,
          price: dish.price,
          description: dish.description,
          availability: dish.availability,
          visibility: dish.visibility,
          portions: dish.portions,
          categoryIds: dish.categoryIds,
          addonIds: (dish as any).addonIds,
          images: dish.images,
          tags: dish.tags,
          recommendedDishIds: (dish as any).recommendedDishIds,
          kitchenId: dish.kitchenId,
          dishType: (dish as any).dishType,
        };

        await db.dishes.update(dish._id, updates);

        await this.addDraftOp({
          businessId,
          menuId: dish.menuId,
          entity: "DISH",
          entityId: dish._id,
          opType: "UPDATE",
          payload: updates,
          before,
        });
      }
    });
  },

  // Helper: Update a category and log the draft operation (with before snapshot)
  async updateCategory(
    categoryId: string,
    businessId: string,
    updates: CategoryUpdatePayload,
  ) {
    await db.transaction("rw", db.categories, db.draftOps, async () => {
      // Read before state
      const beforeCategory = await db.categories.get(categoryId);
      const before = beforeCategory
        ? {
            name: beforeCategory.name,
            visibility: beforeCategory.visibility,
            parentId: beforeCategory.parentId,
            coverImage: beforeCategory.coverImage,
          }
        : undefined;

      await db.categories.update(categoryId, updates);

      await this.addDraftOp({
        businessId,
        menuId: beforeCategory?.menuId,
        entity: "CATEGORY",
        entityId: categoryId,
        opType: "UPDATE",
        payload: updates,
        before,
      });
    });
  },

  // Helper: Update dish fields (price, availability, visibility)
  async updateDishFields(
    dishId: string,
    businessId: string,
    updates: DishUpdatePayload,
  ) {
    return this.updateDish(dishId, businessId, updates);
  },

  // Helper: Update dish portions (with before snapshot)
  async updateDishPortions(
    dishId: string,
    businessId: string,
    portions: Portion[],
  ) {
    await db.transaction("rw", db.dishes, db.draftOps, async () => {
      const beforeDish = await db.dishes.get(dishId);
      const before = beforeDish ? { portions: beforeDish.portions } : undefined;

      await db.dishes.update(dishId, { portions });

      await this.addDraftOp({
        businessId,
        menuId: beforeDish?.menuId,
        entity: "DISH",
        entityId: dishId,
        opType: "UPDATE",
        payload: { portions },
        before,
      });
    });
  },

  // Helper: Update addon (with before snapshot)
  async updateAddon(
    addonId: string,
    businessId: string,
    updates: AddonUpdatePayload,
  ) {
    await db.transaction("rw", db.addons, db.draftOps, async () => {
      // Read before state
      const beforeAddon = await db.addons.get(addonId);
      const before = beforeAddon
        ? {
            name: beforeAddon.name,
            compulsory: beforeAddon.compulsory,
            addOnMaxQuantity: beforeAddon.addOnMaxQuantity,
            choiceType: (beforeAddon as any).choiceType,
            choices: beforeAddon.choices,
            availability: beforeAddon.availability,
            visibility: beforeAddon.visibility,
          }
        : undefined;

      await db.addons.update(addonId, updates);

      await this.addDraftOp({
        businessId,
        menuId: beforeAddon?.menuId,
        entity: "ADDON",
        entityId: addonId,
        opType: "UPDATE",
        payload: updates,
        before,
      });
    });
  },

  /**
   * Helper to reconcile kitchen-dish links.
   * Handles "stealing" dishes from other kitchens and unlinking removed dishes.
   */
  async reconcileKitchenDishLinks(params: {
    businessId: string;
    kitchenId: string;
    newDishIds: string[];
    oldDishIds: string[];
  }) {
    const { businessId, kitchenId, newDishIds, oldDishIds } = params;

    // 1. Identify added and removed dishes
    const addedDishIds = newDishIds.filter((id) => !oldDishIds.includes(id));
    const removedDishIds = oldDishIds.filter((id) => !newDishIds.includes(id));

    // 2. Handle Removed Dishes (Unlink)
    // Set kitchenId to empty string for dishes removed from this kitchen
    if (removedDishIds.length > 0) {
      await db.dishes
        .filter((dish) => removedDishIds.includes(dish._id))
        .modify({ kitchenId: "" });
    }

    // 3. Handle Added Dishes (Steal from others)
    if (addedDishIds.length > 0) {
      // A. Update the dishes themselves to point to THIS kitchen
      await db.dishes
        .filter((dish) => addedDishIds.includes(dish._id))
        .modify({ kitchenId: kitchenId });

      // B. Update OTHER kitchens that might have contained these dishes
      // We need to remove these dishIds from their arrays
      const otherKitchens = await db.kitchens
        .where("businessId")
        .equals(businessId)
        .filter(
          (k) =>
            k._id !== kitchenId &&
            k.dishIds &&
            k.dishIds.some((dId) => addedDishIds.includes(dId)),
        )
        .toArray();

      for (const k of otherKitchens) {
        // Remove stolen dishes from this kitchen's list
        k.dishIds = k.dishIds.filter((dId) => !addedDishIds.includes(dId));
        await db.kitchens.put(k);
      }
    }

    return { addedDishIds, removedDishIds };
  },

  // ============================================================================
  // CREATE METHODS (Offline-First: Write to Dexie + Create DraftOp)
  // ============================================================================

  /**
   * Create a new dish locally (offline-first).
   * Writes to Dexie and creates a CREATE draftOp.
   * NO server call - that happens only on PUSH MENU.
   */
  async createDish(
    businessId: string,
    menuId: string,
    formData: DishFormValues,
    uploadedImageUrls: string[] = [],
  ): Promise<string> {
    const localId = generateUUID();
    const now = Date.now();

    // Build server payload using payload builder
    const serverPayload = buildDishPayload(formData, menuId, uploadedImageUrls);
    const finalPrice = (serverPayload.price as number) || 1;

    const newDish: MenuDish = {
      _id: localId,
      businessId,
      menuId,
      name: formData.name,
      nameKey: toKey(formData.name),
      dishType: formData.dishType as any,
      price: finalPrice,
      description: formData.description || "",
      availability: formData.availability ?? true,
      visibility: formData.visibility ?? true,
      portions: (serverPayload.portions as Portion[]) || [],
      categoryIds: (serverPayload.categoryIds as string[]) || [],
      addonIds: (serverPayload.addOnIds as string[]) || [],
      images: (serverPayload.images as string[]) || [],
      tags: formData.tags || [],
      recommendedDishIds: (serverPayload.recommendationIds as string[]) || [],
      kitchenId: formData.kitchenId || "",
      timings: (serverPayload.timings as any) || [],
      avgPrepTime: (serverPayload.avgPrepTime as number) || 0,
      syncStatus: "LOCAL_ONLY" as any,
      createdAt: now,
      updatedAt: now,
    } as MenuDish;

    await db.transaction("rw", db.dishes, db.draftOps, async () => {
      await db.dishes.add(newDish);

      await this.addDraftOp({
        businessId,
        menuId,
        entity: "DISH",
        entityId: localId,
        opType: "CREATE",
        payload: {
          menuId,
          ...serverPayload,
        },
      });
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[DISH CREATE] Payload:", { menuId, ...serverPayload });
    }

    return localId;
  },

  /**
   * Create a new category locally (offline-first).
   * Writes to Dexie and creates a CREATE draftOp.
   * NO server call - that happens only on PUSH MENU.
   */
  async createCategory(
    businessId: string,
    menuId: string,
    formData: {
      name: string;
      hierarchy: "PARENT" | "CHILD";
      visibility?: boolean;
      coverImage?: string;
      parentId?: string;
      categoryTimings?: string;
    },
    uploadedCoverUrl?: string,
  ): Promise<string> {
    const localId = generateUUID();
    const now = Date.now();

    // Build server payload
    const serverPayload = buildCategoryPayload(
      formData,
      menuId,
      uploadedCoverUrl,
    );

    const newCategory: MenuCategory = {
      _id: localId,
      businessId,
      menuId,
      name: formData.name,
      nameKey: toKey(formData.name),
      hierarchy: formData.hierarchy,
      visibility: formData.visibility ?? true,
      coverImage: (serverPayload.coverImage as string) || "",
      parentId: formData.hierarchy === "CHILD" ? formData.parentId : undefined,
      parentCategoryIds: (serverPayload.parentCategoryIds as string[]) || [],
      timings: (serverPayload.timings as any) || [],
      categoryTimings: "", // Not used by server
      syncStatus: "LOCAL_ONLY" as any,
      createdAt: now,
      updatedAt: now,
    } as MenuCategory;

    await db.transaction("rw", db.categories, db.draftOps, async () => {
      await db.categories.add(newCategory);

      await this.addDraftOp({
        businessId,
        menuId,
        entity: "CATEGORY",
        entityId: localId,
        opType: "CREATE",
        payload: {
          menuId,
          ...serverPayload,
        },
      });
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[CATEGORY CREATE] Payload:", { menuId, ...serverPayload });
    }

    return localId;
  },

  /**
   * Create a new addon locally (offline-first).
   * Writes to Dexie and creates a CREATE draftOp.
   * NO server call - that happens only on PUSH MENU.
   */
  async createAddon(
    businessId: string,
    menuId: string,
    formData: {
      name: string;
      minChoice: number;
      maxChoice: number;
      choiceType: "NUMBER" | "CHECKBOX";
      choices: Array<{
        name: string;
        price: number;
        _id?: string;
        choiceDishType?: string | string[];
      }>;
    },
    dishIds: string[] = [],
  ): Promise<string> {
    const localId = generateUUID();
    const now = Date.now();

    // Build server payload
    const serverPayload = buildAddonPayload(formData, menuId, dishIds);

    const newAddon: MenuAddon = {
      _id: localId,
      businessId,
      menuId,
      name: formData.name,
      nameKey: toKey(formData.name),
      compulsory: (serverPayload.compulsory as number) || formData.minChoice,
      addOnMaxQuantity:
        (serverPayload.addOnMaxQuantity as number) || formData.maxChoice,
      choiceType: (serverPayload.choiceType as any) || formData.choiceType,
      choices: (serverPayload.choices as any[]) || [],
      availability: true,
      visibility: true,
      syncStatus: "LOCAL_ONLY" as any,
      createdAt: now,
      updatedAt: now,
    } as MenuAddon;

    await db.transaction("rw", db.addons, db.draftOps, async () => {
      await db.addons.add(newAddon);

      await this.addDraftOp({
        businessId,
        menuId,
        entity: "ADDON",
        entityId: localId,
        opType: "CREATE",
        payload: {
          menuId,
          ...serverPayload,
        },
      });
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[ADDON CREATE] Payload:", { menuId, ...serverPayload });
    }

    return localId;
  },

  // ============================================================================
  // KITCHEN METHODS (Offline-First: Handle Side Effects Locally)
  // ============================================================================

  /**
   * Create a new kitchen locally.
   * Handles side effects:
   * 1. Removes linked dishes from other kitchens (Stealing).
   * 2. Updates local dishes with new kitchenId.
   * 3. Creates CREATE draft operation.
   */
  async createKitchen(
    businessId: string,
    menuId: string,
    formData: {
      name: string;
      description: string;
      dishIds?: string[];
    },
  ): Promise<string> {
    const localId = uuidv4();
    const now = Date.now();
    const normalizedMenuId = menuId === "ALL" ? "" : menuId;

    const newKitchen: any = {
      _id: localId,
      businessId,
      menuId: normalizedMenuId,
      name: formData.name.trim(),
      description: formData.description.trim() || formData.name.trim(),
      dishIds: formData.dishIds || [],
      staffIds: [],
      syncStatus: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction(
      "rw",
      db.kitchens,
      db.dishes,
      db.draftOps,
      async () => {
        // 1. Read all kitchens in same scope (businessId + menuId)
        const allKitchens = await db.kitchens
          .where("businessId")
          .equals(businessId)
          .filter((k) => k.menuId === normalizedMenuId)
          .toArray();

        // 2. Add the new kitchen to the list for enforcement
        const kitchensWithNew = [...allKitchens, newKitchen];

        // 3. Enforce unique dishIds using helper
        const { updatedKitchens, dishKitchenAssignments } =
          enforceUniqueKitchenDishIds({
            kitchens: kitchensWithNew,
            targetKitchenId: localId,
            nextDishIds: formData.dishIds,
          });

        // 4. Write back all affected kitchens
        for (const kitchen of updatedKitchens) {
          if (kitchen._id === localId) {
            // Add the new kitchen
            await db.kitchens.add(kitchen);
          } else {
            // Update existing kitchens that had dishes stolen
            await db.kitchens.put(kitchen);
          }
        }

        // 5. Update dish.kitchenId for all affected dishes
        const dishIdsToUpdate = Object.keys(dishKitchenAssignments);
        for (const dishId of dishIdsToUpdate) {
          const assignedKitchenId = dishKitchenAssignments[dishId];
          await db.dishes.update(dishId, { kitchenId: assignedKitchenId });
        }

        // 6. Draft Op
        await this.addDraftOp({
          businessId,
          menuId: normalizedMenuId,
          entity: "KITCHEN",
          entityId: localId,
          opType: "CREATE",
          payload: {
            menuId: normalizedMenuId,
            name: formData.name.trim(),
            description: formData.description.trim() || formData.name.trim(),
            dishIds: formData.dishIds,
            staffIds: [],
          },
          createdAt: now,
        });
      },
    );

    return localId;
  },

  /**
   * Update an existing kitchen locally.
   * Handles side effects:
   * 1. Removes dishes that were removed from this kitchen (Unlinking).
   * 2. Removes newly added dishes from THEIR old kitchens (Stealing).
   * 3. Updates local dishes with new/null kitchenId.
   * 4. Creates UPDATE draft operation.
   */
  async updateKitchen(
    kitchenId: string,
    businessId: string,
    updates: {
      name: string;
      description: string;
      dishIds?: string[];
      removeDishIds?: string[];
    },
    originalData: any, // To know what was removed
  ): Promise<void> {
    const now = Date.now();
    const finalDescription = updates.description.trim() || updates.name.trim();

    await db.transaction(
      "rw",
      db.kitchens,
      db.dishes,
      db.draftOps,
      async () => {
        // If dishIds are NOT provided, we only update name/description
        if (updates.dishIds === undefined) {
          const kitchen = await db.kitchens.get(kitchenId);
          if (kitchen) {
            await db.kitchens.update(kitchenId, {
              name: updates.name.trim(),
              description: finalDescription,
              syncStatus: "pending",
              updatedAt: now,
            });

            // Draft Op without dishIds
            await this.addDraftOp({
              businessId,
              menuId: originalData.menuId,
              entity: "KITCHEN",
              entityId: kitchenId,
              opType: "UPDATE",
              payload: {
                name: updates.name.trim(),
                description: finalDescription,
                staffIds: originalData.staffIds || [],
                businessId,
                kitchenId,
              },
              createdAt: now,
            });
          }
          return;
        }

        // If dishIds ARE provided, we do the full reconciliation
        const oldDishIds = originalData.dishIds || [];
        const newDishIds = updates.dishIds || [];
        const removedDishIds =
          updates.removeDishIds ||
          oldDishIds.filter((id: string) => !newDishIds.includes(id));

        // 1. Read all kitchens in same scope (businessId + menuId)
        const allKitchens = await db.kitchens
          .where("businessId")
          .equals(businessId)
          .filter((k) => k.menuId === originalData.menuId)
          .toArray();

        // 2. Enforce unique dishIds using helper
        const { updatedKitchens, dishKitchenAssignments } =
          enforceUniqueKitchenDishIds({
            kitchens: allKitchens,
            targetKitchenId: kitchenId,
            nextDishIds: newDishIds,
            removedDishIds: removedDishIds,
          });

        // 3. Write back all affected kitchens
        for (const kitchen of updatedKitchens) {
          const kitchenToUpdate = {
            ...kitchen,
            // Update metadata only for the target kitchen
            ...(kitchen._id === kitchenId
              ? {
                  name: updates.name.trim(),
                  description: finalDescription,
                  syncStatus: "pending",
                  updatedAt: now,
                }
              : {}),
          };
          await db.kitchens.put(kitchenToUpdate);
        }

        // 4. Update dish.kitchenId for all affected dishes
        const dishIdsToUpdate = Object.keys(dishKitchenAssignments);
        for (const dishId of dishIdsToUpdate) {
          const assignedKitchenId = dishKitchenAssignments[dishId];
          await db.dishes.update(dishId, { kitchenId: assignedKitchenId });
        }

        // 5. Draft Op
        await this.addDraftOp({
          businessId,
          menuId: originalData.menuId,
          entity: "KITCHEN",
          entityId: kitchenId,
          opType: "UPDATE",
          payload: {
            name: updates.name.trim(),
            description: finalDescription,
            dishIds: newDishIds,
            removeDishIds: removedDishIds,
            staffIds: originalData.staffIds || [],
            businessId,
            kitchenId,
          },
          createdAt: now,
        });
      },
    );
  },
};
