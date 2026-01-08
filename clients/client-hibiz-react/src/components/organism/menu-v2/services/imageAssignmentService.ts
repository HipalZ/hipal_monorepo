/**
 * Service Layer: Image Assignment & Matching
 *
 * Handles automatic image-to-dish assignment using filename matching.
 * Integrates with slot management and label parsing.
 */

import type { MenuDish } from "../types";
import type { ProcessedImage } from "../store/useBulkImageUploadStore";
import { parseDishImageLabel } from "../domain/imageLabelParser";
import {
  getTargetSlot,
  isValidSlotAssignment,
  hasAvailableSlots,
  getDishImageCount,
} from "../domain/slotManager";
import { autoAssignImage } from "../utils/imageMatcher";

// ============================================================================
// Types
// ============================================================================

export interface AssignmentResult {
  imageId: string;
  dishId: string;
  dishName: string;
  slot: 1 | 2 | 3;
  confidence: number;
}

export interface AssignmentOptions {
  minConfidence?: number;
  respectSlotConstraints?: boolean;
  skipFullDishes?: boolean;
  // C) Fix: Callback to check available slots with pending assignments
  getAvailableSlotsWithPending?: (dishId: string, nameKey?: string) => number;
}

// ============================================================================
// Assignment Logic
// ============================================================================

/**
 * Auto-assigns a single image to a dish based on filename matching.
 *
 * Rules:
 * 1. Parse filename to extract base name and preferred slot
 * 2. Match base name to dish using fuzzy matching
 * 3. Check if dish has available slots
 * 4. Use preferred slot if available, otherwise use next available slot
 *
 * @param image - Processed image to assign
 * @param dishes - Available dishes
 * @param existingAssignments - Map of imageId -> dishId for conflict checking
 * @param options - Assignment options
 * @returns Assignment result if successful, null otherwise
 */
export function autoAssignImageToDish(
  image: ProcessedImage,
  dishes: MenuDish[],
  existingAssignments: Map<string, string> = new Map(),
  options: AssignmentOptions = {},
): AssignmentResult | null {
  const {
    minConfidence = 0.6,
    respectSlotConstraints = true,
    skipFullDishes = true,
    getAvailableSlotsWithPending,
  } = options;

  // Parse image label to get base name and preferred slot
  const parsed = parseDishImageLabel(image.filename);
  const baseName = parsed.baseName;
  const preferredSlot = parsed.slot;

  // Match filename (using base name) to dish
  const match = autoAssignImage(baseName, dishes, minConfidence);
  if (!match) {
    return null;
  }

  const dish = match.dish;

  // C) Fix: Check if dish is full using the same logic as manual assign
  if (skipFullDishes) {
    let availableSlots = 0;

    if (getAvailableSlotsWithPending) {
      // Use callback that accounts for pending assignments and shared dishes
      const nameKey =
        dish.nameKey ||
        dish.name?.toLowerCase().trim().replace(/\s+/g, " ") ||
        "";
      availableSlots = getAvailableSlotsWithPending(dish._id, nameKey);
    } else {
      // Fallback: use basic check (may skip dishes that actually have slots due to pending assignments)
      availableSlots = hasAvailableSlots(dish)
        ? 3 - getDishImageCount(dish)
        : 0;
    }

    if (availableSlots <= 0) {
      return null;
    }
  }

  // Get target slot
  let targetSlot: 1 | 2 | 3 | null;
  if (respectSlotConstraints) {
    targetSlot = getTargetSlot(dish, preferredSlot);
  } else {
    // Ignore slot constraints, just use preferred or next available
    targetSlot = preferredSlot ?? getTargetSlot(dish);
  }

  if (!targetSlot) {
    return null;
  }

  // Validate slot assignment
  if (respectSlotConstraints && !isValidSlotAssignment(dish, targetSlot)) {
    return null;
  }

  // Check if image is already assigned to this dish
  if (
    existingAssignments.has(image.id) &&
    existingAssignments.get(image.id) === dish._id
  ) {
    return null;
  }

  return {
    imageId: image.id,
    dishId: dish._id,
    dishName: dish.name || "Unknown",
    slot: targetSlot,
    confidence: match.confidence,
  };
}

/**
 * Batch auto-assigns multiple images to dishes.
 * Processes in batches to keep UI responsive.
 *
 * @param images - Images to assign
 * @param dishes - Available dishes
 * @param existingAssignments - Map of imageId -> dishId for conflict checking
 * @param options - Assignment options
 * @param batchSize - Number of images to process per batch (default: 10)
 * @param onProgress - Progress callback (processed, total)
 * @returns Promise resolving to array of assignment results
 */
export async function batchAutoAssignImages(
  images: ProcessedImage[],
  dishes: MenuDish[],
  existingAssignments: Map<string, string> = new Map(),
  options: AssignmentOptions = {},
  batchSize: number = 10,
  onProgress?: (processed: number, total: number) => void,
): Promise<AssignmentResult[]> {
  const results: AssignmentResult[] = [];
  const currentAssignments = new Map(existingAssignments);

  // Filter to unassigned, completed images
  const unassignedImages = images.filter(
    (img) => img.status === "completed" && !img.assignedDishId,
  );

  // Process in batches
  for (let i = 0; i < unassignedImages.length; i += batchSize) {
    const batch = unassignedImages.slice(
      i,
      Math.min(i + batchSize, unassignedImages.length),
    );

    for (const image of batch) {
      const assignment = autoAssignImageToDish(
        image,
        dishes,
        currentAssignments,
        options,
      );

      if (assignment) {
        results.push(assignment);
        // Update assignments map to prevent duplicates
        currentAssignments.set(assignment.imageId, assignment.dishId);
      }
    }

    // Report progress
    const processed = Math.min(i + batchSize, unassignedImages.length);
    onProgress?.(processed, unassignedImages.length);

    // Small delay between batches to keep UI responsive
    if (i + batchSize < unassignedImages.length) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  return results;
}
