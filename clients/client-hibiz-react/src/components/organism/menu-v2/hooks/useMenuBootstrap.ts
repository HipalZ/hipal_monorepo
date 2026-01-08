// useMenuBootstrap.ts
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { db } from "../db/menu.database";
import { useMenuUIStore } from "../store/useMenuUIStore";
import { ZonesRepository } from "../db/ZonesRepository";
import { DishZoneKitchenRepository } from "../db/DishZoneKitchenRepository";
import toast from "react-hot-toast";

const toKey = (s: string) =>
  (s || "").trim().toLowerCase().replace(/\s+/g, " ");

export const useMenuBootstrap = (businessId: string) => {
  const setLastPulledAt = useMenuUIStore((s) => s.setLastPulledAt);

  const bootstrapMenu = useCallback(async () => {
    if (!businessId) throw new Error("Business ID is required");

    try {
      const [dishesRes, categoriesRes, addonsRes, menusRes, kitchensRes, zonesRes] =
        await Promise.all([
          apiRpc.dishes.$get({ query: { businessId } }),
          apiRpc.categories.$get({ query: { businessId } }),
          apiRpc.addons.$get({ query: { businessId } }),
          apiRpc.menu.menuByBusiness[":businessId"].$get({
            param: { businessId },
          }),
          apiRpc.kitchen.kitchenByBusiness.$get({ query: { businessId } }),
          apiRpc.zones_and_tables.zones[':businessId'].$get({
            param: { businessId },
          }).catch(() => ({ json: async () => ({ data: [], err: false, message: "" }) })), // Graceful fallback
        ]);

      const [dishesData, categoriesData, addonsData, menusData, kitchensData, zonesData] =
        await Promise.all([
          dishesRes.json(),
          categoriesRes.json(),
          addonsRes.json(),
          menusRes.json(),
          kitchensRes.json(),
          zonesRes.json(),
        ]);

      const dishes = (dishesData.data || []).map((d: any) => ({
        ...d,
        nameKey: toKey(d.name),
      }));
      const categories = (categoriesData.data || []).map((c: any) => ({
        ...c,
        nameKey: toKey(c.name),
      }));
      const addons = (addonsData.data || []).map((a: any) => ({
        ...a,
        nameKey: toKey(a.name),
      }));
      const menus = menusData.data || [];
      console.log("menus", menus);
      const kitchens = kitchensData.data || [];
      console.log("kitchens", kitchens);
      const zones = (zonesData.data || []).map((z: any) => ({
        ...z,
        _id: z._id || z.zoneId, // Use MongoDB _id as primary key
        kitchenIds: z.kitchenIds || [],
        isDeleted: z.isDeleted || false,
        active: z.active !== false,
        visibility: z.visibility !== false,
      }));

      await db.transaction(
        "rw",
        db.dishes,
        db.categories,
        db.addons,
        db.menus,
        db.kitchens,
        db.zones,
        async () => {
          await Promise.all([
            db.dishes.clear(),
            db.categories.clear(),
            db.addons.clear(),
            db.menus.clear(),
            db.kitchens.clear(),
            ZonesRepository.clear(businessId),
          ]);

          await Promise.all([
            dishes.length ? db.dishes.bulkPut(dishes) : Promise.resolve(),
            categories.length
              ? db.categories.bulkPut(categories)
              : Promise.resolve(),
            addons.length ? db.addons.bulkPut(addons) : Promise.resolve(),
            menus.length ? db.menus.bulkPut(menus) : Promise.resolve(),
            kitchens.length ? db.kitchens.bulkPut(kitchens) : Promise.resolve(),
            zones.length ? ZonesRepository.upsertZones(zones) : Promise.resolve(),
          ]);
        },
      );

      setLastPulledAt(Date.now());
      toast.success("Menu data loaded successfully");

      return { dishes, categories, addons, menus, kitchens, zones };
    } catch (error) {
      toast.error("Failed to load menu data");
      throw error;
    }
  }, [businessId, setLastPulledAt]);

  return useQuery({
    queryKey: ["menuBootstrap", businessId],
    queryFn: bootstrapMenu,
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  });
};
