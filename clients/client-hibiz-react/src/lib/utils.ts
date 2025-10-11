import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CategoryDraft, DishType } from "./menu/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `temp_${Math.random().toString(36).slice(2)}`;

export function toTitleCase(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function cleanPrice(priceStr: string | number): number {
  if (typeof priceStr === "number") return Math.round(priceStr * 100) / 100;
  const cleaned = priceStr.replace(/[₹Rs.,\s]/g, "");
  const num = Number.parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

export function normalizeDishType(input: string): DishType {
  const lower = input.toLowerCase().trim();

  // NON_VEG variants
  if (
    [
      "nonveg",
      "non-veg",
      "non veg",
      "chicken",
      "mutton",
      "fish",
      "prawn",
      "non_veg",
    ].includes(lower)
  ) {
    return "NON_VEG";
  }

  // VEG variants
  if (["veg", "vegetarian", "paneer"].includes(lower)) {
    return "VEG";
  }

  // EGG variants
  if (["egg", "eggetarian"].includes(lower)) {
    return "EGG";
  }

  // VEGAN variants
  if (["vegan", "plant-based"].includes(lower)) {
    return "VEGAN";
  }

  // ALCOHOL variants
  if (["alcohol", "beer", "wine", "whisky"].includes(lower)) {
    return "ALCOHOL";
  }

  // NON_ALCOHOL variants
  if (
    [
      "mocktail",
      "soft drink",
      "juice",
      "coffee",
      "tea",
      "non_alcohol",
    ].includes(lower)
  ) {
    return "NON_ALCOHOL";
  }

  // GLUTEN_FREE variants
  if (["gluten free", "gf", "glutenfree"].includes(lower)) {
    return "GLUTEN_FREE";
  }

  // Default to MIX if unclear
  return "MIX";
}

export function generateDescription(
  dishName: string,
  dishTypes: DishType[],
): string {
  const typeDesc = dishTypes.includes("VEG")
    ? "vegetarian"
    : dishTypes.includes("NON_VEG")
      ? "non-vegetarian"
      : "";
  const desc = `Delicious ${typeDesc} ${dishName.toLowerCase()} prepared with fresh ingredients.`;
  return desc.slice(0, 100);
}

export function deduplicateCategories(
  categories: CategoryDraft[],
): CategoryDraft[] {
  const map = new Map<string, CategoryDraft>();

  for (const cat of categories) {
    const key = cat.name.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, cat);
    }
  }

  return Array.from(map.values());
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
