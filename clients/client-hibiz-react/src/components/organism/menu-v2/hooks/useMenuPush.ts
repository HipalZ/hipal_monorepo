import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { DraftOpsRepository } from "../db/DraftOpsRepository";
import { PendingImagesRepository } from "../db/PendingImagesRepository";
import { db } from "../db/menu.database";
import { useMenuUIStore } from "../store/useMenuUIStore";
import toast from "react-hot-toast";
import { apiRpc } from "@hi/common";
import { storeImageAfterSave } from "@/components/utils/helper";
import type { IDraftOp } from "../types";
import type { PushProgress } from "../components/PushProgressModal";
import { processWithConcurrency, chunk } from "../utils/batchUtils";

// Helper to generate SHA-256 hash of blob for deduplication (Fix 4)
async function generateImageHash(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate UUID v4 (simple implementation)
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const CHUNK_SIZE = 200; // Max updates per bulk request

export const useMenuPush = (businessId: string) => {
  const setLastPushedAt = useMenuUIStore((s) => s.setLastPushedAt);
  const setDraftOpsCount = useMenuUIStore((s) => s.setDraftOpsCount);
  const [progress, setProgress] = useState<PushProgress | null>(null);

  const pushMenu = useCallback(
    async (onProgress?: (progress: PushProgress) => void) => {
      if (!businessId) throw new Error("Business ID is required");

      const draftOps = await DraftOpsRepository.getAllDraftOps();
      const pendingImages =
        await PendingImagesRepository.getAllPendingImages(businessId);

      if (draftOps.length === 0 && pendingImages.length === 0) {
        toast.error("No changes to push");
        return;
      }

      const updateProgress = (newProgress: PushProgress) => {
        setProgress(newProgress);
        onProgress?.(newProgress);
      };

      try {
        // Phase 1: Upload all pending images first (deduplicate by image content hash - Fix 4)
        const imageUploadMap = new Map<string, string[]>(); // dishId -> [url1, url2, url3]
        const uploadedImagesCache = new Map<string, string>(); // imageHash -> uploadedUrl (deduplication by SHA-256 hash)

        if (pendingImages.length > 0) {
          updateProgress({
            phase: "images",
            current: 0,
            total: pendingImages.length,
            message: `Uploading ${pendingImages.length} images (Unique: 0)...`,
          });

          // Process images with controlled concurrency (3-5 concurrent uploads)
          let uploadedCount = 0;
          let uniqueUploaded = 0;

          await processWithConcurrency(
            pendingImages,
            4, // Max 4 concurrent uploads
            async (pendingImg, index) => {
              if (!imageUploadMap.has(pendingImg.dishId)) {
                imageUploadMap.set(pendingImg.dishId, ["", "", ""]);
              }

              try {
                // Check if this is a reused URL (already a cloud URL, skip upload)
                const isReusedUrl =
                  pendingImg.preview.startsWith("http://") ||
                  pendingImg.preview.startsWith("https://");

                let uploadedUrl: string | undefined;

                if (isReusedUrl) {
                  // Reused URL - use it directly without upload
                  uploadedUrl = pendingImg.preview;
                  // Use URL as hash key for reused images
                  if (!uploadedImagesCache.has(pendingImg.preview)) {
                    uploadedImagesCache.set(pendingImg.preview, uploadedUrl);
                    uniqueUploaded++;
                  } else {
                    uploadedUrl = uploadedImagesCache.get(pendingImg.preview);
                  }
                } else {
                  // Convert base64 data URL to File and generate hash for deduplication (Fix 4)
                  const file = await PendingImagesRepository.base64ToFile(
                    pendingImg.preview,
                    `image-${pendingImg.dishId}-${pendingImg.imageIndex}.jpg`,
                  );

                  // Generate SHA-256 hash from blob for deduplication
                  const imageHash = await generateImageHash(file);

                  // Check if we've already uploaded this exact image content (by hash)
                  uploadedUrl = uploadedImagesCache.get(imageHash);

                  if (!uploadedUrl) {
                    // Get dish name for progress display
                    const dish = await db.dishes.get(pendingImg.dishId);
                    const dishName =
                      dish?.name || `Dish ${pendingImg.dishId.substring(0, 8)}`;

                    // Update progress with current file name
                    updateProgress({
                      phase: "images",
                      current: uploadedCount,
                      total: pendingImages.length,
                      message: `Uploading images: ${uploadedCount}/${pendingImages.length} (Unique: ${uploadedImagesCache.size})`,
                      currentFileName: dishName,
                    });

                    // storeImageAfterSave expects both file and preview (base64 data URL)
                    uploadedUrl = await storeImageAfterSave(
                      file,
                      pendingImg.preview,
                    );

                    if (uploadedUrl) {
                      // Cache the uploaded URL by hash (not by base64 preview) for proper deduplication
                      uploadedImagesCache.set(imageHash, uploadedUrl);
                      uniqueUploaded++;
                    }
                  } else {
                    // Same image content already uploaded - reuse URL
                    uniqueUploaded++; // Count as processed but not uploaded
                  }
                }

                if (uploadedUrl) {
                  const urls = imageUploadMap.get(pendingImg.dishId)!;
                  urls[pendingImg.imageIndex] = uploadedUrl;
                  imageUploadMap.set(pendingImg.dishId, urls);
                }

                uploadedCount++;
                updateProgress({
                  phase: "images",
                  current: uploadedCount,
                  total: pendingImages.length,
                  message: `Uploading images: ${uploadedCount}/${pendingImages.length} (Unique: ${uploadedImagesCache.size})`,
                  currentFileName: undefined, // Clear file name when done
                });
              } catch (error) {
                console.error(
                  `Error uploading image for dish ${pendingImg.dishId}, index ${pendingImg.imageIndex}:`,
                  error,
                );
                uploadedCount++;
                updateProgress({
                  phase: "images",
                  current: uploadedCount,
                  total: pendingImages.length,
                  message: `Uploading images: ${uploadedCount}/${pendingImages.length} (Unique: ${uploadedImagesCache.size})`,
                });
                // Continue with other images
              }
            },
            (current, total) => {
              // Progress callback
              updateProgress({
                phase: "images",
                current,
                total: pendingImages.length,
                message: `Uploading images: ${current}/${pendingImages.length} (Unique: ${uploadedImagesCache.size})`,
              });
            },
          );
        }

        // Phase 2: Apply image URLs locally to dishes (create draft ops)
        const dishEntries = Array.from(imageUploadMap.entries());
        if (dishEntries.length > 0) {
          updateProgress({
            phase: "applying_urls",
            current: 0,
            total: dishEntries.length,
            message: `Applying image URLs locally: 0/${dishEntries.length}`,
          });

          let appliedCount = 0;
          for (const [dishId, imageUrls] of dishEntries) {
            try {
              const filteredUrls = imageUrls.filter((url) => url);

              // Fix 5: Merge existing images with new ones instead of replacing
              const dish = await db.dishes.get(dishId);
              const existingImages = Array.isArray(dish?.images)
                ? dish.images
                : [];
              const existingUrls = new Set(existingImages);

              // Merge: existing + new (filter duplicates, enforce max 3)
              const mergedImages = [
                ...existingImages,
                ...filteredUrls.filter((url) => !existingUrls.has(url)),
              ].slice(0, 3);

              // Update dish images with merged array
              await DraftOpsRepository.updateDishFields(dishId, businessId, {
                images: mergedImages,
              });
              await PendingImagesRepository.clearPendingImages(dishId);

              appliedCount++;
              updateProgress({
                phase: "applying_urls",
                current: appliedCount,
                total: dishEntries.length,
                message: `Applying image URLs locally: ${appliedCount}/${dishEntries.length}`,
              });
            } catch (error) {
              console.error(
                `Error applying image URLs for dish ${dishId}:`,
                error,
              );
              appliedCount++;
              updateProgress({
                phase: "applying_urls",
                current: appliedCount,
                total: dishEntries.length,
                message: `Applying image URLs locally: ${appliedCount}/${dishEntries.length}`,
              });
            }
          }
        }

        // Step 3: Group operations by entity type and opType
        const allDraftOps = await DraftOpsRepository.getAllDraftOps();

        // Separate CREATE and UPDATE ops (CREATE must happen first, in dependency order)
        const createOps = {
          categories: [] as IDraftOp[],
          addons: [] as IDraftOp[],
          dishes: [] as IDraftOp[],
          kitchens: [] as IDraftOp[],
        };

        // successfulEntityIds will be declared below

        // Deduplicate UPDATE ops: merge multiple ops for same entityId (last write wins)
        const dishOpsMap = new Map<string, IDraftOp>();
        const categoryOpsMap = new Map<string, IDraftOp>();
        const addonOpsMap = new Map<string, IDraftOp>();
        const kitchenOpsMap = new Map<string, IDraftOp>();

        for (const op of allDraftOps) {
          if (op.opType === "CREATE") {
            if (op.entity === "CATEGORY") {
              createOps.categories.push(op);
            } else if (op.entity === "ADDON") {
              createOps.addons.push(op);
            } else if (op.entity === "DISH") {
              createOps.dishes.push(op);
            } else if (op.entity === "KITCHEN") {
              createOps.kitchens.push(op);
            }
          } else if (op.opType === "UPDATE") {
            if (op.entity === "DISH") {
              const existing = dishOpsMap.get(op.entityId);
              if (existing) {
                // Merge payloads (last write wins)
                dishOpsMap.set(op.entityId, {
                  ...op,
                  payload: { ...existing.payload, ...op.payload },
                });
              } else {
                dishOpsMap.set(op.entityId, op);
              }
            } else if (op.entity === "CATEGORY") {
              const existing = categoryOpsMap.get(op.entityId);
              if (existing) {
                categoryOpsMap.set(op.entityId, {
                  ...op,
                  payload: { ...existing.payload, ...op.payload },
                });
              } else {
                categoryOpsMap.set(op.entityId, op);
              }
            } else if (op.entity === "ADDON") {
              const existing = addonOpsMap.get(op.entityId);
              if (existing) {
                addonOpsMap.set(op.entityId, {
                  ...op,
                  payload: { ...existing.payload, ...op.payload },
                });
              } else {
                addonOpsMap.set(op.entityId, op);
              }
            } else if (op.entity === "KITCHEN") {
              const existing = kitchenOpsMap.get(op.entityId);
              if (existing) {
                kitchenOpsMap.set(op.entityId, {
                  ...op,
                  payload: { ...existing.payload, ...op.payload },
                });
              } else {
                kitchenOpsMap.set(op.entityId, op);
              }
            }
          }
          // DELETE ops can be handled separately if needed
        }

        const dishOps = Array.from(dishOpsMap.values());
        const categoryOps = Array.from(categoryOpsMap.values());
        const addonOps = Array.from(addonOpsMap.values());
        const kitchenOps = Array.from(kitchenOpsMap.values());

        // LocalId -> ServerId mapping for resolving relationships
        const idMapping = new Map<string, string>();

        const allErrors: Array<{ id: string; error: string }> = [];

        // Track successful entityIds to remove from draftOps
        const successfulEntityIds: {
          dishes: string[];
          categories: string[];
          addons: string[];
          kitchens: string[];
          zoneKitchens?: string[];
          dishRouting?: string[];
        } = {
          dishes: [],
          categories: [],
          addons: [],
          kitchens: [],
          zoneKitchens: [],
          dishRouting: [],
        };

        // ========================================================================
        // STEP 3.5: Handle CREATE ops (in dependency order: Categories -> Addons -> Dishes)
        // ========================================================================

        // Helper to resolve localIds to serverIds in arrays
        const resolveIds = (localIds: string[] | undefined): string[] => {
          if (!localIds || localIds.length === 0) return [];
          return localIds
            .map((localId) => idMapping.get(localId) || localId)
            .filter((id) => id); // Remove undefined/null
        };

        // CREATE Categories first
        if (createOps.categories.length > 0) {
          updateProgress({
            phase: "categories",
            current: 0,
            total: createOps.categories.length,
            message: `Creating categories: 0/${createOps.categories.length}`,
          });

          for (let i = 0; i < createOps.categories.length; i++) {
            const op = createOps.categories[i];
            try {
              const localCategory = await db.categories.get(op.entityId);
              if (!localCategory) {
                allErrors.push({
                  id: op.entityId,
                  error: "Category not found locally",
                });
                continue;
              }

              const payload = {
                ...op.payload,
                businessId,
              };

              const response = await apiRpc.categories.$post({ json: payload });
              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                // Parse Zod validation errors
                let errorMsg = errorBody.message || `HTTP ${response.status}`;
                if (errorBody.error?.issues) {
                  const issues = errorBody.error.issues
                    .map(
                      (issue: any) =>
                        `${issue.path.join(".")}: ${issue.message}`,
                    )
                    .join("; ");
                  errorMsg = issues || errorMsg;
                }
                allErrors.push({
                  id: op.entityId,
                  error: `Category "${localCategory.name}": ${errorMsg}`,
                });
                continue;
              }

              const result = await response.json();
              const serverCategory = result.data?.[0] || result.data || result;
              const serverId = serverCategory._id || serverCategory.id;

              if (serverId) {
                // Map localId -> serverId
                idMapping.set(op.entityId, serverId);

                // Dexie doesn't allow updating primary key, so delete old and add new with serverId
                const updatedCategory = {
                  ...localCategory,
                  _id: serverId,
                  syncStatus: "SYNCED" as any,
                  updatedAt: Date.now(),
                };

                await db.categories.delete(op.entityId);
                await db.categories.add(updatedCategory);

                successfulEntityIds.categories.push(op.entityId);
              }

              updateProgress({
                phase: "categories",
                current: i + 1,
                total: createOps.categories.length,
                message: `Creating categories: ${i + 1}/${
                  createOps.categories.length
                }`,
              });
            } catch (error: any) {
              const localCategory = await db.categories.get(op.entityId);
              allErrors.push({
                id: op.entityId,
                error: `Category "${localCategory?.name || op.entityId}": ${
                  error.message || "Unknown error"
                }`,
              });
            }
          }

          // Remove successful CREATE ops
          if (successfulEntityIds.categories.length > 0) {
            await DraftOpsRepository.removeDraftOpsByEntityIds(
              successfulEntityIds.categories,
              "CATEGORY",
            );
          }
        }

        // CREATE Addons second
        if (createOps.addons.length > 0) {
          updateProgress({
            phase: "addons",
            current: 0,
            total: createOps.addons.length,
            message: `Creating addons: 0/${createOps.addons.length}`,
          });

          for (let i = 0; i < createOps.addons.length; i++) {
            const op = createOps.addons[i];
            try {
              const localAddon = await db.addons.get(op.entityId);
              if (!localAddon) {
                allErrors.push({
                  id: op.entityId,
                  error: "Addon not found locally",
                });
                continue;
              }

              const payload = {
                ...op.payload,
                businessId,
              };

              const response = await apiRpc.addons.$post({ json: payload });
              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                // Parse Zod validation errors
                let errorMsg = errorBody.message || `HTTP ${response.status}`;
                if (errorBody.error?.issues) {
                  const issues = errorBody.error.issues
                    .map(
                      (issue: any) =>
                        `${issue.path.join(".")}: ${issue.message}`,
                    )
                    .join("; ");
                  errorMsg = issues || errorMsg;
                }
                allErrors.push({
                  id: op.entityId,
                  error: `Addon "${localAddon.name}": ${errorMsg}`,
                });
                continue;
              }

              const result = await response.json();
              const serverAddon = result.data || result;
              const serverId = serverAddon._id || serverAddon.id;

              if (serverId) {
                idMapping.set(op.entityId, serverId);

                // Dexie doesn't allow updating primary key, so delete old and add new with serverId
                const updatedAddon = {
                  ...localAddon,
                  _id: serverId,
                  syncStatus: "SYNCED" as any,
                  updatedAt: Date.now(),
                };

                await db.addons.delete(op.entityId);
                await db.addons.add(updatedAddon);

                successfulEntityIds.addons.push(op.entityId);
              }

              updateProgress({
                phase: "addons",
                current: i + 1,
                total: createOps.addons.length,
                message: `Creating addons: ${i + 1}/${createOps.addons.length}`,
              });
            } catch (error: any) {
              const localAddon = await db.addons.get(op.entityId);
              allErrors.push({
                id: op.entityId,
                error: `Addon "${localAddon?.name || op.entityId}": ${
                  error.message || "Unknown error"
                }`,
              });
            }
          }

          // Remove successful CREATE ops
          if (successfulEntityIds.addons.length > 0) {
            await DraftOpsRepository.removeDraftOpsByEntityIds(
              successfulEntityIds.addons,
              "ADDON",
            );
          }
        }

        // CREATE Dishes last (they may reference categories/addons)
        if (createOps.dishes.length > 0) {
          updateProgress({
            phase: "dishes",
            current: 0,
            total: createOps.dishes.length,
            message: `Creating dishes: 0/${createOps.dishes.length}`,
          });

          for (let i = 0; i < createOps.dishes.length; i++) {
            const op = createOps.dishes[i];
            console.log("op", op);
            try {
              const localDish = await db.dishes.get(op.entityId);
              console.log("localDish", localDish);
              if (!localDish) {
                allErrors.push({
                  id: op.entityId,
                  error: "Dish not found locally",
                });
                continue;
              }

              // Resolve categoryIds and addonIds to serverIds
              const payload = {
                ...op.payload,
                businessId,
                categoryIds: resolveIds(op.payload.categoryIds as string[]),
                addOnIds: resolveIds(op.payload.addonIds as string[]),
                recommendationIds: resolveIds(
                  op.payload.recommendedDishIds as string[],
                ),
              };

              const response = await apiRpc.dishes.$post({ json: payload });
              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                // Parse Zod validation errors
                let errorMsg = errorBody.message || `HTTP ${response.status}`;
                if (errorBody.error?.issues) {
                  const issues = errorBody.error.issues
                    .map(
                      (issue: any) =>
                        `${issue.path.join(".")}: ${issue.message}`,
                    )
                    .join("; ");
                  errorMsg = issues || errorMsg;
                }
                allErrors.push({
                  id: op.entityId,
                  error: `Dish "${localDish.name}": ${errorMsg}`,
                });
                continue;
              }

              const result = await response.json();
              const serverDish = result.data?.[0] || result.data || result;
              const serverId = serverDish._id || serverDish.id;

              if (serverId) {
                idMapping.set(op.entityId, serverId);

                // Dexie doesn't allow updating primary key, so delete old and add new with serverId
                const updatedDish = {
                  ...localDish,
                  _id: serverId,
                  syncStatus: "SYNCED" as any,
                  updatedAt: Date.now(),
                };

                await db.dishes.delete(op.entityId);
                await db.dishes.add(updatedDish);

                successfulEntityIds.dishes.push(op.entityId);
              }

              updateProgress({
                phase: "dishes",
                current: i + 1,
                total: createOps.dishes.length,
                message: `Creating dishes: ${i + 1}/${createOps.dishes.length}`,
              });
            } catch (error: any) {
              const localDish = await db.dishes.get(op.entityId);
              allErrors.push({
                id: op.entityId,
                error: `Dish "${localDish?.name || op.entityId}": ${
                  error.message || "Unknown error"
                }`,
              });
            }
          }

          // Remove successful CREATE ops
          if (successfulEntityIds.dishes.length > 0) {
            await DraftOpsRepository.removeDraftOpsByEntityIds(
              successfulEntityIds.dishes,
              "DISH",
            );
          }
        }

        // CREATE Kitchens after Dishes
        if (createOps.kitchens.length > 0) {
          updateProgress({
            phase: "kitchens",
            current: 0,
            total: createOps.kitchens.length,
            message: `Creating kitchens: 0/${createOps.kitchens.length}`,
          });

          for (let i = 0; i < createOps.kitchens.length; i++) {
            const op = createOps.kitchens[i];
            try {
              const localKitchen = await db.kitchens.get(op.entityId);
              if (!localKitchen) {
                allErrors.push({
                  id: op.entityId,
                  error: "Kitchen not found locally",
                });
                continue;
              }

              // Resolve dishIds and staffIds
              const resolvedDishIds = resolveIds(
                op.payload.dishIds as string[],
              );
              const payload = {
                ...op.payload,
                businessId,
                dishIds: resolvedDishIds,
                staffIds: resolveIds(op.payload.staffIds as string[]),
              };

              // Sanitize payload
              delete (payload as any)._id;
              delete (payload as any).kitchenId;
              delete (payload as any).syncStatus;

              const response = await apiRpc.kitchen.$post({ json: payload });
              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                let errorMsg = errorBody.message || `HTTP ${response.status}`;
                if (errorBody.error?.issues) {
                  const issues = errorBody.error.issues
                    .map(
                      (issue: any) =>
                        `${issue.path.join(".")}: ${issue.message}`,
                    )
                    .join("; ");
                  errorMsg = issues || errorMsg;
                }
                allErrors.push({
                  id: op.entityId,
                  error: `Kitchen "${localKitchen.name}": ${errorMsg}`,
                });
                continue;
              }

              const result = await response.json();
              const serverKitchen = result.data || result;
              const serverId = serverKitchen._id || serverKitchen.id;

              if (serverId) {
                const oldLocalId = op.entityId;
                idMapping.set(oldLocalId, serverId);

                const updatedKitchen = {
                  ...localKitchen,
                  _id: serverId,
                  dishIds: resolvedDishIds,
                  syncStatus: "SYNCED" as any,
                  updatedAt: Date.now(),
                };

                await db.kitchens.delete(oldLocalId);
                await db.kitchens.add(updatedKitchen);

                // CRITICAL: Update ALL associated dishes
                // Dishes originally pointed to the local kitchen UUID
                const associatedDishes = await db.dishes
                  .where("kitchenId")
                  .equals(oldLocalId)
                  .toArray();

                for (const dish of associatedDishes) {
                  await db.dishes.update(dish._id, { kitchenId: serverId });
                }

                successfulEntityIds.kitchens.push(oldLocalId);
              }

              updateProgress({
                phase: "kitchens",
                current: i + 1,
                total: createOps.kitchens.length,
                message: `Creating kitchens: ${i + 1}/${
                  createOps.kitchens.length
                }`,
              });
            } catch (error: any) {
              const localKitchen = await db.kitchens.get(op.entityId);
              allErrors.push({
                id: op.entityId,
                error: `Kitchen "${localKitchen?.name || op.entityId}": ${
                  error.message || "Unknown error"
                }`,
              });
            }
          }

          // Remove successful CREATE ops
          if (successfulEntityIds.kitchens.length > 0) {
            await DraftOpsRepository.removeDraftOpsByEntityIds(
              successfulEntityIds.kitchens,
              "KITCHEN",
            );
            successfulEntityIds.kitchens = []; // Clear for updates
          }
        }

        // Helper function to format error messages for users
        const formatErrorMessage = (
          error: string,
          entityType: string,
        ): string => {
          // Handle validation errors
          if (error.includes("Expected") && error.includes("received")) {
            if (error.includes("compulsory")) {
              return "Compulsory field must be 0 (optional) or 1 (required). Received invalid value.";
            }
            if (error.includes("number")) {
              return `A numeric field received an invalid value. Please check ${entityType} data.`;
            }
            if (error.includes("boolean")) {
              return `A true/false field received an invalid value. Please check ${entityType} data.`;
            }
            return `Invalid data format: ${error}`;
          }
          if (error === "not_found") {
            return `${entityType} not found. It may have been deleted or moved.`;
          }
          if (error === "network_error") {
            return "Network error. Please check your connection and try again.";
          }
          return error;
        };

        // Step 4: Bulk update dishes
        if (dishOps.length > 0) {
          // Fetch menuId for each dish from IndexedDB
          const dishUpdates: Array<{
            id: string;
            menuId: string;
            patch: any;
          }> = [];

          for (const op of dishOps) {
            const dish = await db.dishes.get(op.entityId);
            if (dish && dish.menuId) {
              dishUpdates.push({
                id: op.entityId,
                menuId: dish.menuId,
                patch: op.payload,
              });
            }
          }

          // Chunk and send bulk requests
          const dishChunks = chunk(dishUpdates, CHUNK_SIZE);
          for (
            let chunkIndex = 0;
            chunkIndex < dishChunks.length;
            chunkIndex++
          ) {
            const chunk = dishChunks[chunkIndex];
            const requestId = generateUUID();
            const chunkStart = chunkIndex * CHUNK_SIZE;

            updateProgress({
              phase: "dishes",
              current: chunkStart,
              total: dishUpdates.length,
              message: `Syncing dishes: ${chunkStart}/${dishUpdates.length}`,
              batchInfo: {
                currentBatch: chunkIndex + 1,
                totalBatches: dishChunks.length,
              },
            });

            try {
              const response = await apiRpc["menu-v2"]["bulk"]["dishes"].$post({
                json: {
                  businessId,
                  requestId,
                  updates: chunk,
                },
              });

              // Check response status first - validation errors return 400
              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const rawErrorMsg =
                  errorBody.error?.issues?.[0]?.message ||
                  errorBody.message ||
                  `HTTP ${response.status}`;
                // Parse Zod validation error to get better context
                const zodIssue = errorBody.error?.issues?.[0];
                let errorMsg = rawErrorMsg;
                if (zodIssue) {
                  const fieldPath = zodIssue.path?.join(".") || "";
                  if (fieldPath.includes("portions")) {
                    errorMsg = `Portion data format is invalid. Please check dish portions.`;
                  } else {
                    errorMsg = formatErrorMessage(rawErrorMsg, "Dish");
                  }
                }
                for (const update of chunk) {
                  const dish = await db.dishes.get(update.id);
                  const dishName = dish?.name || update.id;
                  allErrors.push({
                    id: update.id,
                    error: `Dish "${dishName}": ${errorMsg}`,
                  });
                }
                updateProgress({
                  phase: "dishes",
                  current: Math.min(
                    chunkStart + chunk.length,
                    dishUpdates.length,
                  ),
                  total: dishUpdates.length,
                  message: `Error syncing dishes`,
                  batchInfo: {
                    currentBatch: chunkIndex + 1,
                    totalBatches: dishChunks.length,
                  },
                  errors: allErrors,
                });
                continue;
              }

              const result = await response.json();

              // Handle response envelope: { err, message, data: { requestId, okCount, failCount, results } }
              const responseData = result.data || result;

              if (result.err || responseData.failCount > 0) {
                // Collect errors and track successes
                if (responseData.results) {
                  for (const r of responseData.results) {
                    if (r.ok) {
                      successfulEntityIds.dishes.push(chunk[r.index].id);
                    } else {
                      const dish = await db.dishes.get(chunk[r.index].id);
                      const dishName = dish?.name || chunk[r.index].id;
                      allErrors.push({
                        id: chunk[r.index].id,
                        error: formatErrorMessage(
                          r.error || "unknown_error",
                          `Dish "${dishName}"`,
                        ),
                      });
                    }
                  }
                } else {
                  // If no results array but err flag is set, mark all as failed
                  for (const update of chunk) {
                    const dish = await db.dishes.get(update.id);
                    const dishName = dish?.name || update.id;
                    allErrors.push({
                      id: update.id,
                      error: formatErrorMessage(
                        result.message || "unknown_error",
                        `Dish "${dishName}"`,
                      ),
                    });
                  }
                }
              } else {
                // All succeeded
                successfulEntityIds.dishes.push(...chunk.map((u) => u.id));
              }

              // Remove successful items from draftOps
              if (successfulEntityIds.dishes.length > 0) {
                await DraftOpsRepository.removeDraftOpsByEntityIds(
                  successfulEntityIds.dishes,
                  "DISH",
                );
                successfulEntityIds.dishes = []; // Reset for next chunk
              }

              const successCount =
                responseData?.okCount ||
                responseData?.results?.filter((r: any) => r.ok).length ||
                0;
              const failCount =
                responseData?.failCount ||
                responseData?.results?.filter((r: any) => !r.ok).length ||
                0;

              updateProgress({
                phase: "dishes",
                current: Math.min(
                  chunkStart + chunk.length,
                  dishUpdates.length,
                ),
                total: dishUpdates.length,
                message: `Syncing dishes: ${Math.min(
                  chunkStart + chunk.length,
                  dishUpdates.length,
                )}/${dishUpdates.length}`,
                batchInfo: {
                  currentBatch: chunkIndex + 1,
                  totalBatches: dishChunks.length,
                },
                errors: allErrors.length > 0 ? allErrors : undefined,
              });
            } catch (error: any) {
              console.error("Bulk dish update error:", error);
              const rawErrorMsg =
                error.message ||
                error.error?.issues?.[0]?.message ||
                "network_error";
              // Mark all in chunk as failed
              for (const update of chunk) {
                const dish = await db.dishes.get(update.id);
                const dishName = dish?.name || update.id;
                allErrors.push({
                  id: update.id,
                  error: formatErrorMessage(rawErrorMsg, `Dish "${dishName}"`),
                });
              }
              updateProgress({
                phase: "dishes",
                current: Math.min(
                  chunkStart + chunk.length,
                  dishUpdates.length,
                ),
                total: dishUpdates.length,
                message: `Error syncing dishes`,
                batchInfo: {
                  currentBatch: chunkIndex + 1,
                  totalBatches: dishChunks.length,
                },
                errors: allErrors,
              });
            }
          }
        }

        // Step 5: Bulk update categories
        if (categoryOps.length > 0) {
          const categoryUpdates: Array<{
            id: string;
            menuId: string;
            patch: any;
          }> = [];

          for (const op of categoryOps) {
            const category = await db.categories.get(op.entityId);
            if (category && category.menuId) {
              categoryUpdates.push({
                id: op.entityId,
                menuId: category.menuId,
                patch: op.payload,
              });
            }
          }

          const categoryChunks = chunk(categoryUpdates, CHUNK_SIZE);
          for (
            let chunkIndex = 0;
            chunkIndex < categoryChunks.length;
            chunkIndex++
          ) {
            const chunk = categoryChunks[chunkIndex];
            const requestId = generateUUID();
            const chunkStart = chunkIndex * CHUNK_SIZE;

            updateProgress({
              phase: "categories",
              current: chunkStart,
              total: categoryUpdates.length,
              message: `Syncing categories: ${chunkStart}/${categoryUpdates.length}`,
              batchInfo: {
                currentBatch: chunkIndex + 1,
                totalBatches: categoryChunks.length,
              },
            });

            try {
              const response = await apiRpc["menu-v2"]["bulk"][
                "categories"
              ].$post({
                json: {
                  businessId,
                  requestId,
                  updates: chunk,
                },
              });

              // Check response status first - validation errors return 400
              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const rawErrorMsg =
                  errorBody.error?.issues?.[0]?.message ||
                  errorBody.message ||
                  `HTTP ${response.status}`;
                // Parse Zod validation error to get better context
                const zodIssue = errorBody.error?.issues?.[0];
                let errorMsg = rawErrorMsg;
                if (zodIssue) {
                  errorMsg = formatErrorMessage(rawErrorMsg, "Category");
                }
                for (const update of chunk) {
                  const category = await db.categories.get(update.id);
                  const categoryName = category?.name || update.id;
                  allErrors.push({
                    id: update.id,
                    error: `Category "${categoryName}": ${errorMsg}`,
                  });
                }
                updateProgress({
                  phase: "categories",
                  current: Math.min(
                    chunkStart + chunk.length,
                    categoryUpdates.length,
                  ),
                  total: categoryUpdates.length,
                  message: `Error syncing categories`,
                  batchInfo: {
                    currentBatch: chunkIndex + 1,
                    totalBatches: categoryChunks.length,
                  },
                  errors: allErrors,
                });
                continue;
              }

              const result = await response.json();

              // Handle response envelope: { err, message, data: { requestId, okCount, failCount, results } }
              const responseData = result.data || result;

              if (result.err || responseData.failCount > 0) {
                // Collect errors and track successes
                if (responseData.results) {
                  for (const r of responseData.results) {
                    if (r.ok) {
                      successfulEntityIds.categories.push(chunk[r.index].id);
                    } else {
                      const category = await db.categories.get(
                        chunk[r.index].id,
                      );
                      const categoryName = category?.name || chunk[r.index].id;
                      allErrors.push({
                        id: chunk[r.index].id,
                        error: formatErrorMessage(
                          r.error || "unknown_error",
                          `Category "${categoryName}"`,
                        ),
                      });
                    }
                  }
                } else {
                  // If no results array but err flag is set, mark all as failed
                  for (const update of chunk) {
                    const category = await db.categories.get(update.id);
                    const categoryName = category?.name || update.id;
                    allErrors.push({
                      id: update.id,
                      error: formatErrorMessage(
                        result.message || "unknown_error",
                        `Category "${categoryName}"`,
                      ),
                    });
                  }
                }
              } else {
                // All succeeded
                successfulEntityIds.categories.push(...chunk.map((u) => u.id));
              }

              // Remove successful items from draftOps
              if (successfulEntityIds.categories.length > 0) {
                await DraftOpsRepository.removeDraftOpsByEntityIds(
                  successfulEntityIds.categories,
                  "CATEGORY",
                );
                successfulEntityIds.categories = []; // Reset for next chunk
              }

              const successCount =
                responseData?.okCount ||
                responseData?.results?.filter((r: any) => r.ok).length ||
                0;
              const failCount =
                responseData?.failCount ||
                responseData?.results?.filter((r: any) => !r.ok).length ||
                0;

              updateProgress({
                phase: "categories",
                current: Math.min(
                  chunkStart + chunk.length,
                  categoryUpdates.length,
                ),
                total: categoryUpdates.length,
                message: `Syncing categories: ${Math.min(
                  chunkStart + chunk.length,
                  categoryUpdates.length,
                )}/${categoryUpdates.length}`,
                batchInfo: {
                  currentBatch: chunkIndex + 1,
                  totalBatches: categoryChunks.length,
                },
                errors: allErrors.length > 0 ? allErrors : undefined,
              });
            } catch (error: any) {
              console.error("Bulk category update error:", error);
              const rawErrorMsg =
                error.message ||
                error.error?.issues?.[0]?.message ||
                "network_error";
              for (const update of chunk) {
                const category = await db.categories.get(update.id);
                const categoryName = category?.name || update.id;
                allErrors.push({
                  id: update.id,
                  error: formatErrorMessage(
                    rawErrorMsg,
                    `Category "${categoryName}"`,
                  ),
                });
              }
              updateProgress({
                phase: "categories",
                current: Math.min(
                  chunkStart + chunk.length,
                  categoryUpdates.length,
                ),
                total: categoryUpdates.length,
                message: `Error syncing categories`,
                batchInfo: {
                  currentBatch: chunkIndex + 1,
                  totalBatches: categoryChunks.length,
                },
                errors: allErrors,
              });
            }
          }
        }

        // Step 6: Bulk update addons
        if (addonOps.length > 0) {
          const addonUpdates: Array<{
            id: string;
            menuId: string;
            patch: any;
          }> = [];

          for (const op of addonOps) {
            const addon = await db.addons.get(op.entityId);
            if (addon && addon.menuId) {
              addonUpdates.push({
                id: op.entityId,
                menuId: addon.menuId,
                patch: op.payload,
              });
            }
          }

          const addonChunks = chunk(addonUpdates, CHUNK_SIZE);
          for (
            let chunkIndex = 0;
            chunkIndex < addonChunks.length;
            chunkIndex++
          ) {
            const chunk = addonChunks[chunkIndex];
            const requestId = generateUUID();
            const chunkStart = chunkIndex * CHUNK_SIZE;

            updateProgress({
              phase: "addons",
              current: chunkStart,
              total: addonUpdates.length,
              message: `Syncing addons: ${chunkStart}/${addonUpdates.length}`,
              batchInfo: {
                currentBatch: chunkIndex + 1,
                totalBatches: addonChunks.length,
              },
            });

            try {
              const response = await apiRpc["menu-v2"]["bulk"]["addons"].$post({
                json: {
                  businessId,
                  requestId,
                  updates: chunk,
                },
              });

              // Check response status first - validation errors return 400
              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const rawErrorMsg =
                  errorBody.error?.issues?.[0]?.message ||
                  errorBody.message ||
                  `HTTP ${response.status}`;
                // Parse Zod validation error to get better context
                const zodIssue = errorBody.error?.issues?.[0];
                let errorMsg = rawErrorMsg;
                if (zodIssue) {
                  const fieldPath = zodIssue.path?.join(".") || "";
                  if (fieldPath.includes("compulsory")) {
                    errorMsg = `Compulsory field must be 0 (optional) or 1 (required). Check addon data.`;
                  } else {
                    errorMsg = formatErrorMessage(rawErrorMsg, "Addon");
                  }
                }
                for (const update of chunk) {
                  const addon = await db.addons.get(update.id);
                  const addonName = addon?.name || update.id;
                  allErrors.push({
                    id: update.id,
                    error: `Addon "${addonName}": ${errorMsg}`,
                  });
                }
                updateProgress({
                  phase: "addons",
                  current: Math.min(
                    chunkStart + chunk.length,
                    addonUpdates.length,
                  ),
                  total: addonUpdates.length,
                  message: `Error syncing addons`,
                  batchInfo: {
                    currentBatch: chunkIndex + 1,
                    totalBatches: addonChunks.length,
                  },
                  errors: allErrors,
                });
                continue;
              }

              const result = await response.json();

              // Handle response envelope: { err, message, data: { requestId, okCount, failCount, results } }
              const responseData = result.data || result;

              if (result.err || responseData.failCount > 0) {
                // Collect errors and track successes
                if (responseData.results) {
                  for (const r of responseData.results) {
                    if (r.ok) {
                      successfulEntityIds.addons.push(chunk[r.index].id);
                    } else {
                      const addon = await db.addons.get(chunk[r.index].id);
                      const addonName = addon?.name || chunk[r.index].id;
                      allErrors.push({
                        id: chunk[r.index].id,
                        error: formatErrorMessage(
                          r.error || "unknown_error",
                          `Addon "${addonName}"`,
                        ),
                      });
                    }
                  }
                } else {
                  // If no results array but err flag is set, mark all as failed
                  for (const update of chunk) {
                    const addon = await db.addons.get(update.id);
                    const addonName = addon?.name || update.id;
                    allErrors.push({
                      id: update.id,
                      error: formatErrorMessage(
                        result.message || "unknown_error",
                        `Addon "${addonName}"`,
                      ),
                    });
                  }
                }
              } else {
                // All succeeded
                successfulEntityIds.addons.push(...chunk.map((u) => u.id));
              }

              // Remove successful items from draftOps
              if (successfulEntityIds.addons.length > 0) {
                await DraftOpsRepository.removeDraftOpsByEntityIds(
                  successfulEntityIds.addons,
                  "ADDON",
                );
                successfulEntityIds.addons = []; // Reset for next chunk
              }

              const successCount =
                responseData?.okCount ||
                responseData?.results?.filter((r: any) => r.ok).length ||
                0;
              const failCount =
                responseData?.failCount ||
                responseData?.results?.filter((r: any) => !r.ok).length ||
                0;

              updateProgress({
                phase: "addons",
                current: Math.min(
                  chunkStart + chunk.length,
                  addonUpdates.length,
                ),
                total: addonUpdates.length,
                message: `Syncing addons: ${Math.min(
                  chunkStart + chunk.length,
                  addonUpdates.length,
                )}/${addonUpdates.length}`,
                batchInfo: {
                  currentBatch: chunkIndex + 1,
                  totalBatches: addonChunks.length,
                },
                errors: allErrors.length > 0 ? allErrors : undefined,
              });
            } catch (error: any) {
              console.error("Bulk addon update error:", error);
              const rawErrorMsg =
                error.message ||
                error.error?.issues?.[0]?.message ||
                "network_error";
              for (const update of chunk) {
                const addon = await db.addons.get(update.id);
                const addonName = addon?.name || update.id;
                allErrors.push({
                  id: update.id,
                  error: formatErrorMessage(
                    rawErrorMsg,
                    `Addon "${addonName}"`,
                  ),
                });
              }
              updateProgress({
                phase: "addons",
                current: Math.min(
                  chunkStart + chunk.length,
                  addonUpdates.length,
                ),
                total: addonUpdates.length,
                message: `Error syncing addons`,
                batchInfo: {
                  currentBatch: chunkIndex + 1,
                  totalBatches: addonChunks.length,
                },
                errors: allErrors,
              });
            }
          }
        }

        // Step 6b: Update kitchens (Iterative)
        if (kitchenOps.length > 0) {
          updateProgress({
            phase: "kitchens",
            current: 0,
            total: kitchenOps.length,
            message: `Updating kitchens: 0/${kitchenOps.length}`,
          });

          for (let i = 0; i < kitchenOps.length; i++) {
            const op = kitchenOps[i];
            try {
              // Resolve IDs for dishIds, removeDishIds, and staffIds
              const resolvedDishIds = op.payload.dishIds
                ? resolveIds(op.payload.dishIds as string[])
                : [];
              const resolvedRemoveDishIds = op.payload.removeDishIds
                ? resolveIds(op.payload.removeDishIds as string[])
                : [];
              const resolvedStaffIds = op.payload.staffIds
                ? resolveIds(op.payload.staffIds as string[])
                : [];

              // Resolve kitchenId (might be local UUID that needs mapping)
              const resolvedKitchenId =
                idMapping.get(op.entityId) || op.entityId;

              // Construct payload as per backend API requirements
              const updatePayload = {
                kitchenId: resolvedKitchenId,
                name: op.payload.name,
                description: op.payload.description,
                dishIds: resolvedDishIds,
                removeDishIds: resolvedRemoveDishIds,
                staffIds: resolvedStaffIds,
                businessId,
              };

              // Call backend PUT endpoint
              const response = await apiRpc.kitchen.$put({
                json: updatePayload,
              });

              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const msg = errorBody.message || `HTTP ${response.status}`;
                allErrors.push({
                  id: op.entityId,
                  error: `Kitchen update failed: ${msg}`,
                });
                continue;
              }

              // Mark kitchen as synced in Dexie
              await db.kitchens.update(op.entityId, {
                syncStatus: "SYNCED" as any,
                updatedAt: Date.now(),
              });

              successfulEntityIds.kitchens.push(op.entityId);

              updateProgress({
                phase: "kitchens",
                current: i + 1,
                total: kitchenOps.length,
                message: `Updating kitchens: ${i + 1}/${kitchenOps.length}`,
              });
            } catch (error: any) {
              console.error("Kitchen update error:", error);
              allErrors.push({
                id: op.entityId,
                error: `Kitchen update error: ${error.message}`,
              });
            }
          }

          // Remove successful UPDATE ops from draft queue
          if (successfulEntityIds.kitchens.length > 0) {
            await DraftOpsRepository.removeDraftOpsByEntityIds(
              successfulEntityIds.kitchens,
              "KITCHEN",
            );
            successfulEntityIds.kitchens = [];
          }
        }

        // Step 6c: Push Zone Kitchen Links
        const zoneKitchenOps = allDraftOps.filter(
          (op) => op.entity === "ZONE_KITCHENS" && op.opType === "UPSERT",
        );

        // Deduplicate by zoneId (last write wins)
        const zoneKitchenOpsMap = new Map<string, IDraftOp>();
        for (const op of zoneKitchenOps) {
          zoneKitchenOpsMap.set(op.entityId, op);
        }

        if (zoneKitchenOpsMap.size > 0) {
          updateProgress({
            phase: "zone_kitchens",
            current: 0,
            total: zoneKitchenOpsMap.size,
            message: `Pushing zone kitchen links: 0/${zoneKitchenOpsMap.size}`,
          });

          let processed = 0;
          for (const [zoneId, op] of zoneKitchenOpsMap.entries()) {
            try {
              const payload = op.payload as {
                businessId: string;
                zoneId: string;
                kitchenIds: string[];
              };

              // Get zone to get other fields
              const zone = await db.zones.get(zoneId);
              if (!zone) {
                allErrors.push({
                  id: zoneId,
                  error: `Zone not found: ${zoneId}`,
                });
                processed++;
                continue;
              }

              // Call PUT /zonesAndTables/zone endpoint
              const response = await apiRpc.zones_and_tables.zone.$put({
                json: {
                  businessId: payload.businessId,
                  zoneId: zoneId, // Internal MongoDB _id
                  name: zone.name,
                  staffIds: zone.staffIds || [],
                  visibility: zone.visibility,
                  tableIds: zone.tableIds || [],
                  kitchenIds: payload.kitchenIds, // Final kitchen IDs
                },
              });

              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const msg = errorBody.message || `HTTP ${response.status}`;
                allErrors.push({
                  id: zoneId,
                  error: `Zone kitchen link failed: ${msg}`,
                });
                processed++;
                continue;
              }

              successfulEntityIds.zoneKitchens =
                successfulEntityIds.zoneKitchens || [];
              successfulEntityIds.zoneKitchens.push(zoneId);

              processed++;
              updateProgress({
                phase: "zone_kitchens",
                current: processed,
                total: zoneKitchenOpsMap.size,
                message: `Pushing zone kitchen links: ${processed}/${zoneKitchenOpsMap.size}`,
              });
            } catch (error: any) {
              console.error("Zone kitchen link error:", error);
              allErrors.push({
                id: zoneId,
                error: `Zone kitchen link error: ${error.message}`,
              });
              processed++;
            }
          }

          // Remove successful ops
          if (successfulEntityIds.zoneKitchens?.length > 0) {
            await DraftOpsRepository.removeDraftOpsByEntityIds(
              successfulEntityIds.zoneKitchens,
              "ZONE_KITCHENS",
            );
            successfulEntityIds.zoneKitchens = [];
          }
        }

        // Step 6d: Push Dish Zone Kitchen Mappings (Bulk)
        const dishRoutingOps = allDraftOps.filter(
          (op) => op.entity === "DISH_ZONE_KITCHEN" && op.opType === "UPSERT",
        );

        if (dishRoutingOps.length > 0) {
          updateProgress({
            phase: "dish_routing",
            current: 0,
            total: dishRoutingOps.length,
            message: `Pushing dish routing links: 0/${dishRoutingOps.length}`,
          });

          // Chunk into batches of 200
          const chunks = chunk(dishRoutingOps, 200);

          for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
            const chunk = chunks[chunkIndex];
            const chunkStart = chunkIndex * 200;

            try {
              // Build payload array
              const dishZoneKitches = chunk.map((op) => {
                const payload = op.payload as {
                  businessId: string;
                  dishId: string;
                  zoneId: string;
                  kitchenId: string;
                };

                // Resolve IDs if needed
                return {
                  businessId: payload.businessId,
                  dishId: resolveIds([payload.dishId])[0],
                  zoneId: payload.zoneId,
                  kitchenId: resolveIds([payload.kitchenId])[0],
                };
              });

              // Call POST /dishZoneKitchen endpoint
              const response = await apiRpc.dish_zone_kitchen.$post({
                json: {
                  dishZoneKitches, // Note: backend uses this typo
                },
              });

              if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const msg = errorBody.message || `HTTP ${response.status}`;

                for (const op of chunk) {
                  allErrors.push({
                    id: op.entityId,
                    error: `Dish routing failed: ${msg}`,
                  });
                }
                updateProgress({
                  phase: "dish_routing",
                  current: Math.min(
                    chunkStart + chunk.length,
                    dishRoutingOps.length,
                  ),
                  total: dishRoutingOps.length,
                  message: `Error pushing dish routing`,
                  errors: allErrors,
                });
                continue;
              }

              // All succeeded in this chunk
              successfulEntityIds.dishRouting =
                successfulEntityIds.dishRouting || [];
              successfulEntityIds.dishRouting.push(
                ...chunk.map((op) => op.entityId),
              );

              // Remove successful ops
              await DraftOpsRepository.removeDraftOpsByEntityIds(
                chunk.map((op) => op.entityId),
                "DISH_ZONE_KITCHEN",
              );

              updateProgress({
                phase: "dish_routing",
                current: Math.min(
                  chunkStart + chunk.length,
                  dishRoutingOps.length,
                ),
                total: dishRoutingOps.length,
                message: `Pushing dish routing links: ${Math.min(
                  chunkStart + chunk.length,
                  dishRoutingOps.length,
                )}/${dishRoutingOps.length}`,
              });
            } catch (error: any) {
              console.error("Dish routing bulk error:", error);
              for (const op of chunk) {
                allErrors.push({
                  id: op.entityId,
                  error: `Dish routing error: ${error.message}`,
                });
              }
              updateProgress({
                phase: "dish_routing",
                current: Math.min(
                  chunkStart + chunk.length,
                  dishRoutingOps.length,
                ),
                total: dishRoutingOps.length,
                message: `Error pushing dish routing`,
                errors: allErrors,
              });
            }
          }
        }

        // Step 7: Update draftOps count after removing successful items
        const remainingCount = await DraftOpsRepository.getDraftOpsCount();
        setDraftOpsCount(remainingCount);

        // Step 8: Check for errors - show summary
        if (allErrors.length > 0) {
          const totalAttempted =
            dishOps.length + categoryOps.length + addonOps.length;
          const totalSucceeded = totalAttempted - allErrors.length;

          updateProgress({
            phase: "error",
            current: allErrors.length,
            total: totalAttempted,
            message: `${totalSucceeded} succeeded, ${allErrors.length} failed. Only failed items remain in queue.`,
            errors: allErrors,
          });

          toast.error(
            `${allErrors.length} update(s) failed. Please fix the errors and try again.`,
          );

          // Don't throw - let the user see the errors and retry
          return {
            success: false,
            count: totalSucceeded,
            errors: allErrors.length,
          };
        }

        // Step 9: All succeeded - update timestamp
        setLastPushedAt(Date.now());

        const totalCreates =
          createOps.categories.length +
          createOps.addons.length +
          createOps.dishes.length;
        const totalUpdates =
          dishOps.length + categoryOps.length + addonOps.length;
        const totalChanges = totalCreates + totalUpdates;

        updateProgress({
          phase: "complete",
          current: totalChanges,
          total: totalChanges,
          message: `Successfully pushed ${totalChanges} changes (${totalCreates} created, ${totalUpdates} updated) at ${new Date().toLocaleTimeString()}`,
        });

        toast.success(
          `Pushed ${totalChanges} changes successfully (${totalCreates} created, ${totalUpdates} updated)`,
        );
        return { success: true, count: totalChanges };
      } catch (error: any) {
        updateProgress({
          phase: "error",
          current: 0,
          total: 0,
          message: error.message || "Failed to push changes",
          errors: progress?.errors || [],
        });
        toast.error(error.message || "Failed to push changes");
        throw error;
      }
    },
    [businessId, setLastPushedAt, setDraftOpsCount, progress],
  );

  const { mutateAsync, isPending } = useMutation({
    mutationFn: pushMenu,
  });

  return {
    pushMenu: mutateAsync,
    isPushing: isPending,
    progress,
    setProgress,
  };
};
