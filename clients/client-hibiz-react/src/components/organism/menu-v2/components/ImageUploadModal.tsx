/**
 * ImageUploadModal Component
 *
 * Reusable modal for uploading and cropping up to 3 images for a dish.
 * Uses PopUp component for consistent UI.
 */

import PopUp from '@/components/atom/popUp';
import EasyReactCropper from '@/components/cropper/cropper';

import { getCroppedImg } from '@/components/utils/helper';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Area } from 'react-easy-crop';
import { HiX } from 'react-icons/hi';
import '../styles/brutalist.css';

interface CropperRef {
  getCroppedAreaPixels: () => Area | null;
}

import { PendingImagesRepository } from '../db/PendingImagesRepository';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string; // Renamed from dishId
  existingImages: string[]; // Array of existing image URLs
  onSave: (images: { preview: string; file: File }[], allRemoved: boolean) => void;
  maxImages?: number; // Added maxImages prop
  title?: string;
}

export const ImageUploadModal = ({
  isOpen,
  onClose,
  entityId,
  existingImages,
  onSave,
  maxImages = 3,
  title = 'UPLOAD IMAGES',
}: ImageUploadModalProps) => {
  // Initialize slots based on maxImages
  const [imageSlots, setImageSlots] = useState<Array<{ preview: string; file: File | null; cropping: boolean; isExisting: boolean }>>([]);

  const [croppingSlot, setCroppingSlot] = useState<number | null>(null);
  const cropperRef = useRef<CropperRef>(null);

  // Initialize slots when isOpen or maxImages changes
  useEffect(() => {
    if (isOpen) {
      const initialSlots = Array(maxImages)
        .fill(null)
        .map((_, i) => ({
          preview: existingImages[i] || '',
          file: null,
          cropping: false,
          isExisting: !!existingImages[i],
        }));
      setImageSlots(initialSlots);
    }
  }, [isOpen, maxImages, existingImages]);

  // Load pending images and merge with existing images when modal opens
  useEffect(() => {
    if (isOpen && entityId) {
      const loadImages = async () => {
        try {
          // Get pending images for this entity
          const pendingImgs = await PendingImagesRepository.getPendingImages(entityId);
          const pendingPreviews = Array(maxImages).fill('');
          pendingImgs.forEach((img) => {
            if (img.imageIndex >= 0 && img.imageIndex < maxImages) {
              pendingPreviews[img.imageIndex] = img.preview;
            }
          });

          // Merge: pending images take priority, then existing images
          const mergedImages = Array(maxImages).fill('');
          for (let i = 0; i < maxImages; i++) {
            mergedImages[i] = pendingPreviews[i] || existingImages[i] || '';
          }

          setImageSlots(
            mergedImages.map((preview, i) => ({
              preview,
              file: null,
              cropping: false,
              isExisting: !pendingPreviews[i] && !!existingImages[i],
            })),
          );
        } catch (error) {
          console.error('Error loading pending images:', error);
          // Fallback handled by initial state, or re-set here if needed
        }
      };

      loadImages();
    }
  }, [isOpen, entityId, existingImages, maxImages]);

  const handleFileSelect = useCallback((slotIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      setImageSlots((prev) => {
        const updated = [...prev];
        updated[slotIndex] = { preview, file, cropping: true, isExisting: false };
        return updated;
      });
      setCroppingSlot(slotIndex);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropSave = useCallback(async () => {
    if (croppingSlot === null || !cropperRef.current) return;

    const croppedAreaPixels = cropperRef.current.getCroppedAreaPixels();
    if (!croppedAreaPixels) return;

    const slot = imageSlots[croppingSlot];
    if (!slot.preview) return;

    try {
      const croppedData = await getCroppedImg(slot.preview, croppedAreaPixels);
      if (croppedData && croppedData.base64) {
        const blob = await (await fetch(croppedData.base64)).blob();
        const croppedFile = new File([blob], `image-${Date.now()}.png`, { type: 'image/png' });

        setImageSlots((prev) => {
          const updated = [...prev];
          updated[croppingSlot] = { preview: croppedData.base64, file: croppedFile, cropping: false, isExisting: false };
          return updated;
        });
        setCroppingSlot(null);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  }, [croppingSlot, imageSlots]);

  const handleRemoveImage = (slotIndex: number) => {
    setImageSlots((prev) => {
      const updated = [...prev];
      updated[slotIndex] = { preview: '', file: null, cropping: false, isExisting: false };
      return updated;
    });
  };

  const handleSave = () => {
    // Track new uploads (images with files)
    const finalImages = imageSlots
      .filter((slot) => !!slot.preview)
      .map((slot) => ({ preview: slot.preview, file: slot.file || new File([], 'placeholder') }));
    // Hacky file placeholder if existing?
    // Or better: update interface to `file: File | null`.

    const hasAnyImages = finalImages.length > 0;
    const allRemoved = !hasAnyImages && existingImages.length > 0;

    onSave(finalImages, allRemoved);
    onClose();
  };

  const handleFileInputChange = (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(slotIndex, file);
    }
  };

  if (!isOpen) return null;

  return (
    <PopUp show={isOpen} onClose={onClose} hide>
      <section
        className="hide-scrollbar max-h-[100dvh] min-h-[100dvh] overflow-y-auto pb-[5rem] lg:max-h-[90dvh] lg:min-h-[70dvh]"
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
        <div className="brutal-card" style={{ margin: '24px', padding: '24px' }}>
          <h2 className="brutal-heading mb-2" style={{ fontSize: '1.5rem' }}>
            {title} (MAX {maxImages})
          </h2>
          <p className="brutal-body mb-6" style={{ fontSize: '0.875rem' }}>
            ADD UP TO {maxImages} IMAGES. CLICK ON A SLOT TO UPLOAD.
          </p>

          {croppingSlot !== null ? (
            <div className="space-y-4">
              <div className="brutal-card relative w-full" style={{ height: '400px', padding: '16px' }}>
                <EasyReactCropper image={imageSlots[croppingSlot].preview} ref={cropperRef} width={400} height={400} />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCropSave}
                  className="brutal-button-primary flex-1"
                  style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                >
                  SAVE CROP
                </button>
                <button
                  type="button"
                  onClick={() => setCroppingSlot(null)}
                  className="brutal-button"
                  style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 ${maxImages === 1 ? 'mx-auto max-w-[200px] grid-cols-1' : 'grid-cols-3'}`}>
                {imageSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden"
                    style={{
                      border: slot.preview ? '3px solid #000000' : '3px dashed #000000',
                      background: slot.preview ? '#FFFFFF' : '#F3F4F6',
                    }}
                  >
                    {slot.preview ? (
                      <>
                        <img src={slot.preview} alt={`Image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="brutal-button"
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            padding: '4px',
                            background: '#FF4444',
                            color: '#FFFFFF',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <X className="brutal-icon" style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                        </button>
                      </>
                    ) : (
                      <label
                        className="flex h-full w-full cursor-pointer items-center justify-center"
                        style={{ transition: 'background 0.2s ease' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#FFEB3B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F3F4F6';
                        }}
                      >
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileInputChange(idx, e)} />
                        <div className="text-center">
                          <div className="brutal-heading" style={{ fontSize: '2rem', marginBottom: '8px' }}>
                            +
                          </div>
                          <div className="brutal-body" style={{ fontSize: '0.875rem' }}>
                            ADD
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pb-8 pt-4">
                <button type="button" onClick={onClose} className="brutal-button" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                  CANCEL
                </button>
                <button type="button" onClick={handleSave} className="brutal-button-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                  SAVE IMAGES
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </PopUp>
  );
};
