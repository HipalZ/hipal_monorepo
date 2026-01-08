/**
 * DishZoneKitchen Repository
 * 
 * Handles offline-first CRUD operations for Dish-Zone-Kitchen mappings.
 */

import { db } from './menu.database';
import type { DishZoneKitchen } from '../types';

export const DishZoneKitchenRepository = {
  /**
   * Get all mappings for a business
   */
  async getAll(businessId: string): Promise<DishZoneKitchen[]> {
    return await db.dishZoneKitchen
      .where('businessId')
      .equals(businessId)
      .toArray();
  },

  /**
   * Get mapping by dish and zone
   */
  async getByDishAndZone(
    dishId: string,
    zoneId: string
  ): Promise<DishZoneKitchen | undefined> {
    const key = `${dishId}_${zoneId}`;
    return await db.dishZoneKitchen.get(key);
  },

  /**
   * Get all mappings for a zone
   */
  async getByZone(zoneId: string, businessId: string): Promise<DishZoneKitchen[]> {
    return await db.dishZoneKitchen
      .where('[businessId+zoneId]')
      .equals([businessId, zoneId])
      .toArray();
  },

  /**
   * Get all mappings for a dish
   */
  async getByDish(dishId: string, businessId: string): Promise<DishZoneKitchen[]> {
    return await db.dishZoneKitchen
      .where('[businessId+dishId]')
      .equals([businessId, dishId])
      .toArray();
  },

  /**
   * Get kitchen ID for a dish in a zone
   */
  async getKitchenId(
    dishId: string,
    zoneId: string
  ): Promise<string | undefined> {
    const mapping = await this.getByDishAndZone(dishId, zoneId);
    return mapping?.kitchenId;
  },

  /**
   * Upsert a single mapping
   */
  async upsert(mapping: Omit<DishZoneKitchen, 'createdAtLocal' | 'updatedAtLocal'>): Promise<void> {
    const key = `${mapping.dishId}_${mapping.zoneId}`;
    const now = Date.now();
    
    const existing = await db.dishZoneKitchen.get(key);
    
    await db.dishZoneKitchen.put({
      ...mapping,
      key,
      createdAtLocal: existing?.createdAtLocal || now,
      updatedAtLocal: now,
    });
  },

  /**
   * Upsert multiple mappings (bulk)
   */
  async upsertBulk(mappings: Omit<DishZoneKitchen, 'key' | 'createdAtLocal' | 'updatedAtLocal'>[]): Promise<void> {
    await db.transaction('rw', db.dishZoneKitchen, async () => {
      const now = Date.now();
      
      for (const mapping of mappings) {
        const key = `${mapping.dishId}_${mapping.zoneId}`;
        const existing = await db.dishZoneKitchen.get(key);
        
        await db.dishZoneKitchen.put({
          ...mapping,
          key,
          createdAtLocal: existing?.createdAtLocal || now,
          updatedAtLocal: now,
        });
      }
    });
  },

  /**
   * Delete a mapping
   */
  async delete(dishId: string, zoneId: string): Promise<void> {
    const key = `${dishId}_${zoneId}`;
    await db.dishZoneKitchen.delete(key);
  },

  /**
   * Clear all mappings for a business (for bootstrap reset)
   */
  async clear(businessId: string): Promise<void> {
    await db.dishZoneKitchen.where('businessId').equals(businessId).delete();
  },
};
