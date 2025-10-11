import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Category, DishType, Subcategory } from "./menu/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uid = () =>
  typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const dishNodeId = (id: string) => `dish-${id}`;
export const subNodeId = (id: string) => `sub-${id}`;
export const isDishNode = (nodeId: string) => nodeId.startsWith("dish-");
export const isSubNode = (nodeId: string) => nodeId.startsWith("sub-");
export const extractId = (nodeId: string) =>
  nodeId.split("-").slice(1).join("-");

export function findLocationByDishNodeId(
  dishNode: string,
  categories: Category[],
) {
  const id = extractId(dishNode);
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      const index = sub.dishes.findIndex((d) => d.id === id);
      if (index !== -1)
        return { catId: cat.id, subId: sub.id, index, dishId: id };
    }
  }
  return null;
}

export function resolveTarget(overId: string, categories: Category[]) {
  if (isDishNode(overId)) {
    const loc = findLocationByDishNodeId(overId, categories);
    if (!loc) return null;
    return {
      catId: loc.catId,
      subId: loc.subId,
      index: loc.index,
    };
  }
  if (isSubNode(overId)) {
    const subId = extractId(overId);
    for (const cat of categories) {
      const sub = cat.subcategories.find((s) => s.id === subId);
      if (sub)
        return { catId: cat.id, subId: sub.id, index: sub.dishes.length };
    }
  }
  return null;
}

export function normalizeToCategories(raw: any[]): Category[] {
  const cats: Category[] = [];

  for (const entry of raw || []) {
    const catName: string = entry.category || entry.name || "Uncategorized";
    const catId = uid();

    let subs: Subcategory[] = [];
    if (Array.isArray(entry.subcategories) && entry.subcategories.length) {
      subs = entry.subcategories.map((sc: any) => ({
        id: uid(),
        name: sc.subcategory || sc.name || "General",
        dishes: (Array.isArray(sc.dishes) ? sc.dishes : []).map((d: any) => ({
          id: uid(),
          dishName: String(d.dishName || d.name || "Unnamed"),
          price: Number(d.price ?? 0),
          dishType:
            (String(d.dishType || "veg").toLowerCase() as DishType) || "veg",
        })),
      }));
    } else {
      const defaultSub: Subcategory = {
        id: uid(),
        name: "General",
        dishes: (Array.isArray(entry.dishes) ? entry.dishes : []).map(
          (d: any) => ({
            id: uid(),
            dishName: String(d.dishName || d.name || "Unnamed"),
            price: Number(d.price ?? 0),
            dishType:
              (String(d.dishType || "veg").toLowerCase() as DishType) || "veg",
          }),
        ),
      };
      subs = [defaultSub];
    }

    cats.push({ id: catId, name: catName, subcategories: subs });
  }
  return cats;
}

export function mergeCategories(all: Category[]): Category[] {
  const byName = new Map<string, Category>();
  for (const cat of all) {
    const key = cat.name.trim().toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, { ...cat, id: uid() });
    } else {
      const existing = byName.get(key)!;
      existing.subcategories = [
        ...existing.subcategories,
        ...cat.subcategories.map((s) => ({ ...s, id: uid() })),
      ];
    }
  }
  return Array.from(byName.values());
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else reject(new Error("Failed to convert file to Base64."));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
