/**
 * CategoryModalV2.tsx
 *
 * Create/Edit modal for categories.
 * Handles Hierarchy (Parent/Child) vs Flat (Child-only) menus.
 */

import PopUp from '@/components/atom/popUp';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { memo, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiTrash, HiX } from 'react-icons/hi';

import { DraftOpsRepository } from '../../db/DraftOpsRepository';
import { CategoryFormSchema, type CategoryFormValues } from '../../validations';
import { ImageUploadModal } from '../ImageUploadModal';
import { storeImageAfterSave } from '@/components/utils/helper';

import '../../styles/brutalist.css';
import type { MenuCategory, MenuLayout } from '../../types';

interface CategoryModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  category: MenuCategory | null; // null = create mode
  businessId: string;
  selectedMenuId: string;
  menuLayout?: MenuLayout; // To check menuType

  // Data for linking
  allParentCategories?: MenuCategory[]; // For linking child to parent
  allChildCategories?: MenuCategory[]; // For linking parent to children (bulk)

  hierarchy?: 'PARENT' | 'CHILD'; // Optional: Pre-select hierarchy when creating
  isMergeMode: boolean;
}

export const CategoryModalV2 = memo(function CategoryModalV2({
  isOpen,
  onClose,
  category,
  businessId,
  selectedMenuId,
  menuLayout,
  allParentCategories = [],
  allChildCategories = [],
  hierarchy,
  isMergeMode,
}: CategoryModalV2Props) {
  const isEdit = !!category;
  // Default to 1 (Hierarchy) if unknown
  const isHierarchyEnabled = menuLayout?.menuType !== 2;

  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // "Intent" state for creation: are we creating a Parent or a Child?
  // Only relevant for Creation in Hierarchy menu.
  // Initialize from hierarchy prop if provided
  const [createModeType, setCreateModeType] = useState<'PARENT' | 'CHILD'>(hierarchy || 'CHILD');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: '',
      hierarchy: hierarchy || 'CHILD',
      visibility: true,
      images: [],
      parentId: '',
      childCategoryIds: [],
    },
  });

  const watchHierarchy = watch('hierarchy');
  const watchImages = watch('images');

  // Init
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          hierarchy: category.hierarchy,
          visibility: category.visibility ?? true,
          images: category.coverImage ? [category.coverImage] : [],
          parentId: category.parentId || '',
          childCategoryIds: [], // Not typically stored on parent directly in flat list usage
        });
      } else {
        // Create Mode Defaults - use hierarchy prop if provided
        const defaultHierarchy = hierarchy || (isHierarchyEnabled ? createModeType : 'CHILD');
        setCreateModeType(hierarchy || createModeType);
        reset({
          name: '',
          hierarchy: defaultHierarchy,
          visibility: true,
          images: [],
          parentId: '',
          childCategoryIds: [],
        });
      }
    }
  }, [isOpen, category, reset, isHierarchyEnabled, createModeType, hierarchy]);

  // Update hierarchy field when toggle changes (in Create mode)
  useEffect(() => {
    if (!category && isOpen) {
      setValue('hierarchy', createModeType);
    }
  }, [createModeType, setValue, category, isOpen]);

  const handleImageAssignment = async (images: Array<{ preview: string; file: File }>) => {
    setIsUploadingImages(true);
    try {
      let uploadedUrl: string | null = null;

      if (images.length > 0) {
        const image = images[0];
        if (image.file && image.file.size > 0) {
          // New image - upload to server
          uploadedUrl = await storeImageAfterSave(image.file, image.preview, setIsUploadingImages);
        } else if (image.preview && image.preview.startsWith('http')) {
          // Already a URL (existing image) - use as-is
          uploadedUrl = image.preview;
        } else if (image.preview && image.preview.startsWith('data:')) {
          // Base64 data URL but no file - try to convert and upload
          try {
            const response = await fetch(image.preview);
            const blob = await response.blob();
            const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
            uploadedUrl = await storeImageAfterSave(file, image.preview, setIsUploadingImages);
          } catch (error) {
            console.error('Error converting base64 to file:', error);
          }
        }
      }

      // Update form with uploaded URL
      if (uploadedUrl) {
        setValue('images', [uploadedUrl], { shouldValidate: true });
      } else {
        setValue('images', [], { shouldValidate: true });
      }
      setShowImageUpload(false);
      if (uploadedUrl) {
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        visibility: data.visibility,
        coverImage: data.images?.[0] || '',
        hierarchy: data.hierarchy,
      };

      if (data.hierarchy === 'CHILD' && data.parentId) {
        payload.parentId = data.parentId;
      }
      // If Parent + ChildCategoryIds, handle bulk linking after creation?
      // Logic for that likely goes here.

      if (isEdit && category) {
        if (isMergeMode) {
          // Limited update
          await DraftOpsRepository.updateCategory(category._id, businessId, {
            name: data.name,
            visibility: data.visibility,
          });
          toast.success('Category updated');
        } else {
          // Full update
          await DraftOpsRepository.updateCategory(category._id, businessId, {
            name: data.name,
            visibility: data.visibility,
            parentId: data.parentId, // only if child
          });
          toast.success('Category updated');
        }
      } else {
        // CREATE MODE (Only allowed if NOT merged or explicitly handled)
        if (isMergeMode && selectedMenuId === 'ALL') {
          toast.error('Please select a specific menu to create categories.');
          return;
        }

        if (selectedMenuId === 'ALL') {
          toast.error('Please select a specific menu to create categories.');
          return;
        }

        // Offline-first: Write to Dexie + create draftOp (NO server call)
        // Server requires coverImage to be valid URL (>=10 chars) or empty string
        // Server requires categoryTimings to be >=3 chars - use a valid empty array format
        const coverImage = data.images?.[0] && data.images[0].length >= 10 ? data.images[0] : '';
        // Use a valid JSON array string that meets the 3-char minimum (e.g., "[ ]" or actual timing data)
        const categoryTimings = '[ ]'; // Empty array with space to meet 3-char minimum
        
        const localId = await DraftOpsRepository.createCategory(businessId, selectedMenuId, {
          name: data.name,
          hierarchy: data.hierarchy,
          visibility: data.visibility ?? true,
          coverImage,
          parentId: data.hierarchy === 'CHILD' ? data.parentId : undefined,
          categoryTimings,
        });

        toast.success('Category created locally. Push to server when ready.');
      }
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    const confirm = window.confirm('Are you sure you want to delete this category?');
    if (confirm) {
      // Delete logic (Mock)
      toast.success('Category deleted (Mock)');
      onClose();
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
          className="brutal-button absolute right-4 top-6 z-50 bg-white"
          type="button"
          onClick={onClose}
          style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <HiX style={{ width: '20px', height: '20px' }} />
        </button>

        <div className="brutal-card m-6 overflow-hidden bg-white p-0 md:mx-auto md:max-w-lg">
          <div className="border-b-4 border-black bg-white p-6">
            <h2 className="brutal-heading text-xl">{isEdit ? 'EDIT CATEGORY' : 'NEW CATEGORY'}</h2>

            {/* Helper Toggle for Create Mode in Hierarchy */}
            {!isEdit && isHierarchyEnabled && (
              <div className="mt-4 flex rounded border-2 border-black">
                <button
                  type="button"
                  onClick={() => setCreateModeType('PARENT')}
                  className={`flex-1 py-1 text-sm font-bold ${createModeType === 'PARENT' ? 'bg-yellow-300' : 'bg-white'}`}
                >
                  PARENT CAT
                </button>
                <div className="w-0.5 bg-black"></div>
                <button
                  type="button"
                  onClick={() => setCreateModeType('CHILD')}
                  className={`flex-1 py-1 text-sm font-bold ${createModeType === 'CHILD' ? 'bg-yellow-300' : 'bg-white'}`}
                >
                  CHILD CAT
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 p-6">
              {/* Name */}
              <div>
                <Label className="brutal-label">CATEGORY NAME *</Label>
                <Input {...register('name')} className="brutal-input" placeholder="e.g. Starters" />
                {errors.name && <span className="text-xs font-bold text-red-600">{errors.name.message}</span>}
              </div>

              {/* Hierarchy Info (Read Only in Edit usually, unless allowed to change) */}
              <div>
                <Label className="brutal-label">TYPE</Label>
                <div className="mt-1 flex items-center gap-2 font-bold text-gray-600">
                  <span className="rounded border-2 border-black bg-gray-100 px-2 py-1 text-xs">
                    {hierarchy === 'PARENT' ? 'MASTER CATEGORY' : 'SUB CATEGORY'}
                  </span>
                </div>
              </div>

              {/* Parent Selection (If Child & Not Merged) */}
              {hierarchy === 'CHILD' && !isMergeMode && isHierarchyEnabled && (
                <div>
                  <Label className="brutal-label">LINK TO MASTER CATEGORY</Label>
                  <Controller
                    control={control}
                    name="parentId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''} disabled={isEdit && isMergeMode}>
                        <SelectTrigger className="brutal-select w-full">
                          <SelectValue placeholder="Select Master Category" />
                        </SelectTrigger>
                        <SelectContent
                          className="brutal-card border-2 border-black"
                          onPointerDownOutside={(e) => e.preventDefault()}
                          onInteractOutside={(e) => e.preventDefault()}
                        >
                          {allParentCategories?.map((p) => (
                            <SelectItem key={p._id} value={p._id} className="font-bold focus:bg-yellow-100">
                              {p.name.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.parentId && <span className="text-xs font-bold text-red-600">{errors.parentId.message}</span>}
                </div>
              )}

              {/* Children Selection (If Parent & Creating & Not Merged) */}
              {hierarchy === 'PARENT' && !isEdit && !isMergeMode && (
                <div>
                  <Label className="brutal-label">LINK SUB CATEGORIES (OPTIONAL)</Label>
                  <div className="h-32 overflow-y-auto rounded border-2 border-black bg-gray-50 p-2">
                    {allChildCategories?.map((child) => (
                      <div key={child._id} className="mb-2 flex items-center space-x-2">
                        <Controller
                          control={control}
                          name="childCategoryIds"
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value?.includes(child._id)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, child._id]);
                                } else {
                                  field.onChange(current.filter((id) => id !== child._id));
                                }
                              }}
                              className="border-2 border-black"
                            />
                          )}
                        />
                        <span className="text-sm font-bold">{child.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="brutal-label">IMAGE</Label>
                  {!watchImages?.length && (
                    <Button type="button" size="sm" onClick={() => setShowImageUpload(true)} className="brutal-button bg-cyan-300 px-2 py-0 text-xs">
                      UPLOAD
                    </Button>
                  )}
                </div>
                {watchImages?.[0] ? (
                  <div className="relative h-24 w-24 border-2 border-black">
                    <img src={watchImages[0]} alt="Cover" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      onClick={() => setValue('images', [])}
                    >
                      <HiX size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
                    NO IMAGE
                  </div>
                )}
              </div>

              {/* Visibility */}
              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="visibility"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="cat-vis"
                      className="border-2 border-black data-[state=checked]:bg-blue-400"
                    />
                  )}
                />
                <Label htmlFor="cat-vis" className="font-bold">
                  VISIBLE
                </Label>
              </div>
            </div>

            {/* Delete Button (Edit + Not Merged Only) */}
            {isEdit && !isMergeMode && (
              <div className="mt-8 border-t-2 border-dashed border-gray-300 p-6 pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full border-2 border-black bg-red-100 text-black hover:bg-red-200"
                >
                  <HiTrash className="mr-2" /> DELETE CATEGORY
                </Button>
              </div>
            )}

            <div className="border-t-4 border-black bg-white p-6">
              <div className="flex w-full justify-between gap-4">
                <Button type="button" variant="secondary" onClick={onClose} className="brutal-button w-1/3 bg-gray-200">
                  CANCEL
                </Button>
                <Button type="submit" disabled={!isValid || isSubmitting} className="brutal-button-primary w-2/3">
                  {isSubmitting ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'CREATE'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => {
          if (!isUploadingImages) {
            setShowImageUpload(false);
          }
        }}
        entityId={category?._id || 'new_category'}
        existingImages={watchImages || []}
        onSave={handleImageAssignment}
        maxImages={1}
        title="CATEGORY IMAGE"
      />
      {isUploadingImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="brutal-card bg-white p-6">
            <p className="brutal-heading">Uploading image...</p>
            <p className="brutal-body mt-2">Please wait...</p>
          </div>
        </div>
      )}
    </PopUp>
  );
});
