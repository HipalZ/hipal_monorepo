/**
 * Domain Utility: Dish Image Label Parser
 * 
 * Parses dish image labels to extract base name and slot suffix.
 * Handles slot detection for "-1", "-2", "-3" patterns.
 */

export interface ParsedDishImageLabel {
  baseName: string;
  slot?: 1 | 2 | 3;
}

/**
 * Parses a dish image label to extract base name and optional slot suffix.
 * 
 * Rules:
 * - Slot suffix must be "-1", "-2", or "-3" at the end
 * - Pattern: "{baseName} {space}-{slot}" where slot is 1, 2, or 3
 * - If slot is not 1-3, treat entire label as base name
 * - Handles multiple spaces and trims whitespace
 * 
 * @param label - The dish image label to parse (e.g., "Chicken 65-1", "Paneer-65")
 * @returns Parsed result with baseName and optional slot
 * 
 * @example
 * parseDishImageLabel("Chicken 65-1") => { baseName: "Chicken 65", slot: 1 }
 * parseDishImageLabel("Chicken 65-2") => { baseName: "Chicken 65", slot: 2 }
 * parseDishImageLabel("Chicken 65") => { baseName: "Chicken 65", slot: undefined }
 * parseDishImageLabel("Paneer-65") => { baseName: "Paneer-65", slot: undefined }
 * parseDishImageLabel("Teachers 50-1") => { baseName: "Teachers 50", slot: 1 }
 */
export function parseDishImageLabel(label: string): ParsedDishImageLabel {
  if (!label || typeof label !== 'string') {
    return { baseName: label || '', slot: undefined };
  }

  // Trim and normalize whitespace (replace multiple spaces with single space)
  const normalized = label.trim().replace(/\s+/g, ' ');

  // Match pattern: ends with " -{1|2|3}"
  // Capture: (base name)(space)-(slot number)
  const slotPattern = /^(.+?)\s+-([123])$/;

  const match = normalized.match(slotPattern);

  if (match) {
    const [, baseName, slotStr] = match;
    const slot = Number.parseInt(slotStr, 10) as 1 | 2 | 3;
    
    // Validate slot is actually 1, 2, or 3 (safety check)
    if (slot >= 1 && slot <= 3) {
      return {
        baseName: baseName.trim(),
        slot,
      };
    }
  }

  // No valid slot suffix found, return entire label as base name
  return {
    baseName: normalized,
    slot: undefined,
  };
}

/**
 * Formats a dish name with slot suffix.
 * 
 * @param baseName - The base dish name
 * @param slot - The slot number (1, 2, or 3)
 * @returns Formatted label (e.g., "Chicken 65-1")
 */
export function formatDishImageLabel(baseName: string, slot: 1 | 2 | 3): string {
  const normalized = baseName.trim().replace(/\s+/g, ' ');
  return `${normalized} -${slot}`;
}
