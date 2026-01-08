/**
 * Payload Builders for Menu V2
 *
 * Converts form state to server-expected payload format.
 * Ensures all validation requirements are met.
 */

import type { DishFormValues } from "../validations";
import type { MenuDish } from "../types";

// Generate UUID v4
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Build DISH payload for server
 * Rules:
 * - dishTypes: array (not string)
 * - price: must be > 0 (if portions exist, use default portion price)
 * - portions: must have default, portionTypes array
 * - images: array of URL strings (<=100 chars each)
 * - description: >=10 chars or empty
 */
export function buildDishPayload(
  formData: DishFormValues,
  menuId: string,
  uploadedImageUrls: string[] = [], // URLs from uploaded images
  existingDish?: MenuDish,
): Record<string, unknown> {
  // Images: only URL strings (omit if empty)
  const images = (uploadedImageUrls || formData.images || []).filter(
    (url) => typeof url === "string" && url.length <= 100 && url.length > 0,
  );

  // Portions: ensure default and portionTypes (DO NOT include _id when creating)
  const portions = (formData.portions || []).map((p, index) => ({
    name: p.name,
    price: Math.max(0.01, p.price || 0), // Ensure > 0
    default: p.default ?? index === 0, // First portion is default if not specified
    portionTypes: p.portionTypes || [formData.dishType], // Default to dish type
    // DO NOT include _id when creating (server will generate)
  }));

  // Price: must be > 0
  // If portions exist, use default portion price (or first portion)
  let price = formData.price || 0;
  if (portions.length > 0) {
    const defaultPortion = portions.find((p) => p.default) || portions[0];
    price = defaultPortion.price;
  }
  if (price <= 0) {
    price = 1; // Minimum price
  }

  // Description: >=10 chars or empty
  const description =
    formData.description && formData.description.length >= 10
      ? formData.description
      : "";

  // Build payload and filter out empty values (except images which should be empty array)
  const payload: Record<string, unknown> = {
    name: formData.name,
    dishTypes: [formData.dishType], // Server expects array
    price,
    availability: formData.availability ?? true,
    visibility: formData.visibility ?? true,
    images: images.length > 0 ? images : [], // Always send empty array if no images
  };

  // Only include description if it's not empty
  if (description) {
    payload.description = description;
  }

  // Only include portions if they exist
  if (portions.length > 0) {
    payload.portions = portions;
  }

  // Only include arrays if they have items
  if (formData.categoryIds && formData.categoryIds.length > 0) {
    payload.categoryIds = formData.categoryIds;
  }

  if (formData.addonIds && formData.addonIds.length > 0) {
    payload.addOnIds = formData.addonIds; // Server uses addOnIds (capital O)
  }

  if (formData.tags && formData.tags.length > 0) {
    payload.tags = formData.tags;
  }

  if (formData.recommendedDishIds && formData.recommendedDishIds.length > 0) {
    payload.recommendationIds = formData.recommendedDishIds; // Server uses recommendationIds
  }

  // Only include kitchenId if it exists
  if (formData.kitchenId) {
    payload.kitchenId = formData.kitchenId;
  }

  // Preserve existing timings or use empty array
  if (existingDish?.timings && existingDish.timings.length > 0) {
    payload.timings = existingDish.timings;
  }

  // avgPrepTime is required
  payload.avgPrepTime = existingDish?.avgPrepTime || 0;

  return payload;
}

/**
 * Build ADDON payload for server
 * Rules:
 * - Use addOnMaxQuantity (not maxChoice)
 * - compulsory = minChoice
 * - choiceType: NUMBER or CHECKBOX
 * - choices: must have uuid, choiceDishType array, visibility, availability, choiceMaxQuantity
 * - If CHECKBOX: addOnMaxQuantity=1, each choiceMaxQuantity=1
 */
export function buildAddonPayload(
  formData: {
    name: string;
    minChoice: number;
    maxChoice: number;
    choiceType: "NUMBER" | "CHECKBOX";
    choices: Array<{
      name: string;
      price: number;
      _id?: string;
      choiceDishType?: string | string[];
    }>;
  },
  menuId: string,
  dishIds: string[] = [], // Linked dish IDs
): Record<string, unknown> {
  // If CHECKBOX, enforce constraints
  const isCheckbox = formData.choiceType === "CHECKBOX";
  const addOnMaxQuantity = isCheckbox ? 1 : formData.maxChoice;

  // Build choices with required fields (DO NOT include _id in payload)
  const choices = formData.choices.map((c) => {
    const choiceMaxQuantity = isCheckbox
      ? 1
      : (c as any).choiceMaxQuantity || 1;
    const choiceDishType = Array.isArray(c.choiceDishType)
      ? c.choiceDishType
      : c.choiceDishType
        ? [c.choiceDishType]
        : [];

    return {
      uuid: c._id || generateUUID(), // Required by server (use _id as uuid if exists, otherwise generate)
      name: c.name,
      price: Math.max(0, c.price || 0),
      description: "", // Optional field
      visibility: true,
      availability: true,
      choiceMaxQuantity,
      choiceDishType,
      // DO NOT include _id in payload
    };
  });

  // Build payload and filter out empty values
  const payload: Record<string, unknown> = {
    name: formData.name,
    compulsory: formData.minChoice,
    addOnMaxQuantity,
    choiceType: formData.choiceType,
    choices,
    availability: true,
    visibility: true,
  };

  // Only include dishIds if they exist
  if (dishIds && dishIds.length > 0) {
    payload.dishIds = dishIds;
  }

  return payload;
}

/**
 * Build CATEGORY payload for server
 * Rules:
 * - timings: array of objects (not categoryTimings string)
 * - coverImage: URL string <=100 chars (or omit if empty)
 * - hierarchy: "PARENT" | "CHILD"
 */
export function buildCategoryPayload(
  formData: {
    name: string;
    hierarchy: "PARENT" | "CHILD";
    visibility: boolean;
    coverImage?: string;
    parentId?: string;
    categoryTimings?: string;
  },
  menuId: string,
  uploadedCoverUrl?: string, // URL from uploaded cover image
): Record<string, unknown> {
  // coverImage: must be valid URL (>=10 chars) or omit
  const coverImage = uploadedCoverUrl || formData.coverImage;
  const validCoverImage =
    coverImage && coverImage.length >= 10 && coverImage.length <= 100
      ? coverImage
      : undefined;

  // timings: parse from categoryTimings or use default
  // Server expects array of { day, start, end }
  let timings: Array<{ day: number; start: number; end: number }> = [];

  if (formData.categoryTimings && formData.categoryTimings.length >= 3) {
    try {
      const parsed = JSON.parse(formData.categoryTimings);
      if (Array.isArray(parsed)) {
        timings = parsed;
      }
    } catch {
      // Invalid JSON, use default
    }
  }

  // Default: "all day" slot if no timings
  if (timings.length === 0) {
    timings = [{ day: -1, start: 0, end: 1440 }];
  }

  // Build payload and filter out empty values
  const payload: Record<string, unknown> = {
    name: formData.name,
    hierarchy: formData.hierarchy,
    visibility: formData.visibility,
    timings,
  };

  // Only include coverImage if it exists
  if (validCoverImage) {
    payload.coverImage = validCoverImage;
  }

  // Only include parentCategoryIds if they exist
  if (formData.hierarchy === "CHILD" && formData.parentId) {
    payload.parentCategoryIds = [formData.parentId];
  }

  // dishIds is always empty array for categories, but we can omit it if empty
  // (keeping it for consistency with server expectations)

  return payload;
}
