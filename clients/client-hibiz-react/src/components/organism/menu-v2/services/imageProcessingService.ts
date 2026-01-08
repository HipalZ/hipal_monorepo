/**
 * Service Layer: Image Processing
 *
 * Handles image compression, hashing, and blob management.
 * Uses Web Workers for off-thread processing.
 */

import type { ProcessedImage } from "../store/useBulkImageUploadStore";

// ============================================================================
// Types
// ============================================================================

export interface ImageProcessingResult {
  preview: string; // Base64 data URL
  blob: Blob;
  compressedSize: number;
  originalSize: number;
}

// ============================================================================
// Image Hashing
// ============================================================================

/**
 * Generates SHA-256 hash of a blob for deduplication.
 *
 * @param blob - The image blob to hash
 * @returns Hex string of SHA-256 hash
 */
export async function generateImageHash(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates hash for a base64 data URL.
 * Converts to blob first, then hashes.
 *
 * @param dataUrl - Base64 data URL
 * @returns Hex string of SHA-256 hash
 */
export async function generateHashFromDataUrl(
  dataUrl: string,
): Promise<string> {
  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return generateImageHash(blob);
}

// ============================================================================
// Blob URL Management
// ============================================================================

/**
 * Creates a blob URL for preview display.
 * Caller is responsible for revoking with revokeBlobUrl.
 *
 * @param blob - The blob to create URL for
 * @returns Blob URL string
 */
export function createBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revokes a blob URL to free memory.
 *
 * @param url - The blob URL to revoke
 */
export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Revokes all blob URLs from processed images.
 *
 * @param images - Array of processed images
 */
export function revokeAllBlobUrls(images: ProcessedImage[]): void {
  for (const image of images) {
    if (image.previewUrl) {
      revokeBlobUrl(image.previewUrl);
    }
  }
}

// ============================================================================
// Web Worker Integration
// ============================================================================

/**
 * Creates a Web Worker instance for image processing.
 * Note: Worker must exist at ../workers/image.worker.js
 *
 * @returns Worker instance
 */
export function createImageWorker(): Worker {
  return new Worker(new URL("../workers/image.worker.js", import.meta.url), {
    type: "module",
  });
}
