import type { CanonicalDishType } from "./types";

const mapping: Record<string, CanonicalDishType> = {
  veg: "VEG",
  vegetarian: "VEG",
  paneer: "VEG",
  nonveg: "NON_VEG",
  "non-veg": "NON_VEG",
  "non veg": "NON_VEG",
  non_veg: "NON_VEG",
  nonVeg: "NON_VEG",
  chicken: "NON_VEG",
  mutton: "NON_VEG",
  fish: "NON_VEG",
  prawn: "NON_VEG",
  egg: "EGG",
  eggetarian: "EGG",
  vegan: "VEGAN",
  "plant-based": "VEGAN",
  alcohol: "ALCOHOL",
  beer: "ALCOHOL",
  wine: "ALCOHOL",
  whisky: "ALCOHOL",
  non_alcohol: "NON_ALCOHOL",
  mocktail: "NON_ALCOHOL",
  "soft drink": "NON_ALCOHOL",
  juice: "NON_ALCOHOL",
  coffee: "NON_ALCOHOL",
  tea: "NON_ALCOHOL",
  "gluten free": "GLUTEN_FREE",
  gf: "GLUTEN_FREE",
  glutenfree: "GLUTEN_FREE",
};

export function normalizeDishTypes(hints: string[]): CanonicalDishType[] {
  const out = new Set<CanonicalDishType>();
  for (const h of hints) {
    const key = h.trim().toLowerCase();
    if (mapping[key]) out.add(mapping[key]);
  }
  if (out.size === 0) return ["MIX"];
  return Array.from(out);
}
