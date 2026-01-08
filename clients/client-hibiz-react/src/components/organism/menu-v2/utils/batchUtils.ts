/**
 * Batch Utilities
 *
 * Helper functions for batching operations to prevent UI blocking.
 */

/**
 * Process items in chunks with optional delay to prevent UI blocking
 * @param items Array of items to process
 * @param chunkSize Number of items to process per chunk
 * @param processor Function to process each item
 * @param onProgress Optional callback for progress updates
 * @param delayMs Optional delay between chunks (default: 10ms)
 */
export async function processInChunks<T, R>(
  items: T[],
  chunkSize: number,
  processor: (item: T, index: number) => Promise<R>,
  onProgress?: (current: number, total: number) => void,
  delayMs: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map((item, idx) => processor(item, i + idx)));
    results.push(...chunkResults);
    
    if (onProgress) {
      onProgress(Math.min(i + chunkSize, items.length), items.length);
    }
    
    // Small delay to prevent UI blocking
    if (i + chunkSize < items.length && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Process items with controlled concurrency (max N concurrent operations)
 * @param items Array of items to process
 * @param concurrency Max number of concurrent operations
 * @param processor Function to process each item
 * @param onProgress Optional callback for progress updates
 */
export async function processWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T, index: number) => Promise<R>,
  onProgress?: (current: number, total: number, currentItem?: T) => void
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;
  let completedCount = 0;

  const execute = async (index: number): Promise<void> => {
    while (currentIndex < items.length) {
      const itemIndex = currentIndex++;
      const item = items[itemIndex];
      
      try {
        if (onProgress) {
          onProgress(completedCount, items.length, item);
        }
        
        const result = await processor(item, itemIndex);
        results[itemIndex] = result;
        completedCount++;
        
        if (onProgress) {
          onProgress(completedCount, items.length);
        }
      } catch (error) {
        console.error(`Error processing item at index ${itemIndex}:`, error);
        completedCount++;
        if (onProgress) {
          onProgress(completedCount, items.length);
        }
        // Continue with other items even if one fails
      }
    }
  };

  // Start concurrent workers
  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map((_, idx) => execute(idx));

  await Promise.all(workers);

  return results;
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
