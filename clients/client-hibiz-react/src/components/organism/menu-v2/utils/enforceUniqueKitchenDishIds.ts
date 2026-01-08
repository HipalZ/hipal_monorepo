/**
 * Enforce unique dishIds across kitchens
 *
 * Ensures no dish can be assigned to multiple kitchens simultaneously.
 * When a kitchen claims dishes, they are automatically removed from other kitchens.
 */

export interface Kitchen {
  _id: string;
  dishIds: string[];
  [key: string]: unknown;
}

export interface EnforceUniqueKitchenDishIdsParams {
  /** All kitchens in the same businessId + menuId scope */
  kitchens: Kitchen[];
  /** The kitchen being created/updated */
  targetKitchenId: string;
  /** The final dish list for the target kitchen */
  nextDishIds: string[];
  /** Optional: dishes explicitly removed (for telemetry) */
  removedDishIds?: string[];
}

export interface EnforceUniqueKitchenDishIdsResult {
  /** Updated kitchens with unique dishIds */
  updatedKitchens: Kitchen[];
  /** Map of dishId -> kitchenId assignments (empty string = unassigned) */
  dishKitchenAssignments: Record<string, string>;
  /** Map of kitchenId -> dishIds that were removed from that kitchen */
  removedFromOtherKitchens: Record<string, string[]>;
}

/**
 * Pure function to enforce unique dishIds across kitchens
 *
 * @example
 * const result = enforceUniqueKitchenDishIds({
 *   kitchens: [
 *     { _id: 'k1', dishIds: ['d1', 'd2', 'd3', 'd4', 'd5'] },
 *     { _id: 'k2', dishIds: ['d6', 'd7'] }
 *   ],
 *   targetKitchenId: 'k2',
 *   nextDishIds: ['d1', 'd2', 'd6', 'd7', 'd8']
 * });
 * // Result:
 * // k1.dishIds = ['d3', 'd4', 'd5'] (d1, d2 stolen by k2)
 * // k2.dishIds = ['d1', 'd2', 'd6', 'd7', 'd8']
 * // dishKitchenAssignments = { d1: 'k2', d2: 'k2', d3: 'k1', ... }
 * // removedFromOtherKitchens = { k1: ['d1', 'd2'] }
 */
export function enforceUniqueKitchenDishIds(
  params: EnforceUniqueKitchenDishIdsParams,
): EnforceUniqueKitchenDishIdsResult {
  const {
    kitchens,
    targetKitchenId,
    nextDishIds,
    removedDishIds = [],
  } = params;

  // Track which dishes were removed from which kitchens
  const removedFromOtherKitchens: Record<string, string[]> = {};

  // Build the final dish-to-kitchen assignment map
  const dishKitchenAssignments: Record<string, string> = {};

  // Create a Set for O(1) lookup
  const nextDishIdsSet = new Set(nextDishIds);

  // Process all kitchens
  const updatedKitchens = kitchens.map((kitchen) => {
    if (kitchen._id === targetKitchenId) {
      // This is the target kitchen - set its dishIds to nextDishIds
      const updatedKitchen = {
        ...kitchen,
        dishIds: [...nextDishIds], // Create new array to avoid mutation
      };

      // Record assignments for target kitchen
      for (const dishId of nextDishIds) {
        dishKitchenAssignments[dishId] = targetKitchenId;
      }

      return updatedKitchen;
    } else {
      // This is another kitchen - remove any dishes that are now in target kitchen
      const originalDishIds = kitchen.dishIds || [];
      const stolenDishIds: string[] = [];
      const remainingDishIds: string[] = [];

      for (const dishId of originalDishIds) {
        if (nextDishIdsSet.has(dishId)) {
          // This dish is being stolen by the target kitchen
          stolenDishIds.push(dishId);
        } else {
          // This dish remains in this kitchen
          remainingDishIds.push(dishId);
          dishKitchenAssignments[dishId] = kitchen._id;
        }
      }

      // Track what was removed from this kitchen
      if (stolenDishIds.length > 0) {
        removedFromOtherKitchens[kitchen._id] = stolenDishIds;
      }

      return {
        ...kitchen,
        dishIds: remainingDishIds,
      };
    }
  });

  // Mark explicitly removed dishes as unassigned
  for (const dishId of removedDishIds) {
    if (!nextDishIdsSet.has(dishId)) {
      dishKitchenAssignments[dishId] = "";
    }
  }

  return {
    updatedKitchens,
    dishKitchenAssignments,
    removedFromOtherKitchens,
  };
}

/**
 * Example test case (for reference/documentation)
 */
export function testEnforceUniqueKitchenDishIds() {
  // Setup: k1 has dishes 1-20, k2 has dishes 21-25
  const kitchens: Kitchen[] = [
    {
      _id: "k1",
      dishIds: Array.from({ length: 20 }, (_, i) => `d${i + 1}`),
    },
    {
      _id: "k2",
      dishIds: ["d21", "d22", "d23", "d24", "d25"],
    },
  ];

  // Action: Create/update k2 to have dishes 1-10 (steal from k1)
  const result = enforceUniqueKitchenDishIds({
    kitchens,
    targetKitchenId: "k2",
    nextDishIds: Array.from({ length: 10 }, (_, i) => `d${i + 1}`),
  });

  // Assertions
  const k1 = result.updatedKitchens.find((k) => k._id === "k1");
  const k2 = result.updatedKitchens.find((k) => k._id === "k2");

  console.assert(
    k1?.dishIds.length === 10,
    "k1 should have 10 dishes remaining (d11-d20)",
  );
  console.assert(
    k2?.dishIds.length === 10,
    "k2 should have 10 dishes (d1-d10)",
  );
  console.assert(
    result.removedFromOtherKitchens.k1?.length === 10,
    "k1 should have lost 10 dishes to k2",
  );
  console.assert(
    result.dishKitchenAssignments.d1 === "k2",
    "d1 should be assigned to k2",
  );
  console.assert(
    result.dishKitchenAssignments.d11 === "k1",
    "d11 should remain with k1",
  );

  return result;
}
