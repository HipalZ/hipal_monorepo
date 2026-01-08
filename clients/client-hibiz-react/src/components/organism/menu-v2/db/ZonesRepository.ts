/**
 * Zones Repository
 * 
 * Handles offline-first CRUD operations for Zones in Dexie.
 */

import { db } from './menu.database';
import type { MenuZone } from '../types';

export const ZonesRepository = {
  /**
   * Get all zones for a business
   */
  async getAll(businessId: string): Promise<MenuZone[]> {
    return await db.zones
      .where('businessId')
      .equals(businessId)
      .and((zone) => !zone.isDeleted && zone.active)
      .toArray();
  },

  /**
   * Get a zone by ID
   */
  async getById(zoneId: string): Promise<MenuZone | undefined> {
    return await db.zones.get(zoneId);
  },

  /**
   * Upsert zones (bulk insert/update from server)
   */
  async upsertZones(zones: MenuZone[]): Promise<void> {
    await db.transaction('rw', db.zones, async () => {
      for (const zone of zones) {
        await db.zones.put(zone, zone._id);
      }
    });
  },

  /**
   * Update zone's kitchenIds
   */
  async updateKitchenIds(
    zoneId: string,
    kitchenIds: string[]
  ): Promise<void> {
    await db.zones.update(zoneId, {
      kitchenIds: [...new Set(kitchenIds)], // Dedupe
      updatedAt: Date.now(),
    });
  },

  /**
   * Clear all zones (for bootstrap reset)
   */
  async clear(businessId: string): Promise<void> {
    await db.zones.where('businessId').equals(businessId).delete();
  },
};
