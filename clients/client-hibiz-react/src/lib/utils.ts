import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Category, DishType, Subcategory } from './menu/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uid = () => (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export const dishNodeId = (id: string) => `dish-${id}`;
export const subNodeId = (id: string) => `sub-${id}`;
export const isDishNode = (nodeId: string) => nodeId.startsWith('dish-');
export const isSubNode = (nodeId: string) => nodeId.startsWith('sub-');
export const extractId = (nodeId: string) => nodeId.split('-').slice(1).join('-');

// Safe number coercion (₹12,999.50, 1,299f, etc.)
export const toNumber = (x: unknown) => (typeof x === 'number' ? x : Number(String(x).replace(/[^\d.]/g, '')) || 0);

// ---- DnD helpers ----
export function findLocationByDishNodeId(dishNode: string, categories: Category[]) {
  const id = extractId(dishNode);
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      const index = sub.dishes.findIndex((d) => d.id === id);
      if (index !== -1) return { catId: cat.id, subId: sub.id, index, dishId: id };
    }
  }
  return null;
}

export function resolveTarget(overId: string, categories: Category[]) {
  if (isDishNode(overId)) {
    const loc = findLocationByDishNodeId(overId, categories);
    if (!loc) return null;
    return { catId: loc.catId, subId: loc.subId, index: loc.index };
  }
  if (isSubNode(overId)) {
    const subId = extractId(overId);
    for (const cat of categories) {
      const sub = cat.subcategories.find((s) => s.id === subId);
      if (sub) return { catId: cat.id, subId: sub.id, index: sub.dishes.length };
    }
  }
  return null;
}

// ---- NORMALIZER: subcategory[] -> Category[] (UI wrapper only) ----
export function normalizeSubcatArrayToCategories(raw: any[]): Category[] {
  const cats: Category[] = [];

  for (const entry of raw || []) {
    const subName = String(entry?.subcategory || 'Uncategorized').trim() || 'Uncategorized';

    const sub: Subcategory = {
      id: uid(),
      name: subName,
      dishes: (Array.isArray(entry?.dishes) ? entry.dishes : []).map((d: any) => ({
        id: uid(),
        dishName: String(d?.dishName || d?.name || 'Unnamed'),
        description: typeof d?.description === 'string' ? d.description.trim() : undefined,
        price: d?.price !== undefined ? toNumber(d.price) : undefined,
        dishType: (String(d?.dishType || 'veg').toLowerCase() as DishType) || 'veg',
        portions: Array.isArray(d?.portions)
          ? d.portions.map((p: any) => ({
              name: String(p?.name || 'Variant'),
              price: toNumber(p?.price),
              default: !!p?.default,
            }))
          : undefined,
      })),
    };

    cats.push({ id: uid(), name: subName, subcategories: [sub] });
  }

  return cats;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else reject(new Error('Failed to convert file to Base64.'));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
