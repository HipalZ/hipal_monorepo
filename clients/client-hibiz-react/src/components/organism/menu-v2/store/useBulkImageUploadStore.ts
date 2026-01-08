/**
 * Zustand Store: Bulk Image Upload
 *
 * Manages all state for bulk image upload and assignment flow.
 * No React local state (useState) - all state lives here.
 */

import { create } from "zustand";
import type { MenuDish } from "../types";

// ============================================================================
// Types
// ============================================================================

export type ImageProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "error";

export interface ProcessedImage {
  id: string;
  file?: File; // Optional for reused images
  preview: string; // Base64 data URL (for storage/upload) OR existing URL string
  previewUrl?: string; // Blob URL (for display only)
  blob?: Blob; // Optional for reused images
  filename: string;
  originalSize?: number;
  compressedSize?: number;
  assignedDishId: string | null;
  assignedDishName: string | null;
  assignedSlot: 1 | 2 | 3 | null; // Slot assignment
  confidence: number | null;
  status: ImageProcessingStatus;
  error?: string;
  isReused?: boolean; // Flag for existing images (skip upload)
  hash?: string; // SHA-256 hash for deduplication
}

export interface BulkImageUploadState {
  // Images
  processedImages: ProcessedImage[];

  // Processing state
  processingQueue: File[];
  isProcessing: boolean;
  activeJobId: string | null;
  completedImageIds: Set<string>;
  progress: {
    current: number;
    total: number;
  };

  // Assignment state
  isAssigning: boolean;
  assignmentProgress: {
    current: number;
    total: number;
  };

  // UI state
  dragActive: boolean;
  dishSearch: string;
  showUploadMore: boolean;
  imageFilter: "all" | "unassigned";

  // Modals
  showExistingImagesPicker: boolean;
  showSaveProgress: boolean;
  saveProgress: {
    phase: "local" | "upload" | "apply";
    current: number;
    total: number;
    message?: string;
  } | null;

  // Actions: Image management
  addImagesToQueue: (files: File[]) => void;
  removeFromQueue: (file: File) => void;
  removeImage: (imageId: string) => void;
  addImage: (image: ProcessedImage) => void;
  updateImage: (imageId: string, updates: Partial<ProcessedImage>) => void;
  addReusedImages: (urls: string[], filenames: string[]) => void;

