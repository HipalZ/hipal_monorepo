/**
 * BulkImageUploadModal Component
 *
 * High-performance bulk image upload for dishes.
 * Production-grade architecture: Zustand store, domain utilities, service layer.
 * Uses Web Workers for image processing and auto-matches images to dishes.
 */

import PopUp from '@/components/atom/popUp';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Images, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { PendingImagesRepository } from '../db/PendingImagesRepository';
import { parseDishImageLabel } from '../domain/imageLabelParser';
import { getTargetSlot, MAX_IMAGES_PER_DISH } from '../domain/slotManager';
import { useImageSync } from '../hooks/useImageSync';
import { batchAutoAssignImages } from '../services/imageAssignmentService';
import { createBlobUrl, createImageWorker, generateHashFromDataUrl } from '../services/imageProcessingService';
import { selectCompletedImagesCount, selectUnassignedImages, useBulkImageUploadStore, type ProcessedImage } from '../store/useBulkImageUploadStore';
import '../styles/brutalist.css';
import type { MenuDish, MenuLayout } from '../types';
import { ExistingImagesPickerModal } from './modals/ExistingImagesPickerModal';
import { SaveProgressModal, type SaveProgress } from './SaveProgressModal';
import { SharedDishConfirmModal } from './SharedDishConfirmModal';

interface PendingConfirmation {
  imageId: string;
  dishId: string;
  nameKey: string;
  dishName: string;
  menuNames: string[];
}

interface BulkImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishes: MenuDish[];
  businessId: string;
  menus: MenuLayout[];
  onSave: (assignments: Map<string, { nameKey: string; dishIds: string[]; images: Array<{ preview: string; file: File }> }>) => Promise<void>;
}

interface PendingConfirmation {
  imageId: string;
  dishId: string;
  nameKey: string;
  dishName: string;
  menuNames: string[];
}

