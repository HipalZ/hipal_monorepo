import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/menu.database";
import { useMenuUIStore } from "../store/useMenuUIStore";
import type {
  MenuDish,
  MenuCategory,
  MenuAddon,
  MenuLayout,
  MenuViewData,
} from "../types";

interface UseMenuViewDataArgs {
  businessId: string | undefined;
}

export const useMenuViewData = ({
  businessId,
}: UseMenuViewDataArgs): MenuViewData => {
  const selectedMenuId = useMenuUIStore((s) => s.selectedMenuId);
  const mergeMode = useMenuUIStore((s) => s.mergeMode);
  const mergedMenuIds = useMenuUIStore((s) => s.mergedMenuIds);

  const menus = useLiveQuery<MenuLayout[]>(
    () => db.menus.toArray() as Promise<MenuLayout[]>,
    [],
  );

  // Determine effective menu IDs to filter by
  const effectiveMenuIds = useMemo(() => {
    if (selectedMenuId === "ALL") {
      if (mergeMode) return mergedMenuIds;
      return []; // empty if ALL and not merged
    }
    return [selectedMenuId];
  }, [selectedMenuId, mergeMode, mergedMenuIds]);

  const shouldFetch =
    selectedMenuId !== "ALL" || (selectedMenuId === "ALL" && mergeMode);

  // Fetch all dishes
  const allDishes = useLiveQuery<MenuDish[]>(async () => {
    if (!businessId || !shouldFetch) return [];

    // Optimization: If single menu, filter directly
    if (effectiveMenuIds.length === 1) {
      return (await db.dishes
        .where("businessId")
        .equals(businessId)
        .filter((d) => d.menuId === effectiveMenuIds[0])
        .toArray()) as MenuDish[];
    }

    // If multiple menus (merge mode), fetch all for business then filter in JS
    // (Dexie 'anyOf' is good but 'businessId' index is better for first cut)
    const all = (await db.dishes
      .where("businessId")
      .equals(businessId)
      .toArray()) as MenuDish[];
    return all.filter((d) => effectiveMenuIds.includes(d.menuId));
  }, [businessId, effectiveMenuIds, shouldFetch]);

  // Fetch all categories
  const allCategories = useLiveQuery<MenuCategory[]>(async () => {
    if (!businessId || !shouldFetch) return [];

    if (effectiveMenuIds.length === 1) {
      return (await db.categories
        .where("businessId")
        .equals(businessId)
        .filter((c) => c.menuId === effectiveMenuIds[0])
        .toArray()) as MenuCategory[];
    }

    const all = (await db.categories
      .where("businessId")
      .equals(businessId)
      .toArray()) as MenuCategory[];
    return all.filter((c) => effectiveMenuIds.includes(c.menuId));
  }, [businessId, effectiveMenuIds, shouldFetch]);

  // Resolve category→dish relationships using category.dishIds[] and dish.categoryIds[]
  const dishesByCategoryId = useMemo<Map<string, MenuDish[]>>(() => {
    const map = new Map<string, MenuDish[]>();
    if (!allDishes || !allCategories) return map;

    // Primary: use category.dishIds[]
    allCategories.forEach((cat) => {
      const dishIds = cat.dishIds || [];
      if (Array.isArray(dishIds) && dishIds.length > 0) {
        const catDishes = allDishes.filter((d) => {
          const dishId = typeof d._id === "string" ? d._id : String(d._id);
          return dishIds.some((id) => {
            const catDishId = typeof id === "string" ? id : String(id);
            return dishId === catDishId;
          });
        });
        map.set(cat._id || "", catDishes);
      }
    });

    // Fallback: use dish.categoryIds[] to resolve any missing links
    allDishes.forEach((dish) => {
      const dishCategoryIds = dish.categoryIds || [];
      if (Array.isArray(dishCategoryIds) && dishCategoryIds.length > 0) {
        dishCategoryIds.forEach((catId) => {
          const categoryId = typeof catId === "string" ? catId : String(catId);
          if (!map.has(categoryId)) {
            map.set(categoryId, []);
          }
          const existing = map.get(categoryId)!;
          if (!existing.find((d) => d._id === dish._id)) {
            existing.push(dish);
          }
        });
      }
    });

    return map;
  }, [allDishes, allCategories]);

  // Compute dish count per category
  const dishCountByCategoryId = useMemo<Map<string, number>>(() => {
    const counts = new Map<string, number>();
    dishesByCategoryId.forEach((dishes, categoryId) => {
      counts.set(categoryId, dishes.length);
    });
    return counts;
  }, [dishesByCategoryId]);

  // Group dishes by nameKey for bulk edits (ONLY in merge mode)
  const dishesGroupedByNameKey = useMemo<Map<string, MenuDish[]>>(() => {
    if (!mergeMode || !allDishes) return new Map();
    const grouped = new Map<string, MenuDish[]>();
    allDishes.forEach((dish) => {
      const nameKey =
        dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, " ");
      if (!nameKey) return;
      if (!grouped.has(nameKey)) {
        grouped.set(nameKey, []);
      }
      grouped.get(nameKey)!.push(dish);
    });
    return grouped;
  }, [allDishes, mergeMode]);

  const parentCategories = useMemo<MenuCategory[]>(
    () =>
      (allCategories || []).filter(
        (c) => c.hierarchy === "PARENT" || !c.parentId,
      ),
    [allCategories],
  );

  const childCategories = useMemo<MenuCategory[]>(
    () =>
      (allCategories || []).filter(
        (c) => c.hierarchy === "CHILD" || !!c.parentId,
      ),
    [allCategories],
  );

  const addons = useLiveQuery<MenuAddon[]>(async () => {
    if (!businessId || !shouldFetch) return [];

    if (effectiveMenuIds.length === 1) {
      return (await db.addons
        .where("businessId")
        .equals(businessId)
        .filter((a) => a.menuId === effectiveMenuIds[0])
        .toArray()) as MenuAddon[];
    }

    const all = (await db.addons
      .where("businessId")
      .equals(businessId)
      .toArray()) as MenuAddon[];
    return all.filter((a) => effectiveMenuIds.includes(a.menuId));
  }, [businessId, effectiveMenuIds, shouldFetch]);

  const addonGroups = useMemo(() => {
    const groups = (addons || []).filter(
      (a) => (a as MenuAddon & { hierarchy?: string }).hierarchy === "parent",
    );
    const children = (addons || []).filter(
      (a) => (a as MenuAddon & { hierarchy?: string }).hierarchy !== "parent",
    );
    const grouped = groups.map((g) => {
      const items = children.filter(
        (c) => (c as MenuAddon & { parentId?: string }).parentId === g._id,
      );
      return {
        group: g,
        items,
      };
    });
    return grouped;
  }, [addons]);

  return {
    selectedMenuId,
    menus: menus || [],
    dishes: allDishes || [],
    dishesGroupedByNameKey,
    categories: allCategories || [],
    parentCategories,
    childCategories,
    dishesByCategoryId,
    dishCountByCategoryId,
    addons: addons || [],
    addonGroups,
    isLoading: allDishes === undefined || allCategories === undefined,
  };
};
