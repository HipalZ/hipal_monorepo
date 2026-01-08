/**
 * Domain Utility: Image Slot Manager
 * 
 * Manages image slots (1-3) for dishes.
 * Provides utilities to find available slots and validate slot assignments.
 */

import type { MenuDish } from '../types';

export type ImageSlot = 1 | 2 | 3;

export const MAX_IMAGES_PER_DISH = 3;
export const VALID_SLOTS: ImageSlot[] = [1, 2, 3];

/**
 * Gets the current image count for a dish.
 * 
 * @param dish - The dish to check
 * @returns Number of images (0-3)
 */
export function getDishImageCount(dish: MenuDish): number {
  if (!dish.images || !Array.isArray(dish.images)) {
    return 0;
  }
  return dish.images.filter((img): img is string => typeof img === 'string' && img.length > 0).length;
}

/**
 * Checks if a dish has available slots for more images.
 * 
 * @param dish - The dish to check
 * @returns true if dish has less than 3 images
 */
export function hasAvailableSlots(dish: MenuDish): boolean {
  return getDishImageCount(dish) < MAX_IMAGES_PER_DISH;
}

/**
 * Gets all used slots for a dish.
 * 
 * @param dish - The dish to check
 * @returns Array of used slot numbers (1, 2, or 3)
 */
export function getUsedSlots(dish: MenuDish): ImageSlot[] {
  const count = getDishImageCount(dish);
  return VALID_SLOTS.slice(0, count);
}

/**
 * Gets all available slots for a dish.
 * 
 * @param dish - The dish to check
 * @returns Array of available slot numbers
 */
export function getAvailableSlots(dish: MenuDish): ImageSlot[] {
  const usedSlots = getUsedSlots(dish);
  return VALID_SLOTS.filter((slot) => !usedSlots.includes(slot));
}

/**
 * Finds the next available slot for a dish.
 * 
 * @param dish - The dish to find slot for
 * @returns Next available slot (1, 2, or 3), or null if all slots are full
 */
export function getNextAvailableSlot(dish: MenuDish): ImageSlot | null {
  const availableSlots = getAvailableSlots(dish);
  return availableSlots.length > 0 ? availableSlots[0] : null;
}

/**
 * Finds the target slot for a dish based on preferred slot and availability.
 * 
 * Rules:
 * - If preferred slot is provided and available, use it
 * - If preferred slot is provided but unavailable, use next available slot
 * - If no preferred slot, use next available slot
 * - If all slots are full, return null
 * 
 * @param dish - The dish to find slot for
 * @param preferredSlot - Optional preferred slot (from image label)
 * @returns Target slot (1, 2, or 3), or null if all slots are full
 */
export function getTargetSlot(dish: MenuDish, preferredSlot?: ImageSlot): ImageSlot | null {
  if (!hasAvailableSlots(dish)) {
    return null;
  }

  const availableSlots = getAvailableSlots(dish);

  // If preferred slot is specified and available, use it
  if (preferredSlot !== undefined && availableSlots.includes(preferredSlot)) {
    return preferredSlot;
  }

  // If preferred slot is specified but not available, use next available
  if (preferredSlot !== undefined && !availableSlots.includes(preferredSlot)) {
    return availableSlots[0] ?? null;
  }

  // No preferred slot, use next available
  return availableSlots[0] ?? null;
}

/**
 * Validates if a slot assignment is valid.
 * 
 * @param dish - The dish to validate
 * @param slot - The slot to check
 * @returns true if slot is valid and available
 */
export function isValidSlotAssignment(dish: MenuDish, slot: ImageSlot): boolean {
  if (slot < 1 || slot > 3) {
    return false;
  }

  const usedSlots = getUsedSlots(dish);
  return !usedSlots.includes(slot);
}

/**
 * Gets the images array with a new image added at the specified slot.
 * Maintains order: [slot1, slot2, slot3], with null/undefined for empty slots.
 * 
 * @param currentImages - Current images array
 * @param newImageUrl - New image URL to add
 * @param slot - Target slot (1, 2, or 3)
 * @returns New images array with image at specified slot
 */
export function addImageToSlot(
  currentImages: string[],
  newImageUrl: string,
  slot: ImageSlot,
): string[] {
  // Ensure array has length 3
  const images: (string | undefined)[] = [...currentImages];
  while (images.length < 3) {
    images.push(undefined);
  }

  // Set image at slot index (slot 1 = index 0, slot 2 = index 1, slot 3 = index 2)
  images[slot - 1] = newImageUrl;

  // Filter out undefined/null and return
  return images.filter((img): img is string => typeof img === 'string' && img.length > 0);
}

/**
 * Merges new images with existing images, respecting slot constraints.
 * 
 * @param existingImages - Current images array
 * @param newImageUrls - New image URLs to add
 * @returns Merged images array (max 3 images)
 */
export function mergeImages(existingImages: string[], newImageUrls: string[]): string[] {
  // Combine and deduplicate
  const allImages = new Set([...existingImages, ...newImageUrls]);
  const merged = Array.from(allImages).filter((img): img is string => typeof img === 'string' && img.length > 0);

  // Enforce max 3 images
  return merged.slice(0, MAX_IMAGES_PER_DISH);
}
