/**
 * ItemsPanel Component
 *
 * Main panel for managing dishes/items in Menu V2.
 * Displays dishes in a table format with category filtering, search, and inline editing.
 */

import useBusinessData from '@/components/store/useBusinessData';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiPlus } from 'react-icons/hi';
import { DraftOpsRepository } from '../db/DraftOpsRepository';
import { PendingImagesRepository } from '../db/PendingImagesRepository';
import { useMenuViewData } from '../hooks/useMenuViewData';
import { useMenuUIStore } from '../store/useMenuUIStore';
import '../styles/brutalist.css';
import type { MenuCategory, MenuDish, MenuLayout } from '../types';
import { BulkImageUploadModal } from './BulkImageUploadModal';
import { DishRow } from './DishRow';
import { ImageUploadModal } from './ImageUploadModal';
import { AvailabilityVisibilityModal } from './modals/AvailabilityVisibilityModal';
import { DishModalV2 } from './modals/DishModalV2';
import { PriceAdjustmentModal } from './modals/PriceAdjustmentModal';
import { QuickMenuPanel } from './QuickMenuPanel';

export const ItemsPanel = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const [search, setSearch] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const selectedMenuId = useMenuUIStore((s) => s.selectedMenuId);
  const mergeMode = useMenuUIStore((s) => s.mergeMode);
  const mergedMenuIds = useMenuUIStore((s) => s.mergedMenuIds);

  const { categories, dishes, dishCountByCategoryId, dishesGroupedByNameKey, dishesByCategoryId, menus, addons } = useMenuViewData({ businessId });

  const [activeCategory, setActiveCategory] = useState<string | 'ALL'>('ALL');
  const [editingDish, setEditingDish] = useState<MenuDish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);

  const [imageUploadDish, setImageUploadDish] = useState<MenuDish | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showPriceAdjustment, setShowPriceAdjustment] = useState(false);
  const [showAvailabilityVisibility, setShowAvailabilityVisibility] = useState(false);
  const showQuickMenu = useMenuUIStore((s) => s.showQuickMenu);
  const setShowQuickMenu = useMenuUIStore((s) => s.setShowQuickMenu);

  // Get selected menu's menuType to determine category filtering
  const selectedMenu = useMemo<MenuLayout | null>(() => {
    if (selectedMenuId === 'ALL' || !menus) return null;
    return menus.find((m) => m._id === selectedMenuId) || null;
  }, [menus, selectedMenuId]);

  // Get pending images for all dishes
  const pendingImages =
    useLiveQuery(async () => {
      if (!businessId) return new Map<string, string[]>();
      const allPending = await PendingImagesRepository.getAllPendingImages(businessId);
      const map = new Map<string, string[]>(); // dishId -> [preview1, preview2, preview3]
      for (const img of allPending) {
        if (!map.has(img.dishId)) {
          map.set(img.dishId, ['', '', '']);
        }
        const arr = map.get(img.dishId)!;
        arr[img.imageIndex] = img.preview;
      }
      return map;
    }, [businessId]) || new Map<string, string[]>();

  // Filter categories based on menuType
  const displayCategories = useMemo<MenuCategory[]>(() => {
    if (!selectedMenu) return categories;
    if (selectedMenu.menuType === 2) {
      // menuType 2: Only show CHILD categories
      return categories.filter((c) => c.hierarchy === 'CHILD' || !!c.parentId);
    }
    // menuType 1: Show all categories
    return categories;
  }, [categories, selectedMenu]);

  const filteredCategories = useMemo<MenuCategory[]>(() => {
    let cats = displayCategories;
    if (hideEmpty) {
      cats = cats.filter((c) => (dishCountByCategoryId.get(c._id || '') || 0) > 0);
    }
    return cats;
  }, [displayCategories, hideEmpty, dishCountByCategoryId]);

  // Get dishes for selected category from relationship map
  const filteredDishes = useMemo<MenuDish[]>(() => {
    let categoryDishes = dishes;
    if (activeCategory !== 'ALL') {
      // Use dishesByCategoryId from useMenuViewData which resolves category.dishIds[]
      categoryDishes = dishesByCategoryId.get(activeCategory) || [];
    }

    return categoryDishes
      .filter((d) => {
        if (availableOnly && d.availability === false) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return d.name?.toLowerCase().includes(q) || (d as MenuDish & { shortCode?: string }).shortCode?.toLowerCase().includes(q);
      })
      .map((d) => {
        const displayPrice = d.price ?? 0;
        const displayVisibility = d.visibility ?? true;
        return { ...d, displayPrice, displayVisibility };
      });
  }, [dishes, activeCategory, availableOnly, search, dishesByCategoryId]);

  const handleToggleAvailability = async (dishId: string, availability: boolean) => {
    if (!businessId) return;
    try {
      await DraftOpsRepository.updateDishFields(dishId, businessId, { availability });
      toast.success('Availability updated');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleToggleVisibility = async (dishId: string, visibility: boolean) => {
    if (!businessId) return;
    try {
      await DraftOpsRepository.updateDishFields(dishId, businessId, { visibility });
      toast.success('Visibility updated');
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  // Handlers for Dish Modal
  const handleCloseDishModal = () => {
    setIsDishModalOpen(false);
    setEditingDish(null);
  };

  const handleOpenCreateDish = () => {
    setEditingDish(null);
    setIsDishModalOpen(true);
  };

  const handleOpenEditDish = (dish: MenuDish) => {
    setEditingDish(dish);
    setIsDishModalOpen(true);
  };

  // Show Quick Menu Panel if enabled
  if (showQuickMenu) {
    return <QuickMenuPanel businessId={businessId || ''} onBack={() => setShowQuickMenu(false)} />;
  }

  return (
    <div className="flex gap-4">
      {/* Left sidebar categories - Brutalist */}
      <aside className="brutal-sidebar brutal-card" style={{ width: '240px' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '3px solid #000000' }}>
          <div>
            <div className="brutal-heading" style={{ fontSize: '0.875rem' }}>
              CATEGORIES
            </div>
            <div className="brutal-body" style={{ fontSize: '0.75rem' }}>
              Filter items by category
            </div>
          </div>
          <div className="brutal-body flex items-center gap-2" style={{ fontSize: '0.75rem' }}>
            <Checkbox checked={hideEmpty} onCheckedChange={(v) => setHideEmpty(Boolean(v))} />
            <span>HIDE EMPTY</span>
          </div>
        </div>
        <div className="max-h-[540px] overflow-y-auto">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={cn(
              'brutal-body flex w-full items-center justify-between px-4 py-2 text-left',
              activeCategory === 'ALL' ? 'brutal-active' : '',
            )}
            style={{
              borderBottom: '2px solid #000000',
              fontSize: '0.875rem',
            }}
          >
            <span>ALL ITEMS</span>
            <span className="brutal-badge">{dishes.length}</span>
          </button>
          {filteredCategories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setActiveCategory(cat._id || '')}
              className={cn(
                'brutal-body flex w-full items-center justify-between px-4 py-2 text-left',
                activeCategory === cat._id ? 'brutal-active' : '',
              )}
              style={{
                borderBottom: '2px solid #000000',
                fontSize: '0.875rem',
              }}
            >
              <span className="truncate" style={{ textTransform: 'uppercase', fontWeight: activeCategory === cat._id ? 900 : 600 }}>
                {cat.name}
              </span>
              <span className="brutal-badge">{dishCountByCategoryId.get(cat._id || '') || 0}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Items table - Brutalist */}
      <section className="brutal-card min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderBottom: '3px solid #000000' }}>
          <input
            type="text"
            placeholder="SEARCH ITEMS"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="brutal-input"
            style={{ width: '256px', padding: '8px 12px', fontSize: '0.875rem', maxWidth: '100%' }}
          />

          <button
            type="button"
            onClick={handleOpenCreateDish}
            disabled={activeCategory === 'ALL' && selectedMenuId === 'ALL' && !mergeMode}
            className="brutal-button-primary bg-yellow-400 text-sm disabled:opacity-50"
            style={{ padding: '8px 16px', fontWeight: 900 }}
          >
            <HiPlus className="brutal-icon" style={{ width: '16px', height: '16px', display: 'inline' }} /> ADD ITEM
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="brutal-button" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>
                ACTIONS <MoreHorizontal className="brutal-icon" style={{ width: '16px', height: '16px', display: 'inline', marginLeft: '4px' }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="brutal-card" style={{ border: '3px solid #000000', background: '#FFFFFF' }}>
              <DropdownMenuItem
                onClick={() => setShowBulkUpload(true)}
                className="brutal-body cursor-pointer px-3 py-2"
                style={{ fontSize: '0.875rem', fontWeight: 600 }}
              >
                BULK UPLOAD IMAGES
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowQuickMenu(true)}
                className="brutal-body cursor-pointer px-3 py-2"
                style={{ fontSize: '0.875rem', fontWeight: 600 }}
              >
                QUICK MENU UPDATE
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowPriceAdjustment(true)}
                className="brutal-body cursor-pointer px-3 py-2"
                style={{ fontSize: '0.875rem', fontWeight: 600 }}
              >
                INCREASE/DECREASE MENU PRICE
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="brutal-button" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>
                QUICK ACTIONS{' '}
                <MoreHorizontal className="brutal-icon" style={{ width: '16px', height: '16px', display: 'inline', marginLeft: '4px' }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="brutal-card" style={{ border: '3px solid #000000', background: '#FFFFFF' }}>
              <DropdownMenuItem
                onClick={() => setShowAvailabilityVisibility(true)}
                className="brutal-body cursor-pointer px-3 py-2"
                style={{ fontSize: '0.875rem', fontWeight: 600 }}
              >
                AVAILABILITY/VISIBILITY
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="brutal-body ml-auto flex items-center gap-2" style={{ fontSize: '0.875rem' }}>
            <Checkbox checked={availableOnly} onCheckedChange={(v) => setAvailableOnly(Boolean(v))} />
            <span>AVAILABLE ONLY</span>
          </div>
        </div>

        <div className="overflow-x-auto" style={{ background: '#FFFFFF' }}>
          {/* Table Header - Sticky within scrollable container */}
          <div
            className="brutal-table-header grid grid-cols-12 gap-1 px-4 py-3"
            style={{ fontSize: '0.75rem', letterSpacing: '0.05em', minWidth: '1000px' }}
          >
            <span className="col-span-1 min-w-[30px]">#</span>
            <span className="col-span-2 min-w-[120px]">NAME</span>
            <span className="col-span-1 hidden min-w-[80px] lg:block">TYPE</span>
            <span className="col-span-1 min-w-[60px]">PRICE</span>
            <span className="col-span-2 min-w-[100px]">DATES</span>
            <span className="col-span-1 min-w-[50px]">IMG</span>
            <span className="col-span-1 min-w-[90px] text-center">
              <span className="hidden 2xl:inline">AVAILABILITY</span>
              <span className="hidden xl:inline 2xl:hidden">AVAILABLE</span>
              <span className="xl:hidden">AVAIL</span>
            </span>
            <span className="col-span-1 min-w-[90px] text-center">
              <span className="hidden 2xl:inline">VISIBILITY</span>
              <span className="hidden xl:inline 2xl:hidden">VISIBLE</span>
              <span className="xl:hidden">VIS</span>
            </span>
            <span className="col-span-2 min-w-[80px]">ACTIONS</span>
          </div>

          {/* Table Content */}
          <div className="max-h-[600px] overflow-y-auto" style={{ background: '#FFFFFF' }}>
            {selectedMenuId === 'ALL' && !useMenuUIStore.getState().mergeMode ? (
              <div
                className="brutal-body flex h-64 flex-col items-center justify-center p-8 text-center"
                style={{ fontSize: '0.875rem', minWidth: '1000px' }}
              >
                <h3 className="brutal-heading mb-2 text-lg">SELECT A MENU TO EDIT</h3>
                <p className="text-gray-600">
                  Please select a specific menu from the dropdown above to manage items.
                  <br />
                  Or click <strong>MERGE</strong> to edit multiple menus simultaneously.
                </p>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="brutal-body flex h-48 items-center justify-center" style={{ fontSize: '0.875rem', minWidth: '1000px' }}>
                NO ITEMS FOR THIS SELECTION.
              </div>
            ) : (
              <div style={{ minWidth: '1000px' }}>
                {filteredDishes.map((dish, idx) => (
                  <div key={dish._id} className="brutal-table-row grid grid-cols-12 gap-1 px-4 py-3" style={{ fontSize: '0.875rem' }}>
                    <div className="col-span-1 flex min-w-[30px] items-center gap-2">
                      <Checkbox />
                      <span className="brutal-data" style={{ fontSize: '0.75rem' }}>
                        {idx + 1}
                      </span>
                    </div>
                    <DishRow
                      dish={dish}
                      pendingImages={pendingImages}
                      selectedMenuId={selectedMenuId}
                      businessId={businessId || ''}
                      onEdit={handleOpenEditDish}
                      onUploadImage={setImageUploadDish}
                      onToggleAvailability={handleToggleAvailability}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dish Modal V2 */}
      <DishModalV2
        isOpen={isDishModalOpen}
        onClose={handleCloseDishModal}
        dish={editingDish}
        businessId={businessId || ''}
        selectedMenuId={selectedMenuId}
        allCategories={categories}
        allAddons={addons}
        allDishes={dishes} // Added this
        isMergeMode={mergeMode}
        mergedMenuIds={mergedMenuIds}
        dishesGroupedByNameKey={dishesGroupedByNameKey}
      />

      {/* Image Upload Modal */}
      {imageUploadDish && (
        <ImageUploadModal
          isOpen={!!imageUploadDish}
          onClose={() => setImageUploadDish(null)}
          entityId={imageUploadDish._id}
          existingImages={Array.isArray(imageUploadDish.images) ? imageUploadDish.images : []}
          onSave={async (images, allRemoved) => {
            if (!businessId) return;
            if (allRemoved) {
              await DraftOpsRepository.updateDishFields(imageUploadDish._id, businessId, { images: [] });
              await PendingImagesRepository.clearPendingImages(imageUploadDish._id);
              toast.success('All images removed. Changes will be pushed when you "Push Menu".');
            } else if (images.length > 0) {
              await PendingImagesRepository.savePendingImages(imageUploadDish._id, businessId, images);
              toast.success('Images saved. They will be uploaded when you push menu.');
            } else {
              toast.success('No changes to save.');
            }
            setImageUploadDish(null);
          }}
        />
      )}

      {/* Price Adjustment Modal */}
      <PriceAdjustmentModal isOpen={showPriceAdjustment} onClose={() => setShowPriceAdjustment(false)} businessId={businessId || ''} />

      {/* Availability/Visibility Modal */}
      <AvailabilityVisibilityModal
        isOpen={showAvailabilityVisibility}
        onClose={() => setShowAvailabilityVisibility(false)}
        businessId={businessId || ''}
      />

      {/* Bulk Image Upload Modal */}
      {showBulkUpload && (
        <BulkImageUploadModal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          dishes={dishes}
          menus={menus}
          businessId={businessId || ''}
          onSave={async (assignments) => {
            if (!businessId) return;

            let totalImages = 0;
            const syncedMenus = new Set<string>();
            const uniqueImageSets = new Map<string, Array<{ preview: string; file: File }>>(); // nameKey -> images

            for (const { nameKey, images } of assignments.values()) {
              if (images.length > 0) {
                uniqueImageSets.set(nameKey, images);
                totalImages += images.length;
              }
            }

            for (const { nameKey, dishIds, images } of assignments.values()) {
              if (images.length > 0) {
                for (const dishId of dishIds) {
                  await PendingImagesRepository.savePendingImages(dishId, businessId, images);

                  const dish = dishes.find((d) => d._id === dishId);
                  if (dish?.menuId) {
                    syncedMenus.add(dish.menuId);
                  }
                }
              }
            }

            const menuCount = syncedMenus.size;
            const dishCount = assignments.size;

            toast.success(
              `Saved ${totalImages} image${totalImages !== 1 ? 's' : ''} across ${dishCount} dish${dishCount !== 1 ? 'es' : ''} ` +
                `(${menuCount} menu${menuCount !== 1 ? 's' : ''}). They will be uploaded when you push menu.`,
            );
            setShowBulkUpload(false);
          }}
        />
      )}
    </div>
  );
};
