/**
 * DishModalV2.tsx
 *
 * Unified Create/Edit modal for dishes.
 * Implements "Neo-Brutalism" UI style.
 * Handles merge mode restrictions.
 * Integrates with validation schemas.
 */

import PopUp from '@/components/atom/popUp';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLiveQuery } from 'dexie-react-hooks';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiPhotograph, HiPlus, HiTrash, HiX } from 'react-icons/hi';
import { db } from '../../db/menu.database';

import { DraftOpsRepository } from '../../db/DraftOpsRepository';

import { storeImageAfterSave } from '@/components/utils/helper';
import { DishFormSchema, type DishFormValues } from '../../validations';
import { ImageUploadModal } from '../ImageUploadModal';

import '../../styles/brutalist.css';
import type { MenuAddon, MenuCategory, MenuDish } from '../../types';

// Predefined tags for dish tagging
const PREDEFINED_TAGS = ['BESTSELLER', 'CHEF SPECIAL', 'SPICY', 'NEW', 'RECOMMENDED', 'POPULAR', 'SIGNATURE', 'KIDS'];

interface DishModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  dish: MenuDish | null; // null = create mode
  businessId: string;
  selectedMenuId: string; // "ALL" or specific ID

  // Data for linking (memoized in parent)
  allCategories: MenuCategory[];
  allAddons: MenuAddon[];
  allDishes?: MenuDish[];

  // For merge mode logic
  isMergeMode: boolean;
  mergedMenuIds: string[];
  dishesGroupedByNameKey?: Map<string, MenuDish[]>;
}

