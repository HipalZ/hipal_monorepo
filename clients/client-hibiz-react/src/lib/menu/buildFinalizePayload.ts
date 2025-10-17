import type {
  CategoryDraft,
  DishDraft,
  FinalizeResponse,
  CanonicalDishType,
  PortionType,
} from "./types";

export function buildCategoriesPayload(categories: CategoryDraft[]) {
  const seen = new Set<string>();
  const out: { name: string; hierarchy: "CHILD" }[] = [];
  for (const c of categories) {
    const key = c.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: toTitle(c.name), hierarchy: "CHILD" });
  }
  return out;
}

export function buildDishesPayload(
  dishes: DishDraft[],
  categoryIdMap: Record<string, string>,
) {
  const out: FinalizeResponse["payloads"]["dishes"] = [];
  for (const d of dishes) {
    const categoryIds = d.categoryRefs
      .map((r) => categoryIdMap[r])
      .filter(Boolean);
    if (categoryIds.length === 0) continue; // omit if no resolvable link

    const portions: PortionType[] =
      d.portions.length > 0
        ? d.portions
        : [
            {
              name: "Regular",
              price: Number(d.price ?? 0),
              default: true,
              portionTypes: d.dishTypes,
            },
          ];

    // ensure exactly one default
    const anyDefault = portions.some((p) => p.default);
    if (!anyDefault) portions[0].default = true;

    out.push({
      name: toTitle(d.name),
      price: d.price ?? null,
      visibility: d.visibility,
      availability: d.availability,
      dishTypes: d.dishTypes as CanonicalDishType[],
      description: clampDescription(d.description),
      categoryIds,
      portions,
    });
  }
  return out;
}

function toTitle(s: string) {
  return s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
function clampDescription(s: string) {
  const t = s.trim();
  if (t.length < 50) return (t + " ".repeat(50)).slice(0, 50);
  if (t.length > 100) return t.slice(0, 100);
  return t;
}
