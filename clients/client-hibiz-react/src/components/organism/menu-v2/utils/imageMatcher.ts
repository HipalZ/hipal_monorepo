/**
 * Image-to-Dish Matching Utility
 * 
 * Matches image filenames to dish names using fuzzy matching.
 * Preserves meaningful numbers while removing only slot suffixes.
 */

import type { MenuDish } from '../types';

interface MatchResult {
  dish: MenuDish;
  confidence: number;
}

const DEBUG = false; // Set to true to enable debug logs

/**
 * Normalizes a string for matching by:
 * 1. Removing file extension
 * 2. Removing slot suffix (-1, -2, -3) if present
 * 3. Normalizing pluralization (removes trailing 's')
 * 4. Removing symbols but preserving meaningful numbers
 * 5. Lowercasing and trimming
 * 
 * Examples:
 * - "teachers 50-1.jpg" -> "teacher 50"
 * - "teacher 50" -> "teacher 50"
 * - "chicken 65-2" -> "chicken 65"
 */
export const normalizeForMatching = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  
  let normalized = str.trim();
  
  // Remove file extension
  const extIndex = normalized.lastIndexOf('.');
  if (extIndex > 0) {
    normalized = normalized.substring(0, extIndex);
  }
  
  // Remove slot suffix (-1, -2, -3) at the end only
  // Pattern: space followed by hyphen and 1-3 at end
  normalized = normalized.replace(/\s+-[123]$/, '');
  
  // Normalize pluralization: remove trailing 's' (simple heuristic)
  // Only if word ends with 's' and is not already singular
  normalized = normalized.replace(/\b(\w+)s\b/g, (match, word) => {
    // Don't pluralize very short words (like "is", "as")
    if (word.length < 2) return match;
    return word;
  });
  
  // Remove symbols but keep numbers and letters
  normalized = normalized.replace(/[^a-zA-Z0-9\s]/g, ' ');
  
  // Normalize whitespace (multiple spaces to single space)
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Lowercase
  normalized = normalized.toLowerCase();
  
  return normalized;
};

/**
 * @deprecated Use normalizeForMatching instead
 * Legacy function for backward compatibility
 */
export const cleanFileName = (filename: string): string => {
  return normalizeForMatching(filename);
};

/**
 * Calculates similarity between two strings using Levenshtein distance
 * Returns a score between 0 (no match) and 1 (exact match)
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Calculates Levenshtein distance between two strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Auto-assigns an image filename to the best matching dish
 * Returns the dish with highest confidence score, or null if no good match
 */
export const autoAssignImage = (
  filename: string,
  dishes: MenuDish[],
  minConfidence: number = 0.6
): MatchResult | null => {
  // Normalize filename for matching
  const normalizedFileName = normalizeForMatching(filename);
  
  if (DEBUG) {
    console.log('[ImageMatcher] Matching filename', {
      original: filename,
      normalized: normalizedFileName,
      minConfidence,
    });
  }
  
  let bestMatch: MatchResult | null = null;
  let highestScore = 0;
  
  for (const dish of dishes) {
    const dishName = dish.name || '';
    // Normalize dish name the same way as filename
    const normalizedDishName = normalizeForMatching(dishName);
    
    // Calculate similarity using normalized strings
    const exactContains = 
      normalizedDishName.includes(normalizedFileName) || 
      normalizedFileName.includes(normalizedDishName);
    
    const similarity = calculateSimilarity(normalizedDishName, normalizedFileName);
    
    // Boost score if one contains the other (token-based containment)
    let score = exactContains ? Math.max(similarity, 0.85) : similarity;
    
    // Additional boost for token-based matching (check if key tokens match)
    const filenameTokens = normalizedFileName.split(/\s+/).filter(t => t.length > 2);
    const dishTokens = normalizedDishName.split(/\s+/).filter(t => t.length > 2);
    
    if (filenameTokens.length > 0 && dishTokens.length > 0) {
      const matchingTokens = filenameTokens.filter(token => 
        dishTokens.some(dishToken => 
          dishToken.includes(token) || token.includes(dishToken)
        )
      );
      const tokenMatchRatio = matchingTokens.length / Math.max(filenameTokens.length, dishTokens.length);
      
      // Boost if significant token overlap
      if (tokenMatchRatio >= 0.5) {
        score = Math.max(score, 0.75);
      }
    }
    
    if (DEBUG && score > 0.3) {
      console.log('[ImageMatcher] Match candidate', {
        dishName: dishName,
        normalizedDishName,
        similarity: similarity.toFixed(3),
        containsBoost: exactContains,
        finalScore: score.toFixed(3),
      });
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        dish,
        confidence: score
      };
    }
  }
  
  if (DEBUG && bestMatch) {
    console.log('[ImageMatcher] Best match selected', {
      dishName: bestMatch.dish.name,
      confidence: bestMatch.confidence.toFixed(3),
      meetsThreshold: bestMatch.confidence >= minConfidence,
    });
  }
  
  // Only return match if confidence is above threshold
  if (bestMatch && bestMatch.confidence >= minConfidence) {
    return bestMatch;
  }
  
  if (DEBUG && !bestMatch) {
    console.log('[ImageMatcher] No match found above threshold', {
      filename,
      normalizedFileName,
      highestScore: highestScore.toFixed(3),
      minConfidence,
    });
  }
  
  return null;
};

/**
 * Batch auto-assign multiple images to dishes
 */
export const batchAutoAssign = (
  filenames: string[],
  dishes: MenuDish[],
  minConfidence: number = 0.6
): Map<string, MatchResult> => {
  const assignments = new Map<string, MatchResult>();
  
  for (const filename of filenames) {
    const match = autoAssignImage(filename, dishes, minConfidence);
    if (match) {
      assignments.set(filename, match);
    }
  }
  
  return assignments;
};