export const DishModalV2 = memo(function DishModalV2({
  isOpen,
  onClose,
  dish,
  businessId,
  selectedMenuId,
  allCategories,
  allAddons,
  allDishes = [],
  isMergeMode,
  mergedMenuIds,
  dishesGroupedByNameKey,
}: DishModalV2Props) {
  const isEdit = !!dish;
  const isMergedView = isMergeMode || selectedMenuId === 'ALL'; // Treat ALL as merge-like if no specific menu selected? User req said "If menu is NOT merged...". Assuming "ALL" + !merge means we prompt user, so likely we are in specific menu or explicit merge.

  // ----------------------------------------------------
  // Form Setup
  // ----------------------------------------------------
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<DishFormValues>({
    resolver: zodResolver(DishFormSchema),
    defaultValues: {
      name: '',
      dishType: 'VEG',
      kitchenId: '', // Default or first available
      price: 0,
      avgPrepTime: 0,
      description: '',
      availability: true,
      visibility: true,
      portions: [],
      categoryIds: [],
      addonIds: [],
      images: [],
      tags: [],
      recommendedDishIds: [],
    },
    mode: 'onChange',
  });

  const {
    fields: portionFields,
    append: appendPortion,
    remove: removePortion,
  } = useFieldArray({
    control,
    name: 'portions',
  });

  // Watchers
  const portions = watch('portions');
  const watchPrice = watch('price');
  const watchImages = watch('images');
  const watchTags = watch('tags');

  // ----------------------------------------------------
  // Kitchen Data
  // ----------------------------------------------------
  const kitchenByBusinessData = useLiveQuery(async () => {
    if (!businessId) return [];
    const allKitchens = await db.kitchens.where({ menuId: selectedMenuId }).toArray();
    console.log(allKitchens);
    if (selectedMenuId && selectedMenuId !== 'ALL') {
      return allKitchens.filter((k) => k.menuId === selectedMenuId || !k.menuId);
    }
    return allKitchens;
  }, [businessId, selectedMenuId]);

  const LoadingKitchensByBusiness = kitchenByBusinessData === undefined;

  // ----------------------------------------------------
  // Local State
  // ----------------------------------------------------
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [applyToMerged, setApplyToMerged] = useState(false); // Default logic in useEffect
  const [tagInput, setTagInput] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [addonSearch, setAddonSearch] = useState('');
  const [recommendationSearch, setRecommendationSearch] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const matchingDishes = useMemo(() => {
    if (!dish?.nameKey || !dishesGroupedByNameKey) return [];
    return dishesGroupedByNameKey.get(dish.nameKey) || [];
  }, [dish?.nameKey, dishesGroupedByNameKey]);

  // Filtered linking lists (memoized for performance)
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return allCategories;
    const q = categorySearch.toLowerCase();
    return allCategories.filter((cat) => cat.name?.toLowerCase().includes(q));
  }, [allCategories, categorySearch]);

  const filteredAddons = useMemo(() => {
    if (!addonSearch.trim()) return allAddons;
    const q = addonSearch.toLowerCase();
    return allAddons.filter((addon) => addon.name?.toLowerCase().includes(q));
  }, [allAddons, addonSearch]);

  const filteredRecommendations = useMemo(() => {
    if (!recommendationSearch.trim()) return allDishes.filter((d) => d._id !== dish?._id);
    const q = recommendationSearch.toLowerCase();
    return allDishes.filter((d) => d._id !== dish?._id && d.name?.toLowerCase().includes(q));
  }, [allDishes, dish?._id, recommendationSearch]);

  // ----------------------------------------------------
  // Initialization
  // ----------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      if (dish) {
        reset({
          name: dish.name,
          dishType: (dish.dishType as any) || 'VEG',
          kitchenId: dish.kitchenId || '',
          price: dish.price || 0,
          avgPrepTime: dish.avgPrepTime || 0,
          description: dish.description || '',
          availability: dish.availability ?? true,
          visibility: dish.visibility ?? true,
          portions: dish.portions || [],
          categoryIds: dish.categoryIds || [],
          addonIds: (dish as any).addonIds || [], // Assuming field exists
          images: dish.images || [],
          tags: dish.tags || [],
          recommendedDishIds: (dish as any).recommendedDishIds || [],
        });

        // Merge mode toggle default
        if (isMergedView && matchingDishes.length > 1) {
          setApplyToMerged(true);
        } else {
          setApplyToMerged(false);
        }
      } else {
        reset({
          name: '',
          dishType: 'VEG',
          kitchenId: '',
          price: 0,
          avgPrepTime: 0,
          availability: true,
          visibility: true,
          portions: [],
          categoryIds: [],
          addonIds: [],
          images: [],
          tags: [],
          recommendedDishIds: [],
        });
        setApplyToMerged(false);
      }
    }
  }, [isOpen, dish, reset, isMergedView, matchingDishes.length]);

  // Reset search states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCategorySearch('');
      setAddonSearch('');
      setRecommendationSearch('');
      setTagInput('');
    }
  }, [isOpen]);

  // Logic: Set base price if portions exist
  useEffect(() => {
    if (portions && portions.length > 0) {
      // Find min price
      const min = Math.min(...portions.map((p) => p.price || 0));
      if (watchPrice !== min) {
        setValue('price', min, { shouldValidate: true });
      }
    }
  }, [portions, setValue, watchPrice]);

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const current = watchTags || [];
      if (!current.includes(tagInput.trim())) {
        setValue('tags', [...current, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const current = watchTags || [];
    setValue(
      'tags',
      current.filter((t) => t !== tag),
    );
  };

  const handleTogglePredefinedTag = useCallback(
    (tag: string) => {
      const current = watchTags || [];
      if (current.includes(tag)) {
        setValue(
          'tags',
          current.filter((t) => t !== tag),
        );
      } else {
        setValue('tags', [...current, tag]);
      }
    },
    [watchTags, setValue],
  );

  // ----------------------------------------------------
  // Handlers
  // ----------------------------------------------------
  const onSubmit = async (data: DishFormValues) => {
    try {
      // Validate kitchen when not in merged mode (kitchen is a linking field, hidden in merge mode)
      if (!isMergedView && !data.kitchenId) {
        setValue('kitchenId', '', { shouldValidate: true });
        toast.error('KITCHEN IS REQUIRED');
        return;
      }

      // Create Payload (exclude kitchenId if in merged mode)
      const payload: any = {
        ...data,
      };

      // Remove kitchenId from payload in merged mode since it's a linking field
      if (isMergedView) {
        delete payload.kitchenId;
      }

      if (isEdit && dish) {
        // UPDATE MODE
        if (isMergedView && applyToMerged && matchingDishes.length > 1) {
          // Bulk Update
          for (const d of matchingDishes) {
            await DraftOpsRepository.updateDish(d._id, businessId, payload);
          }
          toast.success(`Updated ${matchingDishes.length} dishes in merged menus`);
        } else {
          // Single Update
          await DraftOpsRepository.updateDish(dish._id, businessId, payload);
          toast.success('Dish updated successfully');
        }
      } else {
        // CREATE MODE (Only allowed if NOT merged or explicitly handled)
        if (isMergedView && selectedMenuId === 'ALL') {
          toast.error('Please select a specific menu to create dishes.');
          return;
        }

        // Offline-first: Write to Dexie + create draftOp (NO server call)
        if (selectedMenuId === 'ALL') {
          toast.error('Please select a specific menu to create dishes.');
          return;
        }

        // Server requires description to be >=10 chars or empty string
        const description = data.description && data.description.length >= 10 ? data.description : '';

        // Pass formData directly to createDish (payload builder handles server format)
        const localId = await DraftOpsRepository.createDish(
          businessId,
          selectedMenuId,
          { ...data, description }, // Form data with fixed description
          [], // Uploaded image URLs (currently empty, will be populated from images field)
        );

        toast.success('Dish created locally. Push to server when ready.');
      }
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save dish');
    }
  };

  const handleImageAssignment = async (images: Array<{ preview: string; file: File }>) => {
    setIsUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      // Upload each image to server first
      for (const image of images) {
        if (image.file && image.file.size > 0) {
          // New image - upload to server
          const uploadedUrl = await storeImageAfterSave(image.file, image.preview, setIsUploadingImages);
          if (uploadedUrl) {
            uploadedUrls.push(uploadedUrl);
          }
        } else if (image.preview && image.preview.startsWith('http')) {
          // Already a URL (existing image) - use as-is
          uploadedUrls.push(image.preview);
        } else if (image.preview && image.preview.startsWith('data:')) {
          // Base64 data URL but no file - try to convert and upload
          try {
            const response = await fetch(image.preview);
            const blob = await response.blob();
            const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
            const uploadedUrl = await storeImageAfterSave(file, image.preview, setIsUploadingImages);
            if (uploadedUrl) {
              uploadedUrls.push(uploadedUrl);
            }
          } catch (error) {
            console.error('Error converting base64 to file:', error);
          }
        }
      }

      // Update form with uploaded URLs
      setValue('images', uploadedUrls, { shouldValidate: true });
      setShowImageUpload(false);
      toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploadingImages(false);
    }
  };

  // ----------------------------------------------------
  // Render Helpers
  // ----------------------------------------------------
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

        <div className="brutal-card m-6 overflow-hidden bg-white p-0">
          <div className="border-b-4 border-black bg-white p-6">
            <h2 className="brutal-heading text-2xl">{isEdit ? `EDIT DISH: ${(dish?.name || '').toUpperCase()}` : 'NEW DISH'}</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <ScrollArea className="h-[60vh] bg-gray-50 p-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* LEFT COLUMN: Basic Info */}
                <div className="space-y-6">
                  {/* 1. Basic Details Card */}
                  <div className="brutal-card bg-white p-4">
                    <h3 className="brutal-heading mb-4 text-lg">BASIC DETAILS</h3>

                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <Label className="brutal-label">ITEM NAME *</Label>
                        <Input {...register('name')} className="brutal-input" placeholder="e.g. Butter Chicken" />
                        {errors.name && <span className="text-xs font-bold text-red-600">{errors.name.message}</span>}
                      </div>

                      {/* Type */}
                      <div>
                        <Label className="brutal-label">TYPE</Label>
                        <Controller
                          control={control}
                          name="dishType"
                          render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-3">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="VEG" id="r-veg" className="border-2 border-black text-green-600" />
                                <Label htmlFor="r-veg" className="font-bold">
                                  VEG
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="NON_VEG" id="r-nonveg" className="border-2 border-black text-red-600" />
                                <Label htmlFor="r-nonveg" className="font-bold">
                                  NON-VEG
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="EGG" id="r-egg" className="border-2 border-black text-yellow-600" />
                                <Label htmlFor="r-egg" className="font-bold">
                                  EGG
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ALCOHOL" id="r-alcohol" className="border-2 border-black text-purple-600" />
                                <Label htmlFor="r-alcohol" className="font-bold">
                                  ALCOHOL
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="NON_ALCOHOL" id="r-nonalcohol" className="border-2 border-black text-blue-600" />
                                <Label htmlFor="r-nonalcohol" className="font-bold">
                                  NON-ALCOHOL
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>

                      {/* Kitchen - Hidden in Merge Mode */}
                      {!isMergedView && (
                        <div>
                          <Label className="brutal-label">KITCHEN *</Label>
                          <Controller
                            control={control}
                            name="kitchenId"
                            render={({ field }) => (
                              <Select value={field.value || ''} onValueChange={field.onChange}>
                                <SelectTrigger className="brutal-input" style={{ border: '3px solid #000000' }}>
                                  <SelectValue placeholder={LoadingKitchensByBusiness ? 'Loading...' : 'Select Kitchen'} />
                                </SelectTrigger>
                                <SelectContent
                                  className="brutal-card"
                                  style={{ border: '3px solid #000000', background: '#FFFFFF' }}
                                  onInteractOutside={(e) => {
                                    // Prevent closing modal when clicking outside select
                                    e.preventDefault();
                                  }}
                                >
                                  {(kitchenByBusinessData || []).map((kitchen) => (
                                    <SelectItem
                                      key={kitchen._id}
                                      value={kitchen._id}
                                      className="brutal-body cursor-pointer px-3 py-2"
                                      style={{ fontSize: '0.875rem', fontWeight: 600 }}
                                    >
                                      {kitchen.name}
                                    </SelectItem>
                                  ))}
                                  {(!kitchenByBusinessData || kitchenByBusinessData.length === 0) && (
                                    <div className="px-3 py-2 text-xs text-gray-400">No kitchens available</div>
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.kitchenId && (
                            <span className="text-xs font-bold text-red-600">{errors.kitchenId.message || 'KITCHEN IS REQUIRED'}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Pricing & Portions */}
                  <div className="brutal-card bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="brutal-heading text-lg">PRICING</h3>
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentPortions = portions || [];
                          const dishType = watch('dishType') || 'VEG';
                          appendPortion({
                            name: '',
                            price: 0,
                            default: false, // User can set default manually
                            portionTypes: [dishType], // Default to dish type
                          });
                        }}
                        className="brutal-button bg-yellow-300 text-xs"
                      >
                        <HiPlus className="mr-1" /> ADD PORTION
                      </Button>
                    </div>

                    {/* Base Price (Read only if portions exist) */}
                    <div className="mb-4">
                      <Label className="brutal-label">BASE PRICE (₹) {portions?.length > 0 && '(AUTO-CALCULATED)'}</Label>
                      <Input type="number" {...register('price', { valueAsNumber: true })} className="brutal-input" readOnly={portions?.length > 0} />
                      {errors.price && <span className="text-xs font-bold text-red-600">{errors.price.message}</span>}
                    </div>

                    <div className="mb-4">
                      <Label className="brutal-label">DELIVERY WITHIN (MIN)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={1440}
                        placeholder="e.g. 20"
                        {...register('avgPrepTime', {
                          setValueAs: (value) => (value === '' ? 0 : Number(value)),
                        })}
                        className="brutal-input"
                      />
                      {errors.avgPrepTime && <span className="text-xs font-bold text-red-600">{errors.avgPrepTime.message}</span>}
                    </div>

                    {/* Portions List */}
                    {portionFields.map((field, index) => {
                      const portion = portions?.[index];
                      const isDefault = portion?.default ?? false; // Default to false, not index === 0
                      return (
                        <div key={field.id} className="mb-3 space-y-2 border-2 border-gray-200 p-2">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <Input
                                {...register(`portions.${index}.name`)}
                                placeholder="Portion Name (e.g. Half)"
                                className="brutal-input text-xs"
                              />
                              {errors.portions?.[index]?.name && <span className="text-[10px] text-red-600">Required</span>}
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                {...register(`portions.${index}.price`, { valueAsNumber: true })}
                                placeholder="Price"
                                className="brutal-input text-xs"
                              />
                              {errors.portions?.[index]?.price && <span className="text-[10px] text-red-600">Invalid</span>}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-9 w-9 border-2 border-black"
                              onClick={() => removePortion(index)}
                            >
                              <HiTrash />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={isDefault}
                                onChange={(e) => {
                                  const currentPortions = portions || [];
                                  const updated = currentPortions.map((p, i) => ({
                                    ...p,
                                    default: i === index ? e.target.checked : false, // Only one can be default
                                  }));
                                  setValue('portions', updated, { shouldValidate: true });
                                }}
                                className="h-4 w-4 border-2 border-black"
                              />
                              <span className="font-bold">DEFAULT</span>
                            </label>
                            <div className="flex-1">
                              <Label className="text-[10px] font-bold">DISH TYPES</Label>
                              <Controller
                                control={control}
                                name={`portions.${index}.portionTypes`}
                                render={({ field: portionTypeField }) => (
                                  <div className="flex flex-wrap gap-1">
                                    {['VEG', 'NON_VEG', 'EGG', 'ALCOHOL', 'NON_ALCOHOL'].map((type) => (
                                      <label key={type} className="flex items-center gap-1 text-[10px]">
                                        <input
                                          type="checkbox"
                                          checked={portionTypeField.value?.includes(type) ?? false}
                                          onChange={(e) => {
                                            const current = portionTypeField.value || [];
                                            const dishType = watch('dishType') || 'VEG';
                                            const updated = e.target.checked ? [...current, type] : current.filter((t) => t !== type);
                                            // Ensure at least one type is selected, default to dish type
                                            portionTypeField.onChange(updated.length > 0 ? updated : [dishType]);
                                          }}
                                          className="h-3 w-3 border border-black"
                                        />
                                        <span>{type}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 3. Availability & Visibility */}
                  <div className="brutal-card bg-white p-4">
                    <h3 className="brutal-heading mb-4 text-lg">STATUS</h3>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <Controller
                          control={control}
                          name="availability"
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="chk-avail"
                              className="border-2 border-black data-[state=checked]:bg-green-400"
                            />
                          )}
                        />
                        <Label htmlFor="chk-avail" className="font-bold">
                          AVAILABLE
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Controller
                          control={control}
                          name="visibility"
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="chk-vis"
                              className="border-2 border-black data-[state=checked]:bg-blue-400"
                            />
                          )}
                        />
                        <Label htmlFor="chk-vis" className="font-bold">
                          VISIBLE
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Linking & Media */}
                <div className="space-y-6">
                  {/* 4. Images */}
                  <div className="brutal-card bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="brutal-heading text-lg">IMAGES (MAX 3)</h3>
                      {watchImages?.length < 3 && (
                        <Button type="button" onClick={() => setShowImageUpload(true)} className="brutal-button bg-cyan-300 text-xs">
                          <HiPhotograph className="mr-1" /> UPLOAD
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {watchImages?.map((img, idx) => (
                        <div key={idx} className="relative h-20 w-20 border-2 border-black">
                          <img src={img} alt={`Dish ${idx}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            onClick={() => {
                              const current = watchImages;
                              setValue(
                                'images',
                                current.filter((_, i) => i !== idx),
                              );
                            }}
                          >
                            <HiX size={10} />
                          </button>
                        </div>
                      ))}
                      {watchImages?.length === 0 && (
                        <div className="flex h-20 w-full items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
                          NO IMAGES
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5. Categories (Linked) - Hide in Merge Mode */}
                  {!isMergedView && (
                    <div className="brutal-card bg-white p-4">
                      <h3 className="brutal-heading mb-4 text-lg">CATEGORIES</h3>
                      <div className="mb-2">
                        <Input
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="brutal-input text-xs"
                          placeholder="Search categories..."
                          style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                        />
                        {categorySearch && (
                          <button
                            type="button"
                            onClick={() => setCategorySearch('')}
                            className="ml-2 text-xs font-bold text-red-600"
                            style={{ fontSize: '0.75rem' }}
                          >
                            CLEAR
                          </button>
                        )}
                      </div>
                      <ScrollArea className="h-32 rounded border-2 border-black bg-gray-50 p-2">
                        {filteredCategories.map((cat) => (
                          <div key={cat._id} className="mb-2 flex items-center space-x-2">
                            <Controller
                              control={control}
                              name="categoryIds"
                              render={({ field }) => (
                                <Checkbox
                                  checked={field.value?.includes(cat._id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, cat._id]);
                                    } else {
                                      field.onChange(current.filter((id) => id !== cat._id));
                                    }
                                  }}
                                  className="border-2 border-black"
                                />
                              )}
                            />
                            <span className="text-sm font-bold">{cat.name}</span>
                          </div>
                        ))}
                        {filteredCategories.length === 0 && <span className="text-xs text-gray-400">No categories found</span>}
                      </ScrollArea>
                    </div>
                  )}

                  {/* 6. Addons (Linked) - Hide in Merge Mode */}
                  {!isMergedView && (
                    <div className="brutal-card bg-white p-4">
                      <h3 className="brutal-heading mb-4 text-lg">ADDONS</h3>
                      <div className="mb-2">
                        <Input
                          value={addonSearch}
                          onChange={(e) => setAddonSearch(e.target.value)}
                          className="brutal-input text-xs"
                          placeholder="Search addons..."
                          style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                        />
                        {addonSearch && (
                          <button
                            type="button"
                            onClick={() => setAddonSearch('')}
                            className="ml-2 text-xs font-bold text-red-600"
                            style={{ fontSize: '0.75rem' }}
                          >
                            CLEAR
                          </button>
                        )}
                      </div>
                      <ScrollArea className="h-32 rounded border-2 border-black bg-gray-50 p-2">
                        {filteredAddons.map((addon) => (
                          <div key={addon._id} className="mb-2 flex items-center space-x-2">
                            <Controller
                              control={control}
                              name="addonIds"
                              render={({ field }) => (
                                <Checkbox
                                  checked={field.value?.includes(addon._id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, addon._id]);
                                    } else {
                                      field.onChange(current.filter((id) => id !== addon._id));
                                    }
                                  }}
                                  className="border-2 border-black"
                                />
                              )}
                            />
                            <span className="text-sm font-bold">{addon.name}</span>
                          </div>
                        ))}
                        {filteredAddons.length === 0 && <span className="text-xs text-gray-400">No addons found</span>}
                      </ScrollArea>
                    </div>
                  )}

                  {/* 7. Recommendations (Linked) */}
                  {!isMergedView && (
                    <div className="brutal-card bg-white p-4">
                      <h3 className="brutal-heading mb-4 text-lg">RECOMMENDATIONS</h3>
                      <div className="mb-2">
                        <Input
                          value={recommendationSearch}
                          onChange={(e) => setRecommendationSearch(e.target.value)}
                          className="brutal-input text-xs"
                          placeholder="Search dishes..."
                          style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                        />
                        {recommendationSearch && (
                          <button
                            type="button"
                            onClick={() => setRecommendationSearch('')}
                            className="ml-2 text-xs font-bold text-red-600"
                            style={{ fontSize: '0.75rem' }}
                          >
                            CLEAR
                          </button>
                        )}
                      </div>
                      <ScrollArea className="h-32 rounded border-2 border-black bg-gray-50 p-2">
                        {filteredRecommendations.map((d) => (
                          <div key={d._id} className="mb-2 flex items-center space-x-2">
                            <Controller
                              control={control}
                              name="recommendedDishIds"
                              render={({ field }) => (
                                <Checkbox
                                  checked={field.value?.includes(d._id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, d._id]);
                                    } else {
                                      field.onChange(current.filter((id) => id !== d._id));
                                    }
                                  }}
                                  className="border-2 border-black"
                                />
                              )}
                            />
                            <span className="truncate text-sm font-bold">{d.name}</span>
                          </div>
                        ))}
                        {filteredRecommendations.length === 0 && <span className="text-xs text-gray-400">No dishes found</span>}
                      </ScrollArea>
                    </div>
                  )}

                  {/* 8. Tags */}
                  <div className="brutal-card bg-white p-4">
                    <Label className="brutal-label mb-2 block">TAGS</Label>

                    {/* Predefined Tags */}
                    <div className="mb-3">
                      <Label className="brutal-label mb-2 block text-xs">PREDEFINED TAGS</Label>
                      <div className="flex flex-wrap gap-2">
                        {PREDEFINED_TAGS.map((tag) => {
                          const isSelected = watchTags?.includes(tag) || false;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTogglePredefinedTag(tag)}
                              className={`brutal-button px-3 py-1 text-xs font-bold ${isSelected ? 'bg-yellow-400' : 'bg-white'}`}
                              style={{
                                border: '2px solid #000000',
                                fontSize: '0.75rem',
                                padding: '4px 12px',
                              }}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Tag Input */}
                    <div className="mb-2">
                      <Label className="brutal-label mb-2 block text-xs">CUSTOM TAG</Label>
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          className="brutal-input text-xs"
                          placeholder="Type custom tag and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddTag} className="brutal-button bg-gray-200">
                          <HiPlus />
                        </Button>
                      </div>
                    </div>

                    {/* Selected Tags Display */}
                    {watchTags && watchTags.length > 0 && (
                      <div className="mt-2">
                        <Label className="brutal-label mb-2 block text-xs">SELECTED TAGS</Label>
                        <div className="flex flex-wrap gap-1">
                          {watchTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="flex items-center gap-1 border-2 border-black bg-yellow-200 px-2 py-1 text-xs font-bold"
                              style={{ border: '2px solid #000000' }}
                            >
                              {tag}
                              <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:bg-red-200">
                                <HiX size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 9. Description */}
                  <div className="brutal-card bg-white p-4">
                    <Label className="brutal-label mb-2 block">DESCRIPTION</Label>
                    <Textarea {...register('description')} className="brutal-input min-h-[80px]" placeholder="Describe the dish..." />
                  </div>
                </div>
              </div>

              {/* Merge Mode Toggle */}
              {isMergedView && matchingDishes.length > 1 && (
                <div className="shadow-brutal mt-6 border-4 border-black bg-yellow-100 p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="applyMerged"
                      checked={applyToMerged}
                      onCheckedChange={(v) => setApplyToMerged(Boolean(v))}
                      className="h-6 w-6 border-2 border-black bg-white"
                    />
                    <label htmlFor="applyMerged" className="brutal-heading cursor-pointer text-lg">
                      APPLY TO MERGED MENUS ({matchingDishes.length} ITEMS)
                    </label>
                  </div>
                  <p className="mt-1 pl-9 text-sm font-bold text-gray-700">Warning: This will overwrite changes to all linked dishes across menus.</p>
                </div>
              )}
            </ScrollArea>

            <div className="border-t-4 border-black bg-white p-4">
              <div className="flex w-full justify-between gap-4">
                <Button type="button" variant="secondary" onClick={onClose} className="brutal-button w-1/3 bg-gray-200 hover:bg-gray-300">
                  CANCEL
                </Button>
                <Button type="submit" disabled={!isValid || isSubmitting} className="brutal-button-primary w-2/3">
                  {isSubmitting ? 'SAVING...' : isEdit ? (applyToMerged ? 'SAVE ALL' : 'SAVE CHANGES') : 'CREATE DISH'}
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
        entityId={dish?._id || 'new_dish'}
        existingImages={watchImages || []}
        onSave={handleImageAssignment}
        maxImages={3}
      />
      {isUploadingImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="brutal-card bg-white p-6">
            <p className="brutal-heading">Uploading images...</p>
            <p className="brutal-body mt-2">Please wait...</p>
          </div>
        </div>
      )}
    </PopUp>
  );
});