export const BulkImageUploadModal = ({ isOpen, onClose, dishes, businessId, menus, onSave }: BulkImageUploadModalProps) => {
  // Zustand store (NO useState!)
  const store = useBulkImageUploadStore();
  const {
    processedImages,
    processingQueue,
    isProcessing,
    progress,
    isAssigning,
    assignmentProgress,
    dragActive,
    dishSearch,
    showUploadMore,
    imageFilter,
    showExistingImagesPicker,
    showSaveProgress,
    removeFromQueue,
    removeImage: removeImageFromStore,
    addImage,
    addReusedImages,
    assignImageToDish: assignImageToDishInStore,
    unassignImage,
    setAssigning,
    setAssignmentProgress,
    setDragActive,
    setDishSearch,
    setShowUploadMore,
    setImageFilter,
    setShowExistingImagesPicker,
    setShowSaveProgress,
    setSaveProgress,
    reset: resetStore,
  } = store;

  // Derived state (selectors)
  const unassignedImages = useBulkImageUploadStore(selectUnassignedImages);
  const completedCount = useBulkImageUploadStore(selectCompletedImagesCount);

  // Local state for pending confirmation and save progress (modal-specific, different types than store)
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [saveProgressLocal, setSaveProgressLocal] = useState<SaveProgress | null>(null);

  // Refs
  const workerRef = useRef<Worker | null>(null);
  const originalFileSizesRef = useRef<Map<string, number>>(new Map());
  const dishesRef = useRef(dishes);
  const handleAutoAssignAutomaticallyRef = useRef<((images: ProcessedImage[], dishes: MenuDish[]) => Promise<void>) | null>(null);

  // Use image sync hook to detect shared dishes
  const { getSharedDishInfo, getAvailableSlots, getSharedDishIds, getGlobalImages } = useImageSync({
    businessId,
    dishes,
    menus,
  });

  // Helper to calculate available slots including pending assignments in this session
  const getAvailableSlotsWithPending = useCallback(
    (dishId: string, nameKey?: string): number => {
      const baseSlots = getAvailableSlots(dishId, nameKey);

      // Count pending assignments for this dish (or shared dishes) in current session
      const sharedDishIds = getSharedDishIds(dishId, nameKey);
      const pendingCount = processedImages.filter(
        (img) => img.status === 'completed' && img.assignedDishId && sharedDishIds.includes(img.assignedDishId),
      ).length;

      return Math.max(0, baseSlots - pendingCount);
    },
    [getAvailableSlots, getSharedDishIds, processedImages],
  );

  // Keep refs in sync
  useEffect(() => {
    dishesRef.current = dishes;
  }, [dishes]);

  // Reset store on close
  useEffect(() => {
    if (!isOpen) {
      resetStore();
      setPendingConfirmation(null);
      originalFileSizesRef.current.clear();
    }
  }, [isOpen, resetStore]);

  // Process next batch of files from queue (chunked processing)
  const processNextBatch = useCallback(
    async (batchSize = 5) => {
      if (!workerRef.current || !isOpen) return;

      const currentQueue = useBulkImageUploadStore.getState().processingQueue;
      if (currentQueue.length === 0) {
        // Queue empty - do nothing (completion handled in worker callback)
        return;
      }

      // Process a small batch at a time
      const batch = currentQueue.slice(0, Math.min(batchSize, currentQueue.length));

      for (const file of batch) {
        const imageId = `img-${Date.now()}-${Math.random()}-${file.name}`;

        // Add to store with processing status
        addImage({
          id: imageId,
          file,
          filename: file.name,
          preview: '',
          status: 'processing',
          assignedDishId: null,
          assignedDishName: null,
          assignedSlot: null,
          confidence: null,
        });

        workerRef.current.postMessage({
          file,
          maxWidth: 1080,
          maxHeight: 1080,
          imageId,
        });

        removeFromQueue(file);
      }

      // Schedule next batch
      const remainingQueue = useBulkImageUploadStore.getState().processingQueue;
      if (remainingQueue.length > 0) {
        setTimeout(() => processNextBatch(batchSize), 100);
      }
    },
    [isOpen, addImage, removeFromQueue],
  );

  // Initialize worker and handle messages
  useEffect(() => {
    if (isOpen) {
      workerRef.current = createImageWorker();
      const worker = workerRef.current;

      worker.onmessage = async (e) => {
        const { blob, originalName, error, imageId } = e.data;
        const store = useBulkImageUploadStore.getState();
        const currentJobId = store.activeJobId;

        // CRITICAL GUARD: Ensure we are processing the active job
        if (!currentJobId) return;

        // CRITICAL GUARD: Atomically mark image as completed for this job
        // If returns false, it means we already processed this image for this job
        if (!store.markJobImageCompleted(currentJobId, imageId)) {
          return;
        }

        if (error) {
          store.updateImage(imageId, { status: 'error', error });
          // Increment progress only once per image (guarded above)
          store.incrementProgress(currentJobId);

          // Check for job completion
          const freshState = useBulkImageUploadStore.getState();
          if (freshState.progress.current >= freshState.progress.total) {
            store.setProcessing(false);
          }
          return;
        }

        // Process successful result
        const originalSize = originalFileSizesRef.current.get(originalName) || 0;
        const compressedSize = blob.size;

        // Convert blob to base64
        let base64DataUrl = '';
        try {
          base64DataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Failed to convert')));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.error('Base64 conversion failed', err);
          // Treat as error
          store.updateImage(imageId, { status: 'error', error: 'Conversion failed' });
          store.incrementProgress(currentJobId);
          return;
        }

        const previewUrl = createBlobUrl(blob);
        const processedFile = new File([blob], originalName, { type: 'image/jpeg' });
        const imageHash = await generateHashFromDataUrl(base64DataUrl);

        store.updateImage(imageId, {
          file: processedFile,
          blob,
          preview: base64DataUrl,
          previewUrl,
          originalSize,
          compressedSize,
          status: 'completed',
          assignedDishId: null,
          assignedDishName: null,
          assignedSlot: null,
          confidence: null,
          hash: imageHash,
        });

        // Increment progress (guarded to only run once per image)
        store.incrementProgress(currentJobId);

        // Check completion
        const finalState = useBulkImageUploadStore.getState();

        // Only trigger completion logic if ALL images are done
        if (finalState.progress.current >= finalState.progress.total) {
          store.setProcessing(false);

          // Trigger one-time auto-assignment
          // We use a timeout to let UI update first, but the guard ensures it runs once per job
          setTimeout(() => {
            const stateAfter = useBulkImageUploadStore.getState();
            // Double check we are still on the same job and it's done
            if (stateAfter.activeJobId !== currentJobId) return;

            const unassigned = stateAfter.processedImages.filter((img) => img.status === 'completed' && !img.assignedDishId);
            if (unassigned.length > 0) {
              handleAutoAssignAutomaticallyRef.current?.(unassigned, dishesRef.current).catch(() => {});
            }
          }, 500);
        }
      };

      worker.onerror = (error) => {
        console.error('[BulkImageUpload] Worker error', error);
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isOpen]); // Only Run on Open/Close

  // Handle new files -> Start Job
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
      if (fileArray.length === 0) return;

      const filesToProcess = fileArray.slice(0, 100);
      const store = useBulkImageUploadStore.getState();

      // Start a new job
      const newJobId = `job-${Date.now()}`;
      store.startJob(newJobId, filesToProcess.length);

      // Store original sizes
      for (const file of filesToProcess) {
        originalFileSizesRef.current.set(file.name, file.size);
      }

      // Add all to queue immediately
      store.addImagesToQueue(filesToProcess);

      // Kick off processing
      // We don't need chunking for adding to queue as it's fast,
      // but processNextBatch handles the actual heavy lifting order
      setTimeout(() => processNextBatch(5), 50);
    },
    [processNextBatch],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles, setDragActive],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    },
    [setDragActive],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    },
    [setDragActive],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set dragActive to false if we're leaving the drop zone (not entering a child)
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setDragActive(false);
      }
    },
    [setDragActive],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles],
  );

  const removeImage = useCallback(
    (id: string) => {
      removeImageFromStore(id);
    },
    [removeImageFromStore],
  );

  const assignToDish = useCallback(
    (imageId: string, dishId: string | null) => {
      if (!dishId) {
        // Unassign
        unassignImage(imageId);
        return;
      }

      const dish = dishes.find((d) => d._id === dishId);
      if (!dish) return;

      const nameKey = dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
      const image = processedImages.find((img) => img.id === imageId);

      if (!image) return;

      // Only allow assignment if image is completed
      if (image.status !== 'completed') {
        toast.error('Image is still processing. Please wait...');
        return;
      }

      // Check if image URL already exists in dish
      const globalImages = getGlobalImages(dishId, nameKey);
      if (globalImages.includes(image.preview)) {
        toast.error('Image already added for this item');
        return;
      }

      // Check pending assignments for duplicates
      const sharedDishIds = getSharedDishIds(dishId, nameKey);
      const hasPendingDuplicate = processedImages.some(
        (img) =>
          img.status === 'completed' &&
          img.assignedDishId &&
          sharedDishIds.includes(img.assignedDishId) &&
          img.preview === image.preview &&
          img.id !== imageId,
      );

      if (hasPendingDuplicate) {
        toast.error('Image already added for this item');
        return;
      }

      // Check available slots including pending assignments
      const baseSlots = getAvailableSlots(dishId, nameKey);
      const pendingCount = processedImages.filter(
        (img) => img.status === 'completed' && img.assignedDishId && sharedDishIds.includes(img.assignedDishId),
      ).length;
      const availableSlots = Math.max(0, baseSlots - pendingCount);

      if (availableSlots === 0) {
        toast.error(`Max ${MAX_IMAGES_PER_DISH} images allowed per item`);
        return;
      }

      // Parse image label to get preferred slot
      const parsed = parseDishImageLabel(image.filename);
      const preferredSlot = parsed.slot;

      // Get target slot using domain utility
      const targetSlot = getTargetSlot(dish, preferredSlot);

      if (!targetSlot) {
        toast.error(`Max ${MAX_IMAGES_PER_DISH} images allowed per item`);
        return;
      }

      const sharedInfo = getSharedDishInfo(dishId, nameKey);

      // Check if dish is shared across multiple menus
      if (sharedInfo && sharedInfo.instances.length > 1) {
        // Show confirmation modal
        setPendingConfirmation({
          imageId,
          dishId,
          nameKey,
          dishName: sharedInfo.dishName,
          menuNames: sharedInfo.instances.map((i) => i.menuName),
        });
      } else {
        // Not shared - assign directly using store action
        assignImageToDishInStore(imageId, dishId, dish.name || 'Unknown', targetSlot);
      }
    },
    [dishes, getSharedDishInfo, getAvailableSlots, getSharedDishIds, getGlobalImages, processedImages, unassignImage, assignImageToDishInStore],
  );

  const handleConfirmAssignment = useCallback(() => {
    if (!pendingConfirmation) return;

    const dish = dishes.find((d) => d._id === pendingConfirmation.dishId);
    if (!dish) return;

    const image = processedImages.find((img) => img.id === pendingConfirmation.imageId);
    if (!image) return;

    // Parse image label to get preferred slot
    const parsed = parseDishImageLabel(image.filename);
    const preferredSlot = parsed.slot;

    // Get target slot using domain utility
    const targetSlot = getTargetSlot(dish, preferredSlot);

    if (targetSlot) {
      assignImageToDishInStore(pendingConfirmation.imageId, pendingConfirmation.dishId, dish.name || 'Unknown', targetSlot);
    }

    setPendingConfirmation(null);
  }, [pendingConfirmation, dishes, processedImages, assignImageToDishInStore]);

  const handleCancelAssignment = useCallback(() => {
    setPendingConfirmation(null);
  }, []);

  // Internal auto-assign function (can be called automatically or manually)
  const handleAutoAssignAutomatically = useCallback(async (imagesToAssign: ProcessedImage[], dishesList: MenuDish[]) => {
    if (imagesToAssign.length === 0) {
      return;
    }

    const store = useBulkImageUploadStore.getState();
    store.setAssigning(true);
    store.setAssignmentProgress({ current: 0, total: imagesToAssign.length });

    try {
      // Get existing assignments
      const currentProcessed = store.processedImages;
      const existingAssignments = new Map(currentProcessed.filter((img) => img.assignedDishId).map((img) => [img.id, img.assignedDishId!]));

      // C) Fix: Pass getAvailableSlotsWithPending to auto-assign service
      // This ensures auto-assign uses same logic as manual assign (accounts for pending + shared dishes)
      // Note: getAvailableSlots and getSharedDishIds are stable from useImageSync hook, so no need to include in deps
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const getSlotsWithPending = (dishId: string, nameKey?: string) => {
        const storeState = useBulkImageUploadStore.getState();
        const baseSlots = getAvailableSlots(dishId, nameKey);
        const sharedDishIds = getSharedDishIds(dishId, nameKey);
        const pendingCount = storeState.processedImages.filter(
          (img) => img.status === 'completed' && img.assignedDishId && sharedDishIds.includes(img.assignedDishId),
        ).length;
        return Math.max(0, baseSlots - pendingCount);
      };

      // Use service layer for batch auto-assignment
      const assignments = await batchAutoAssignImages(
        imagesToAssign,
        dishesList,
        existingAssignments,
        {
          minConfidence: 0.6,
          respectSlotConstraints: true,
          skipFullDishes: true,
          getAvailableSlotsWithPending: getSlotsWithPending, // C) Fix: Pass callback
        },
        10, // batch size
        (processed, total) => {
          const progressStore = useBulkImageUploadStore.getState();
          progressStore.setAssignmentProgress({ current: processed, total });
        },
      );

      // Apply assignments using store action
      for (const assignment of assignments) {
        const assignStore = useBulkImageUploadStore.getState();
        assignStore.assignImageToDish(assignment.imageId, assignment.dishId, assignment.dishName, assignment.slot);
      }

      if (assignments.length > 0) {
        toast.success(`Auto-assigned ${assignments.length} image(s) to dishes`);
      }
    } catch (error) {
      console.error('Auto-assignment error:', error);
      toast.error('Failed to auto-assign images');
    } finally {
      const finalStore = useBulkImageUploadStore.getState();
      finalStore.setAssigning(false);
    }
  }, []);

  // Store the function in ref so it's accessible in worker callback
  useEffect(() => {
    handleAutoAssignAutomaticallyRef.current = handleAutoAssignAutomatically;
  }, [handleAutoAssignAutomatically]);

  // Auto-assign images using service layer (manual trigger from button)
  const handleAutoAssign = useCallback(async () => {
    if (unassignedImages.length === 0) {
      toast.success('All images are already assigned');
      return;
    }

    setAssigning(true);
    setAssignmentProgress({ current: 0, total: unassignedImages.length });

    try {
      // Get existing assignments
      const existingAssignments = new Map(processedImages.filter((img) => img.assignedDishId).map((img) => [img.id, img.assignedDishId!]));

      // C) Fix: Pass getAvailableSlotsWithPending to auto-assign service
      // Note: getAvailableSlots and getSharedDishIds are stable from useImageSync hook
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const getSlotsWithPending = (dishId: string, nameKey?: string) => {
        const baseSlots = getAvailableSlots(dishId, nameKey);
        const sharedDishIds = getSharedDishIds(dishId, nameKey);
        const pendingCount = processedImages.filter(
          (img) => img.status === 'completed' && img.assignedDishId && sharedDishIds.includes(img.assignedDishId),
        ).length;
        return Math.max(0, baseSlots - pendingCount);
      };

      // Use service layer for batch auto-assignment
      const assignments = await batchAutoAssignImages(
        unassignedImages,
        dishes,
        existingAssignments,
        {
          minConfidence: 0.6,
          respectSlotConstraints: true,
          skipFullDishes: true,
          getAvailableSlotsWithPending: getSlotsWithPending, // C) Fix: Pass callback
        },
        10, // batch size
        (processed, total) => {
          setAssignmentProgress({ current: processed, total });
        },
      );

      // Apply assignments using store action
      for (const assignment of assignments) {
        assignImageToDishInStore(assignment.imageId, assignment.dishId, assignment.dishName, assignment.slot);
      }

      toast.success(`Auto-assigned ${assignments.length} image(s)`);
    } catch (error) {
      console.error('Auto-assignment error:', error);
      toast.error('Failed to auto-assign images');
    } finally {
      setAssigning(false);
    }
  }, [unassignedImages, processedImages, dishes, setAssigning, setAssignmentProgress, assignImageToDishInStore]);

  const handleSelectExistingImage = useCallback(
    (urls: string[]) => {
      if (urls.length === 0) return;

      // Filter out URLs that are already in processedImages
      const existingUrls = new Set(processedImages.map((img) => img.preview));
      const newUrls = urls.filter((url) => !existingUrls.has(url));

      if (newUrls.length === 0) {
        toast.error('All selected images are already added');
        return;
      }

      if (newUrls.length < urls.length) {
        toast.error(`${urls.length - newUrls.length} image(s) already added, adding ${newUrls.length} new image(s)`);
      }

      // Create filenames from URLs
      const filenames = newUrls.map((url) => url.split('/').pop() || 'existing-image.jpg');

      // Use store action to add reused images
      addReusedImages(newUrls, filenames);

      if (newUrls.length > 0) {
        toast.success(`Added ${newUrls.length} image(s)`);
      }
    },
    [processedImages, addReusedImages],
  );

  const handleSave = useCallback(async () => {
    // Get fresh state to ensure we have latest assignments
    const store = useBulkImageUploadStore.getState();
    const currentProcessedImages = store.processedImages;

    try {
      // Group images by nameKey (for global sync) instead of dishId
      const assignmentsByNameKey = new Map<
        string,
        {
          nameKey: string;
          dishIds: string[];
          images: Array<{ preview: string; file?: File; isReused?: boolean }>;
        }
      >();

      const completedAssignedImages = currentProcessedImages.filter((img) => img.status === 'completed' && img.assignedDishId);

      if (completedAssignedImages.length === 0) {
        toast.error('No images assigned to save');
        return;
      }

      let assignmentCount = 0;
      for (const img of completedAssignedImages) {
        const dish = dishes.find((d) => d._id === img.assignedDishId);
        if (!dish) {
          continue;
        }

        const nameKey = dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
        if (!nameKey) {
          continue;
        }

        // Get all dish IDs that share this nameKey (for global sync)
        if (!img.assignedDishId) continue;

        const sharedDishIds = getSharedDishIds(img.assignedDishId, nameKey);

        // Get available slots
        const availableSlots = getAvailableSlots(img.assignedDishId, nameKey);

        if (!assignmentsByNameKey.has(nameKey)) {
          assignmentsByNameKey.set(nameKey, {
            nameKey,
            dishIds: sharedDishIds,
            images: [],
          });
        }

        const assignment = assignmentsByNameKey.get(nameKey)!;

        // Only add images up to the available slots
        if (assignment.images.length < availableSlots) {
          assignment.images.push({
            preview: img.preview,
            file: img.file || new File([], 'dummy.jpg', { type: 'image/jpeg' }),
            isReused: img.isReused || false,
          });
        }

        assignmentCount++;
        setAssignmentProgress({
          current: assignmentCount,
          total: completedAssignedImages.length,
        });
      }

      // Prepare all pending image saves
      const pendingSaves: Array<{
        dishId: string;
        images: Array<{ preview: string; file: File }>;
        dishName: string;
      }> = [];

      for (const [, assignment] of assignmentsByNameKey.entries()) {
        for (const dishId of assignment.dishIds) {
          const dish = dishes.find((d) => d._id === dishId);
          const existingImages = Array.isArray(dish?.images) ? dish.images : [];
          const existingUrls = new Set(existingImages);

          const existingPending = await PendingImagesRepository.getPendingImages(dishId);
          for (const img of existingPending) {
            existingUrls.add(img.preview);
          }

          const newImagesForSave = assignment.images
            .filter((img) => !existingUrls.has(img.preview))
            .map((img) => {
              const processedImg = currentProcessedImages.find(
                (pi) =>
                  pi.assignedDishId &&
                  assignment.dishIds.includes(pi.assignedDishId) &&
                  (pi.preview === img.preview || (pi.isReused && pi.preview === img.preview)),
              );

              return {
                preview: img.preview,
                file: img.file || new File([], 'dummy.jpg', { type: 'image/jpeg' }),
                isReused: processedImg?.isReused || false,
              };
            });

          const allImagesToSave = [
            ...existingImages.map((url) => ({
              preview: url,
              file: new File([], 'existing.jpg', { type: 'image/jpeg' }),
              isReused: url.startsWith('http://') || url.startsWith('https://'),
            })),
            ...existingPending.map((img) => ({
              preview: img.preview,
              file: new File([], 'pending.jpg', { type: 'image/jpeg' }),
              isReused: img.preview.startsWith('http://') || img.preview.startsWith('https://'),
            })),
            ...newImagesForSave,
          ].slice(0, 3);

          pendingSaves.push({
            dishId,
            images: allImagesToSave,
            dishName: dish?.name || 'Unknown',
          });
        }
      }

      const totalImagesForSave = pendingSaves.reduce((sum, save) => sum + save.images.length, 0);
      const uniqueDishesSet = new Set(pendingSaves.map((s) => s.dishId));
      const totalDishesForSave = uniqueDishesSet.size;

      let savedImageCount = 0;
      const savedDishesSet = new Set<string>();

      setShowSaveProgress(true);
      setSaveProgressLocal({
        current: 0,
        total: totalImagesForSave,
        dishesUpdated: 0,
        totalDishes: totalDishesForSave,
        isComplete: false,
      });

      // Save to PendingImagesRepository
      // We can do this in parallel or chunks, but let's keep it simple and safe for now
      for (const save of pendingSaves) {
        try {
          const imagesToSave = await Promise.all(save.images.map(async (img) => ({ preview: img.preview, file: img.file })));
          await PendingImagesRepository.savePendingImages(save.dishId, businessId, imagesToSave, false);

          savedDishesSet.add(save.dishId);
          savedImageCount += imagesToSave.length;

          setSaveProgressLocal({
            current: savedImageCount,
            total: totalImagesForSave,
            dishesUpdated: savedDishesSet.size,
            totalDishes: totalDishesForSave,
            currentFileName: save.dishName,
            isComplete: false,
          });
        } catch (err) {
          console.error(`Error saving dish ${save.dishId}`, err);
        }
      }

      setSaveProgressLocal({
        current: totalImagesForSave,
        total: totalImagesForSave,
        dishesUpdated: totalDishesForSave,
        totalDishes: totalDishesForSave,
        isComplete: true,
      });

      // Prepare final map for onSave callback
      const assignmentsForSave = new Map<string, { nameKey: string; dishIds: string[]; images: Array<{ preview: string; file: File }> }>();
      for (const [nameKey, assignment] of assignmentsByNameKey.entries()) {
        assignmentsForSave.set(nameKey, {
          nameKey,
          dishIds: assignment.dishIds,
          images: assignment.images.map((img) => ({
            preview: img.preview,
            file: img.file || new File([], 'dummy.jpg', { type: 'image/jpeg' }),
          })),
        });
      }

      await onSave(assignmentsForSave);

      toast.success('Saved successfully');

      // Explicitly reset store to clear UI immediately (fixes "images stay visible" bug)
      resetStore();
      setPendingConfirmation(null);

      // Close immediateley
      setShowSaveProgress(false);
      setSaveProgressLocal(null);
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
      setAssigning(false);
      setShowSaveProgress(false);
      setSaveProgressLocal(null);
      toast.error('Failed to save');
    }
  }, [
    dishes,
    getSharedDishIds,
    getAvailableSlots,
    onSave,
    onClose,
    businessId,
    setShowSaveProgress,
    setAssigning,
    setAssignmentProgress,
    resetStore,
  ]);

  const unassignedCount = unassignedImages.length;
  const hasAssignments = processedImages.some((img) => img.status === 'completed' && img.assignedDishId);
  // Show dishes/images grid if images are processed OR if we have existing images (reused)
  const hasReusedImages = processedImages.some((img) => img.isReused);
  const allImagesProcessed = (completedCount > 0 && !isProcessing && processingQueue.length === 0) || hasReusedImages;
  const showCompressionProgress = isProcessing || (progress.total > 0 && progress.current < progress.total);

  // Note: Auto-assign is triggered in two places:
  // 1. After compression completes (in progress callback)
  // 2. When checkbox is toggled ON (in onChange handler)
  // We don't use useEffect here to avoid infinite loops
  return (
    <PopUp height="h-[100dvh] lg:h-[95dvh]" width="w-full max-w-[1400px]" show={isOpen} onClose={onClose} hide>
      <section
        className="hide-scrollbar max-h-[100dvh] min-h-[100dvh] overflow-y-auto pb-[100px] lg:max-h-[90dvh] lg:min-h-[80dvh]"
        style={{ background: '#F3F4F6' }}
      >
        <button
          className="brutal-button absolute right-4 top-6 z-50"
          type="button"
          onClick={onClose}
          style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <HiX style={{ width: '20px', height: '20px' }} />
        </button>
        <div className="brutal-card" style={{ margin: '24px', padding: '24px', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 className="brutal-heading mb-2" style={{ fontSize: '1.5rem' }}>
            BULK IMAGE UPLOAD
          </h2>
          <p className="brutal-body mb-6" style={{ fontSize: '0.875rem' }}>
            UPLOAD UP TO 100 IMAGES. USE AUTO ASSIGN BUTTON TO MATCH IMAGES TO DISHES.
          </p>

          {/* Progress Bar with Framer Motion */}
          {progress.total > 0 && (
            <motion.div
              className="brutal-card mb-6"
              style={{ padding: '12px' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <motion.span
                  className="brutal-body"
                  style={{ fontSize: '0.875rem', fontWeight: 700 }}
                  animate={{ opacity: isProcessing ? [1, 0.5, 1] : 1 }}
                  transition={{ duration: 1.5, repeat: isProcessing ? Number.POSITIVE_INFINITY : 0 }}
                >
                  PROCESSING: {progress.current} / {progress.total}
                </motion.span>
                <span className="brutal-data" style={{ fontSize: '0.75rem' }}>
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>
              <div className="relative h-4 overflow-hidden" style={{ background: '#FFFFFF', border: '2px solid #000000' }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: '#FFEB3B',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`brutal-card mb-6 cursor-pointer border-dashed transition-colors ${dragActive ? 'bg-yellow-100' : ''}`}
            style={{
              padding: '48px',
              textAlign: 'center',
              border: dragActive ? '3px dashed #FFEB3B' : '3px dashed #000000',
            }}
          >
            <input type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" id="bulk-upload-input" />
            <label htmlFor="bulk-upload-input" className="cursor-pointer">
              <Upload className="brutal-icon mx-auto mb-4" style={{ width: '48px', height: '48px' }} />
              <div className="brutal-heading mb-2" style={{ fontSize: '1rem' }}>
                DRAG & DROP IMAGES HERE
              </div>
              <div className="brutal-body" style={{ fontSize: '0.875rem' }}>
                OR CLICK TO SELECT FILES (MAX 100)
              </div>
            </label>
          </div>

          {/* Upload More button - shown after images processed */}
          {showUploadMore && (
            <div className="mb-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowUploadMore(false);
                  const input = document.getElementById('bulk-upload-input') as HTMLInputElement;
                  if (input) input.click();
                }}
                className="brutal-button-primary"
                style={{ padding: '12px 24px', fontSize: '0.875rem' }}
              >
                UPLOAD MORE
              </button>
            </div>
          )}

          {/* Assignment Progress (Fix 1) */}
          {isAssigning && (
            <motion.div
              className="brutal-card mb-6"
              style={{ padding: '12px' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <motion.span
                  className="brutal-body"
                  style={{ fontSize: '0.875rem', fontWeight: 700 }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  ASSIGNING IMAGES: {assignmentProgress.current} / {assignmentProgress.total}
                </motion.span>
                <span className="brutal-data" style={{ fontSize: '0.75rem' }}>
                  {assignmentProgress.total > 0 ? Math.round((assignmentProgress.current / assignmentProgress.total) * 100) : 0}%
                </span>
              </div>
              <div className="relative h-4 overflow-hidden" style={{ background: '#FFFFFF', border: '2px solid #000000' }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: '#FFEB3B',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${assignmentProgress.total > 0 ? (assignmentProgress.current / assignmentProgress.total) * 100 : 0}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}

          {/* Main Content: Two-column layout - Only show after images are processed */}
          {allImagesProcessed && (
            <div className="flex gap-6">
              {/* Left Sidebar: Dish List with Search - Sticky */}
              <div
                className="brutal-card flex-shrink-0"
                style={{
                  width: '300px',
                  padding: '16px',
                  maxHeight: 'calc(100vh - 200px)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'sticky',
                  top: '24px',
                  alignSelf: 'flex-start',
                }}
              >
                <h3 className="brutal-heading mb-4" style={{ fontSize: '1rem' }}>
                  DISHES ({dishes.length})
                </h3>

                {/* Search */}
                <input
                  type="text"
                  placeholder="SEARCH DISHES"
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  className="brutal-input mb-4"
                  style={{ padding: '8px 12px', fontSize: '0.875rem', width: '100%' }}
                />

                {/* Dish List */}
                <div className="flex-1 overflow-y-auto" style={{ border: '2px solid #000000', minHeight: '200px' }}>
                  {dishes.length === 0 ? (
                    <div className="brutal-body px-3 py-4 text-center" style={{ fontSize: '0.875rem', color: '#666' }}>
                      NO DISHES FOUND
                    </div>
                  ) : (
                    dishes
                      .filter((dish) => !dishSearch || dish.name?.toLowerCase().includes(dishSearch.toLowerCase()))
                      .map((dish) => {
                        // BUG A FIX: Use global nameKey-aware counting to prevent double-counting
                        const nameKey = dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
                        const sharedDishIds = getSharedDishIds(dish._id, nameKey);

                        // Get existing images globally (already deduplicated across shared instances)
                        const existingGlobal = getGlobalImages(dish._id, nameKey);

                        // Get pending session images assigned to any shared dish instance (deduplicate by URL)
                        const pendingSessionUrls = new Set<string>();
                        for (const img of processedImages) {
                          if (img.status === 'completed' && img.assignedDishId && sharedDishIds.includes(img.assignedDishId)) {
                            pendingSessionUrls.add(img.preview);
                          }
                        }

                        // Combine and deduplicate: existing + pending session (only count unique URLs)
                        const allImageUrls = new Set([...existingGlobal, ...pendingSessionUrls]);
                        const displayCount = Math.min(3, allImageUrls.size);

                        // Count "NEW" images (those not already in existingGlobal)
                        const newImageUrls = Array.from(pendingSessionUrls).filter((url) => !existingGlobal.includes(url));
                        const newCount = newImageUrls.length;

                        // For backward compatibility, keep assignedImages filter for highlighting
                        const assignedImages = processedImages.filter((img) => img.assignedDishId === dish._id && img.status === 'completed');

                        return (
                          <div
                            key={dish._id}
                            className="brutal-body px-3 py-2"
                            style={{
                              fontSize: '0.875rem',
                              borderBottom: '1px solid #000000',
                              background: assignedImages.length > 0 ? '#FFEB3B' : '#FFFFFF',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              if (assignedImages.length === 0) {
                                e.currentTarget.style.background = '#F3F4F6';
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.click();
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = assignedImages.length > 0 ? '#FFEB3B' : '#FFFFFF';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              // Only highlight if image is being dragged (check dataTransfer types)
                              const hasImageId = e.dataTransfer?.types.includes('text/plain') || e.dataTransfer?.effectAllowed === 'move';
                              if (hasImageId) {
                                const nameKey = dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
                                const availableSlots = getAvailableSlotsWithPending(dish._id, nameKey);
                                if (availableSlots > 0) {
                                  e.currentTarget.style.background = '#FFEB3B';
                                  e.dataTransfer.dropEffect = 'move';
                                } else {
                                  e.dataTransfer.dropEffect = 'none';
                                }
                              }
                            }}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              const hasImageId = e.dataTransfer?.types.includes('text/plain') || e.dataTransfer?.effectAllowed === 'move';
                              if (hasImageId) {
                                const nameKey = dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
                                const availableSlots = getAvailableSlotsWithPending(dish._id, nameKey);
                                if (availableSlots > 0) {
                                  e.currentTarget.style.background = '#FFEB3B';
                                }
                              }
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Only reset if we're actually leaving the element (not entering a child)
                              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                e.currentTarget.style.background = assignedImages.length > 0 ? '#FFEB3B' : '#FFFFFF';
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              const imageId = e.dataTransfer?.getData('imageId') || e.dataTransfer?.getData('text/plain');
                              if (imageId) {
                                // Check if image exists and is completed before assigning
                                const image = processedImages.find((img) => img.id === imageId);
                                if (image && image.status === 'completed') {
                                  assignToDish(imageId, dish._id);
                                } else if (image && image.status === 'processing') {
                                  toast.error('Image is still processing. Please wait...');
                                }
                              }

                              const newAssignedImages = processedImages.filter(
                                (img) => img.assignedDishId === dish._id && img.status === 'completed',
                              );
                              e.currentTarget.style.background = newAssignedImages.length > 0 ? '#FFEB3B' : '#FFFFFF';
                            }}
                            onClick={() => {
                              // Check if dish has available slots before assigning
                              const nameKey = dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
                              const availableSlots = getAvailableSlotsWithPending(dish._id, nameKey);
                              if (availableSlots === 0) {
                                toast.error('Max 3 images allowed per item');
                                return;
                              }
                              // Find first unassigned image and assign it
                              const unassignedImg = processedImages.find((img) => img.status === 'completed' && !img.assignedDishId);
                              if (unassignedImg) {
                                assignToDish(unassignedImg.id, dish._id);
                              }
                            }}
                          >
                            <div className="truncate font-bold">{dish.name?.toUpperCase()}</div>
                            {(() => {
                              const availableSlots = getAvailableSlots(dish._id, nameKey);
                              return (
                                <>
                                  {newCount > 0 && (
                                    <div className="brutal-data text-xs" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                      {newCount} NEW
                                    </div>
                                  )}
                                  <div className="brutal-data text-xs" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                                    {displayCount}/3 IMAGES{' '}
                                    {displayCount >= 3 ? '(FULL)' : `(${availableSlots} SLOT${availableSlots !== 1 ? 'S' : ''} LEFT)`}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Right Panel: Processed Images Grid - Scrollable */}
              <div className="mb-6 flex-1" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {processedImages.length > 0 ? (
                  <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <h3 className="brutal-heading" style={{ fontSize: '1.125rem' }}>
                        PROCESSED IMAGES ({completedCount}/{processedImages.length})
                      </h3>

                      <div className="flex items-center gap-3">
                        {/* Filter Buttons */}
                        <div className="flex items-center gap-2" style={{ border: '2px solid #000000', padding: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setImageFilter('all')}
                            className="brutal-body"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              background: imageFilter === 'all' ? '#FFEB3B' : '#FFFFFF',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: imageFilter === 'all' ? 700 : 600,
                            }}
                          >
                            ALL
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageFilter('unassigned')}
                            className="brutal-body"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              background: imageFilter === 'unassigned' ? '#FFEB3B' : '#FFFFFF',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: imageFilter === 'unassigned' ? 700 : 600,
                            }}
                          >
                            UNASSIGNED ({unassignedCount})
                          </button>
                        </div>

                        {/* Manual Auto-Assign Button */}
                        {unassignedCount > 0 && (
                          <button
                            type="button"
                            onClick={handleAutoAssign}
                            disabled={isAssigning || unassignedCount === 0}
                            className="brutal-button-primary"
                            style={{
                              padding: '8px 16px',
                              fontSize: '0.875rem',
                              opacity: isAssigning || unassignedCount === 0 ? 0.5 : 1,
                              cursor: isAssigning || unassignedCount === 0 ? 'not-allowed' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isAssigning ? 'ASSIGNING...' : `AUTO ASSIGN (${unassignedCount > 0 ? unassignedCount : 0})`}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filtered Images Display */}
                    <AnimatePresence>
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        {processedImages
                          .filter((img) => {
                            if (imageFilter === 'unassigned') {
                              return img.status === 'completed' && !img.assignedDishId;
                            }
                            return true; // Show all
                          })
                          .map((img) => (
                            <ImageCard
                              key={img.id}
                              image={img}
                              dishes={dishes}
                              onRemove={removeImage}
                              onAssign={assignToDish}
                              getAvailableSlotsWithPending={getAvailableSlotsWithPending}
                              getGlobalImages={getGlobalImages}
                            />
                          ))}
                      </div>
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="brutal-card flex h-64 items-center justify-center" style={{ padding: '48px' }}>
                    <div className="text-center">
                      <div className="brutal-heading mb-2" style={{ fontSize: '1rem' }}>
                        NO IMAGES UPLOADED YET
                      </div>
                      <div className="brutal-body" style={{ fontSize: '0.875rem', color: '#666' }}>
                        DRAG & DROP OR CLICK TO SELECT IMAGES ABOVE
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fix 2: Fixed bottom button bar - always visible when modal is open */}
        </div>
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          style={{
            paddingBottom: '16px',
          }}
        >
          <div className="flex items-center gap-2">
            {/* Use Existing Images Button - always visible */}
            <button
              type="button"
              onClick={() => setShowExistingImagesPicker(true)}
              className="brutal-button"
              style={{ padding: '12px 24px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Images style={{ width: '16px', height: '16px' }} />
              USE EXISTING IMAGES
            </button>

            {/* Save button - only show when images are processed */}
            {allImagesProcessed && (
              <>
                <button type="button" onClick={onClose} className="brutal-button" style={{ padding: '12px 24px', fontSize: '0.875rem' }}>
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasAssignments || isProcessing || isAssigning}
                  className="brutal-button-primary"
                  style={{
                    padding: '12px 24px',
                    fontSize: '0.875rem',
                    opacity: !hasAssignments || isProcessing || isAssigning ? 0.5 : 1,
                    cursor: !hasAssignments || isProcessing || isAssigning ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isAssigning ? 'ASSIGNING...' : `SAVE (${completedCount} IMAGES)`}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Shared Dish Confirmation Modal */}
        {pendingConfirmation && (
          <SharedDishConfirmModal
            isOpen={!!pendingConfirmation}
            dishName={pendingConfirmation.dishName}
            menuNames={pendingConfirmation.menuNames}
            onConfirm={handleConfirmAssignment}
            onCancel={handleCancelAssignment}
          />
        )}

        {/* Save Progress Modal */}
        {saveProgressLocal && (
          <SaveProgressModal
            isOpen={showSaveProgress}
            progress={saveProgressLocal}
            onClose={() => {
              setShowSaveProgress(false);
              setSaveProgressLocal(null);
              onClose();
            }}
          />
        )}

        {/* Existing Images Picker Modal */}
        <ExistingImagesPickerModal
          isOpen={showExistingImagesPicker}
          onClose={() => setShowExistingImagesPicker(false)}
          businessId={businessId}
          onSelect={handleSelectExistingImage}
        />
      </section>
    </PopUp>
  );
};

// Image Card Component
interface ImageCardProps {
  image: ProcessedImage;
  dishes: MenuDish[];
  onRemove: (id: string) => void;
  onAssign: (imageId: string, dishId: string | null) => void;
  getAvailableSlotsWithPending: (dishId: string, nameKey?: string) => number;
  getGlobalImages: (dishId: string, nameKey?: string) => string[];
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const ImageCard = ({ image, dishes, onAssign, onRemove, getAvailableSlotsWithPending, getGlobalImages }: ImageCardProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <motion.div
      className="brutal-card relative"
      style={{ padding: '8px' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        className="brutal-button absolute right-2 top-2"
        style={{
          width: '24px',
          height: '24px',
          padding: 0,
          background: '#FF4444',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X style={{ width: '14px', height: '14px' }} />
      </button>

      {/* Image Preview - Draggable (only if completed) */}
      {image.previewUrl || image.preview ? (
        <div
          draggable={image.status === 'completed'}
          onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
            // Only allow dragging if image is completed
            if (image.status !== 'completed') {
              e.preventDefault();
              return;
            }
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', image.id);
            e.dataTransfer.setData('imageId', image.id);
          }}
          style={{ cursor: image.status === 'completed' ? 'move' : 'not-allowed' }}
        >
          <img
            src={image.isReused ? image.preview : image.previewUrl || image.preview} // Use URL for reused, blob URL for new, fallback to base64
            alt={image.filename}
            draggable={false}
            style={{
              width: '100%',
              height: '120px',
              objectFit: 'cover',
              border: '2px solid #000000',
              marginBottom: '8px',
              pointerEvents: 'none',
            }}
          />
        </div>
      ) : (
        <motion.div
          className="flex items-center justify-center"
          style={{
            width: '100%',
            height: '120px',
            border: '2px dashed #000000',
            background: '#F3F4F6',
            marginBottom: '8px',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="brutal-body" style={{ fontSize: '0.75rem' }}>
            PROCESSING...
          </div>
        </motion.div>
      )}

      {/* Filename */}
      <div className="brutal-body mb-1 truncate text-xs" style={{ fontSize: '0.75rem' }}>
        {image.filename}
      </div>

      {/* File Size Info */}
      {image.status === 'completed' && image.originalSize && image.compressedSize && (
        <div
          className="brutal-data mb-2 text-xs"
          style={{ fontSize: '0.625rem', color: image.compressedSize < image.originalSize ? '#00C853' : '#000000' }}
        >
          {formatFileSize(image.compressedSize)}
          {image.compressedSize < image.originalSize && (
            <span style={{ color: '#000000', marginLeft: '4px' }}>
              ({((1 - image.compressedSize / image.originalSize) * 100).toFixed(0)}% smaller)
            </span>
          )}
        </div>
      )}

      {/* Assignment Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="brutal-button w-full"
          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
        >
          {image.assignedDishName || 'ASSIGN TO DISH'}
          {image.confidence && (
            <span className="brutal-data ml-2" style={{ fontSize: '0.625rem' }}>
              ({Math.round(image.confidence * 100)}%)
            </span>
          )}
        </button>

        {showDropdown && (
          <>
            <div className="brutal-card absolute z-10 mt-1 max-h-48 w-full overflow-y-auto" style={{ border: '3px solid #000000' }}>
              <button
                type="button"
                onClick={() => {
                  onAssign(image.id, null);
                  setShowDropdown(false);
                }}
                className="brutal-body w-full px-2 py-1 text-left hover:bg-yellow-100"
                style={{ fontSize: '0.75rem', borderBottom: '1px solid #000000' }}
              >
                NONE
              </button>
              {dishes.map((dish) => {
                const nameKey = dish.nameKey || dish.name?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
                const availableSlots = getAvailableSlotsWithPending(dish._id, nameKey);
                const isFull = availableSlots === 0;
                const globalImages = getGlobalImages(dish._id, nameKey);
                const currentImages = Array.isArray(globalImages) ? globalImages : [];

                return (
                  <button
                    key={dish._id}
                    type="button"
                    onClick={() => {
                      if (!isFull) {
                        onAssign(image.id, dish._id);
                        setShowDropdown(false);
                      } else {
                        toast.error('Max 3 images allowed per item');
                      }
                    }}
                    disabled={isFull}
                    className={`brutal-body w-full px-2 py-1 text-left ${image.assignedDishId === dish._id ? 'bg-yellow-200' : ''} ${
                      isFull ? 'cursor-not-allowed opacity-50' : 'hover:bg-yellow-100'
                    }`}
                    style={{
                      fontSize: '0.75rem',
                      borderBottom: '1px solid #000000',
                    }}
                    title={isFull ? `Dish already has 3 images (${currentImages.length}/3)` : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <span>{dish.name}</span>
                      {isFull && (
                        <span className="brutal-data text-xs" style={{ fontSize: '0.625rem' }}>
                          (FULL)
                        </span>
                      )}
                      {!isFull && availableSlots < 3 && (
                        <span className="brutal-data text-xs" style={{ fontSize: '0.625rem' }}>
                          ({currentImages.length}/3)
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="z-5 fixed inset-0" onClick={() => setShowDropdown(false)} />
          </>
        )}
      </div>

      {/* Status Indicator */}
      {image.status === 'processing' && (
        <div className="mt-2 flex items-center gap-2">
          <div className="brutal-body animate-pulse" style={{ fontSize: '0.625rem', color: '#FFEB3B' }}>
            PROCESSING...
          </div>
        </div>
      )}
      {image.status === 'error' && (
        <div className="mt-2 flex items-center gap-2">
          <AlertCircle style={{ width: '12px', height: '12px', color: '#FF4444' }} />
          <div className="brutal-body" style={{ fontSize: '0.625rem', color: '#FF4444' }}>
            {image.error || 'ERROR'}
          </div>
        </div>
      )}
      {image.status === 'completed' && image.assignedDishId && (
        <motion.div
          className="mt-2 flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
            <Check style={{ width: '12px', height: '12px', color: '#00C853' }} />
          </motion.div>
          <div className="brutal-body truncate" style={{ fontSize: '0.625rem', color: '#00C853' }}>
            {image.assignedDishName}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
