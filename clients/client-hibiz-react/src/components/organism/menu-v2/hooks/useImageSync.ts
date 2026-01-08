/**
 * useImageSync Hook
 * 
 * Handles global image synchronization across multiple menus for shared dishes.
 * Uses nameKey to identify dishes that are the same across different menus.
 */

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/menu.database';
import type { MenuDish, MenuLayout } from '../types';

interface SharedDishInfo {
  nameKey: string;
  dishName: string;
  instances: Array<{
    dishId: string;
    menuId: string;
    menuName: string;
    currentImages: string[];
  }>;
  globalImages: string[]; // Union of all images across all instances
  availableSlots: number; // How many more images can be added (max 3 total)
}

interface UseImageSyncArgs {
  businessId: string | undefined;
  dishes: MenuDish[];
  menus: MenuLayout[];
}

export const useImageSync = ({ businessId, dishes, menus }: UseImageSyncArgs) => {
  // Get all dishes across all menus for the business
  const allDishes = useLiveQuery<MenuDish[]>(
    async () => {
      if (!businessId) return [];
      return (await db.dishes.where('businessId').equals(businessId).toArray()) as MenuDish[];
    },
    [businessId]
  ) || [];

  // Group dishes by nameKey to find shared dishes
  const dishesByKey = useMemo(() => {
    const map = new Map<string, MenuDish[]>();
    (allDishes || []).forEach((dish) => {
      const nameKey = dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
      if (!nameKey) return;
      if (!map.has(nameKey)) {
        map.set(nameKey, []);
      }
      map.get(nameKey)!.push(dish);
    });
    return map;
  }, [allDishes]);

  // Build shared dish information
  const sharedDishes = useMemo<Map<string, SharedDishInfo>>(() => {
    const result = new Map<string, SharedDishInfo>();
    const menuMap = new Map<string, MenuLayout>();
    menus.forEach((m) => menuMap.set(m._id, m));

    dishesByKey.forEach((dishInstances, nameKey) => {
      // Only include dishes that exist in more than one menu
      if (dishInstances.length > 1) {
        const globalImageSet = new Set<string>();
        const instances = dishInstances.map((dish) => {
          const images = Array.isArray(dish.images) ? dish.images : [];
          images.forEach((img) => globalImageSet.add(img));
          const menu = menuMap.get(dish.menuId || '');
          return {
            dishId: dish._id,
            menuId: dish.menuId || '',
            menuName: menu?.name || 'Unknown Menu',
            currentImages: images,
          };
        });

        const globalImages = Array.from(globalImageSet);
        const availableSlots = Math.max(0, 3 - globalImages.length);

        result.set(nameKey, {
          nameKey,
          dishName: dishInstances[0].name || 'Unknown Dish',
          instances,
          globalImages,
          availableSlots,
        });
      }
    });

    return result;
  }, [dishesByKey, menus]);

  /**
   * Get shared dish information for a specific dish (by nameKey or dishId)
   */
  const getSharedDishInfo = (dishId: string, nameKey?: string): SharedDishInfo | null => {
    const dish = allDishes.find((d) => d._id === dishId);
    if (!dish) return null;

    const key = nameKey || dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
    return sharedDishes.get(key) || null;
  };

  /**
   * Calculate available image slots for a dish globally
   */
  const getAvailableSlots = (dishId: string, nameKey?: string): number => {
    const sharedInfo = getSharedDishInfo(dishId, nameKey);
    if (sharedInfo) {
      return sharedInfo.availableSlots;
    }

    // Not shared - check individual dish
    const dish = allDishes.find((d) => d._id === dishId);
    if (!dish) return 0;
    const currentImages = Array.isArray(dish.images) ? dish.images : [];
    return Math.max(0, 3 - currentImages.length);
  };

  /**
   * Get all dish IDs that share the same nameKey (for syncing)
   */
  const getSharedDishIds = (dishId: string, nameKey?: string): string[] => {
    const sharedInfo = getSharedDishInfo(dishId, nameKey);
    if (sharedInfo) {
      return sharedInfo.instances.map((i) => i.dishId);
    }
    return [dishId]; // Not shared - return only this dish
  };

  /**
   * Get global images for a dish (union of all images across all menu instances)
   */
  const getGlobalImages = (dishId: string, nameKey?: string): string[] => {
    const sharedInfo = getSharedDishInfo(dishId, nameKey);
    if (sharedInfo) {
      return sharedInfo.globalImages;
    }

    // Not shared - return individual dish images
    const dish = allDishes.find((d) => d._id === dishId);
    return Array.isArray(dish?.images) ? dish.images : [];
  };

  return {
    sharedDishes,
    getSharedDishInfo,
    getAvailableSlots,
    getSharedDishIds,
    getGlobalImages,
  };
};