  // Actions: Processing
  startJob: (jobId: string, totalFiles: number) => void;
  stopJob: () => void;
  markJobImageCompleted: (jobId: string, imageId: string) => boolean;
  incrementProgress: (jobId: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProgress: (progress: { current: number; total: number }) => void;

  // Actions: Assignment
  assignImageToDish: (
    imageId: string,
    dishId: string,
    dishName: string,
    slot: 1 | 2 | 3,
  ) => void;
  unassignImage: (imageId: string) => void;
  setAssigning: (isAssigning: boolean) => void;
  setAssignmentProgress: (progress: { current: number; total: number }) => void;

  // Actions: UI
  setDragActive: (active: boolean) => void;
  setDishSearch: (search: string) => void;
  setShowUploadMore: (show: boolean) => void;
  setImageFilter: (filter: "all" | "unassigned") => void;

  // Actions: Modals
  setShowExistingImagesPicker: (show: boolean) => void;
  setShowSaveProgress: (show: boolean) => void;
  setSaveProgress: (progress: BulkImageUploadState["saveProgress"]) => void;

  // Actions: Reset
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: Omit<
  BulkImageUploadState,
  keyof {
    addImagesToQueue: never;
    removeFromQueue: never;
    removeImage: never;
    addImage: never;
    updateImage: never;
    addReusedImages: never;
    startJob: never;
    stopJob: never;
    markJobImageCompleted: never;
    incrementProgress: never;
    setProcessing: never;
    setProgress: never;
    assignImageToDish: never;
    unassignImage: never;
    setAssigning: never;
    setAssignmentProgress: never;
    setDragActive: never;
    setDishSearch: never;
    setShowUploadMore: never;
    setImageFilter: never;
    setShowExistingImagesPicker: never;
    setShowSaveProgress: never;
    setSaveProgress: never;
    reset: never;
  }
> = {
  processedImages: [],
  processingQueue: [],
  isProcessing: false,
  progress: { current: 0, total: 0 },
  activeJobId: null,
  completedImageIds: new Set(),
  isAssigning: false,
  assignmentProgress: { current: 0, total: 0 },
  dragActive: false,
  dishSearch: "",
  showUploadMore: false,
  imageFilter: "all",
  showExistingImagesPicker: false,
  showSaveProgress: false,
  saveProgress: null,
};

// ============================================================================
// Store
// ============================================================================

export const useBulkImageUploadStore = create<BulkImageUploadState>(
  (set, get) => ({
    ...initialState,

    // Add images to processing queue
    addImagesToQueue: (files) => {
      set((state) => ({
        processingQueue: [...state.processingQueue, ...files],
      }));
    },

    // Remove file from processing queue
    removeFromQueue: (file) => {
      set((state) => ({
        processingQueue: state.processingQueue.filter((f) => f !== file),
      }));
    },

    // Remove image from processed images
    removeImage: (imageId) => {
      set((state) => {
        const image = state.processedImages.find((img) => img.id === imageId);

        // Revoke blob URL if exists
        if (image?.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }

        return {
          processedImages: state.processedImages.filter(
            (img) => img.id !== imageId,
          ),
        };
      });
    },

    // Add a new image to processed images (clean insertion)
    addImage: (image) => {
      set((state) => {
        // Check if image with same ID already exists (prevent duplicates)
        const existingIndex = state.processedImages.findIndex(
          (img) => img.id === image.id,
        );

        if (existingIndex >= 0) {
          // Image exists - update it instead (safe fallback)
          const updated = [...state.processedImages];
          updated[existingIndex] = { ...updated[existingIndex], ...image };
          return { processedImages: updated };
        }

        // New image - add to array
        return {
          processedImages: [...state.processedImages, image],
        };
      });
    },

    // Update a specific image (ONLY updates existing - does NOT insert)
    // Use addImage() to create new entries
    updateImage: (imageId, updates) => {
      set((state) => {
        const existingIndex = state.processedImages.findIndex(
          (img) => img.id === imageId,
        );

        if (existingIndex < 0) {
          // Image doesn't exist - log warning but don't insert (prevent silent bugs)
          console.warn(
            `[BulkImageUploadStore] updateImage called for non-existent imageId: ${imageId}. Use addImage() to create new entries.`,
          );
          return state; // Return unchanged state
        }

        // Image exists - update it
        return {
          processedImages: state.processedImages.map((img) =>
            img.id === imageId ? { ...img, ...updates } : img,
          ),
        };
      });
    },

    // Add reused images (from existing dishes)
    addReusedImages: (urls, filenames) => {
      const newImages: ProcessedImage[] = urls.map((url, index) => {
        const imageId = `reused-${Date.now()}-${Math.random()}-${url.slice(
          -10,
        )}`;
        const filename =
          filenames[index] || url.split("/").pop() || "existing-image.jpg";

        return {
          id: imageId,
          preview: url,
          filename,
          assignedDishId: null,
          assignedDishName: null,
          assignedSlot: null,
          confidence: null,
          status: "completed",
          isReused: true,
        };
      });

      set((state) => ({
        processedImages: [...state.processedImages, ...newImages],
        showUploadMore: true,
      }));
    },

    // Processing actions
    startJob: (jobId, totalFiles) => {
      set({
        activeJobId: jobId,
        progress: { current: 0, total: totalFiles },
        completedImageIds: new Set(),
        isProcessing: true,
      });
    },

    stopJob: () => {
      set({
        activeJobId: null,
        isProcessing: false,
      });
    },

    // Guard: Returns true if image was NOT previously completed for this job
    // This allows the worker to atomically check-and-set completion status
    markJobImageCompleted: (jobId: string, imageId: string) => {
      const state = get();
      if (state.activeJobId !== jobId) return false;
      if (state.completedImageIds.has(imageId)) return false;

      const newSet = new Set(state.completedImageIds);
      newSet.add(imageId);
      set({ completedImageIds: newSet });
      return true;
    },

    incrementProgress: (jobId) => {
      set((state) => {
        // Only increment if matching active job
        if (state.activeJobId !== jobId) return state;

        const newCurrent = Math.min(
          state.progress.current + 1,
          state.progress.total,
        );
        return {
          progress: { ...state.progress, current: newCurrent },
        };
      });
    },

    setProcessing: (isProcessing) => {
      set({ isProcessing });
    },

    setProgress: (progress) => {
      set({ progress });
    },

    // Assignment actions
    assignImageToDish: (imageId, dishId, dishName, slot) => {
      set((state) => ({
        processedImages: state.processedImages.map((img) =>
          img.id === imageId
            ? {
                ...img,
                assignedDishId: dishId,
                assignedDishName: dishName,
                assignedSlot: slot,
                // Preserve existing status (should be 'completed' when assigning, but don't change it)
              }
            : img,
        ),
      }));
    },

    unassignImage: (imageId) => {
      set((state) => ({
        processedImages: state.processedImages.map((img) =>
          img.id === imageId
            ? {
                ...img,
                assignedDishId: null,
                assignedDishName: null,
                assignedSlot: null,
                confidence: null,
              }
            : img,
        ),
      }));
    },

    setAssigning: (isAssigning) => {
      set({ isAssigning });
    },

    setAssignmentProgress: (assignmentProgress) => {
      set({ assignmentProgress });
    },

    // UI actions
    setDragActive: (dragActive) => {
      set({ dragActive });
    },

    setDishSearch: (dishSearch) => {
      set({ dishSearch });
    },

    setShowUploadMore: (showUploadMore) => {
      set({ showUploadMore });
    },

    setImageFilter: (imageFilter) => {
      set({ imageFilter });
    },

    // Modal actions
    setShowExistingImagesPicker: (showExistingImagesPicker) => {
      set({ showExistingImagesPicker });
    },

    setShowSaveProgress: (showSaveProgress) => {
      set({ showSaveProgress });
    },

    setSaveProgress: (saveProgress) => {
      set({ saveProgress });
    },

    // Reset all state
    reset: () => {
      const state = get();

      // Revoke all blob URLs
      for (const image of state.processedImages) {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      }

      set(initialState);
    },
  }),
);

// ============================================================================
// Selectors (for derived state)
// ============================================================================

/**
 * Get unassigned images
 */
export const selectUnassignedImages = (
  state: BulkImageUploadState,
): ProcessedImage[] => {
  return state.processedImages.filter(
    (img) => img.status === "completed" && !img.assignedDishId,
  );
};

/**
 * Get assigned images count
 */
export const selectAssignedImagesCount = (
  state: BulkImageUploadState,
): number => {
  return state.processedImages.filter(
    (img) => img.status === "completed" && img.assignedDishId,
  ).length;
};

/**
 * Get completed images count
 */
export const selectCompletedImagesCount = (
  state: BulkImageUploadState,
): number => {
  return state.processedImages.filter((img) => img.status === "completed")
    .length;
};

/**
 * Get filtered images based on current filter
 */
export const selectFilteredImages = (
  state: BulkImageUploadState,
): ProcessedImage[] => {
  if (state.imageFilter === "unassigned") {
    return state.processedImages.filter(
      (img) => img.status === "completed" && !img.assignedDishId,
    );
  }
  return state.processedImages;
};
