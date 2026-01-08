/**
 * Service Layer: Image Upload & Deduplication
 * 
 * Handles cloud upload and content-based deduplication.
 * Maintains upload cache to avoid re-uploading identical images.
 */

import { generateImageHash } from './imageProcessingService';

// ============================================================================
// Types
// ============================================================================

export interface ImageUploadCache {
  hash: string;
  uploadedUrl: string;
}

// ============================================================================
// Upload Cache (In-Memory)
// ============================================================================

/**
 * Upload cache: hash -> uploaded URL
 * Used to deduplicate identical image content across dishes.
 */
const uploadCache = new Map<string, string>();

/**
 * Gets cached upload URL for a hash.
 * 
 * @param hash - Image content hash
 * @returns Cached URL if exists, null otherwise
 */
export function getCachedUploadUrl(hash: string): string | null {
  return uploadCache.get(hash) ?? null;
}

/**
 * Caches an uploaded URL for a hash.
 * 
 * @param hash - Image content hash
 * @param url - Uploaded URL
 */
export function cacheUploadUrl(hash: string, url: string): void {
  uploadCache.set(hash, url);
}

/**
 * Clears the upload cache.
 */
export function clearUploadCache(): void {
  uploadCache.clear();
}

/**
 * Gets cache size (for debugging).
 */
export function getCacheSize(): number {
  return uploadCache.size;
}

// ============================================================================
// Cloud Upload
// ============================================================================

/**
 * Uploads an image file to cloud storage.
 * 
 * @param file - Image file to upload
 * @param dataUrl - Base64 data URL (for preview/validation)
 * @returns Uploaded image URL, or null if upload failed
 */
export async function uploadImageToCloud(
  file: File,
  dataUrl: string,
): Promise<string | null> {
  try {
    // Extract base64 data (after comma)
    const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: file.type || 'image/jpeg' });

    // Create FormData
    const formData = new FormData();
    formData.append('fileData', blob);
    formData.append('fileName', crypto.randomUUID());
    formData.append('bucketName', 'assets');

    // Upload to cloud storage
    const response = await fetch('https://storage.test.hipalz.com/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data?.url ?? null;
  } catch (error) {
    console.error('Image upload error:', error);
    return null;
  }
}

/**
 * Uploads an image with deduplication.
 * Checks cache first, uploads only if not cached.
 * 
 * @param file - Image file to upload
 * @param dataUrl - Base64 data URL
 * @param hash - Image content hash (if already computed)
 * @returns Uploaded image URL, or null if upload failed
 */
export async function uploadImageWithDeduplication(
  file: File,
  dataUrl: string,
  hash?: string,
): Promise<{ url: string | null; hash: string; wasCached: boolean }> {
  // Generate hash if not provided
  let imageHash = hash;
  if (!imageHash) {
    const blob = await (await fetch(dataUrl)).blob();
    imageHash = await generateImageHash(blob);
  }

  // Check cache
  const cachedUrl = getCachedUploadUrl(imageHash);
  if (cachedUrl) {
    return {
      url: cachedUrl,
      hash: imageHash,
      wasCached: true,
    };
  }

  // Upload to cloud
  const uploadedUrl = await uploadImageToCloud(file, dataUrl);

  if (uploadedUrl) {
    // Cache the uploaded URL
    cacheUploadUrl(imageHash, uploadedUrl);
  }

  return {
    url: uploadedUrl,
    hash: imageHash,
    wasCached: false,
  };
}
