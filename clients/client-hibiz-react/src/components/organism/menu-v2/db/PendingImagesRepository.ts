import { db, type IPendingImage } from "./menu.database";

export const PendingImagesRepository = {
  /**
   * Save pending images for a dish (merges with existing images, max 3 total)
   */
  async savePendingImages(
    dishId: string,
    businessId: string,
    images: Array<{ preview: string; file: File }>,
    mergeWithExisting: boolean = true,
  ) {
    await db.transaction("rw", db.pendingImages, async () => {
      let finalImages: Array<{ preview: string; file: File }> = [];

      if (mergeWithExisting) {
        // Get existing pending images
        const existing = await db.pendingImages.where({ dishId }).toArray();
        const existingUrls = new Set(existing.map((img) => img.preview));

        // Start with existing images
        existing.forEach((img) => {
          finalImages.push({
            preview: img.preview,
            file: new File([], "existing.jpg", { type: "image/jpeg" }),
          });
        });

        // Add new images (filter duplicates)
        for (const img of images) {
          if (!existingUrls.has(img.preview) && finalImages.length < 3) {
            finalImages.push(img);
          }
        }
      } else {
        // Replace mode (remove existing)
        await db.pendingImages.where({ dishId }).delete();
        finalImages = images.slice(0, 3);
      }

      // Enforce max 3 images
      finalImages = finalImages.slice(0, 3);

      // Clear existing if not merging
      if (!mergeWithExisting) {
        await db.pendingImages.where({ dishId }).delete();
      } else {
        // Remove all existing, we'll re-add the merged set
        await db.pendingImages.where({ dishId }).delete();
      }

      // Add final merged images
      for (let i = 0; i < finalImages.length; i++) {
        await db.pendingImages.add({
          dishId,
          businessId,
          imageIndex: i,
          preview: finalImages[i].preview,
          createdAt: Date.now(),
        });
      }
    });
  },

  /**
   * Get all pending images for a dish
   */
  async getPendingImages(dishId: string): Promise<IPendingImage[]> {
    return await db.pendingImages.where({ dishId }).sortBy("imageIndex");
  },

  /**
   * Get all pending images for a business
   */
  async getAllPendingImages(businessId: string): Promise<IPendingImage[]> {
    return await db.pendingImages.where({ businessId }).toArray();
  },

  /**
   * Convert base64 preview (data URL) to File object for upload
   */
  async base64ToFile(
    base64DataUrl: string,
    filename: string = "image.png",
  ): Promise<File> {
    // Check if it's already a data URL
    if (base64DataUrl.startsWith("data:")) {
      // Extract base64 data from data URL
      const base64Match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (base64Match) {
        const mimeType = base64Match[1] || "image/png";
        const base64Data = base64Match[2];

        // Convert base64 to binary
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        return new File([blob], filename, { type: mimeType });
      }
    }

    // Fallback: try to fetch if it's a URL
    try {
      const response = await fetch(base64DataUrl);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type || "image/png" });
    } catch (error) {
      console.error("Error converting to file:", error);
      // Last resort: create a file from the string
      const blob = new Blob([base64DataUrl], { type: "image/png" });
      return new File([blob], filename, { type: "image/png" });
    }
  },

  /**
   * Clear pending images for a dish (after successful upload)
   */
  async clearPendingImages(dishId: string) {
    await db.pendingImages.where({ dishId }).delete();
  },

  /**
   * Clear all pending images for a business
   */
  async clearAllPendingImages(businessId: string) {
    await db.pendingImages.where({ businessId }).delete();
  },
};
