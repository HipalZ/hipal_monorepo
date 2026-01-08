/**
 * ChangesReviewModal
 *
 * Displays all pending changes (draftOps + pendingImages) and allows
 * discarding individual or all changes with proper revert logic.
 */

import { Button } from '@/components/ui/button';
import { useLiveQuery } from 'dexie-react-hooks';
import { Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { DishZoneKitchenRepository } from '../db/DishZoneKitchenRepository';
import { DraftOpsRepository } from '../db/DraftOpsRepository';
import { db } from '../db/menu.database';
import { ZonesRepository } from '../db/ZonesRepository';
import type { IDraftOp, IPendingImage } from '../types';

interface ChangesReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

interface ChangeItem {
  id: string;
  type: 'DRAFT_OP' | 'PENDING_IMAGE';
  entityType: 'DISH' | 'CATEGORY' | 'ADDON' | 'IMAGE' | 'ZONE_KITCHENS' | 'DISH_ZONE_KITCHEN';
  entityId: string;
  name: string;
  summary: string;
  draftOp?: IDraftOp;
  pendingImage?: IPendingImage;
}

export const ChangesReviewModal = ({ isOpen, onClose, businessId }: ChangesReviewModalProps) => {
  const [isDiscarding, setIsDiscarding] = useState<string | null>(null);
  const [showDiscardAllConfirm, setShowDiscardAllConfirm] = useState(false);

  // Fetch all draftOps
  const draftOps = useLiveQuery(() => db.draftOps.where({ businessId }).toArray(), [businessId]) || [];

  // Fetch all pendingImages
  const pendingImages = useLiveQuery(() => db.pendingImages.where({ businessId }).toArray(), [businessId]) || [];

  // Fetch dishes for name resolution
  const allDishes = useLiveQuery(() => db.dishes.where({ businessId }).toArray(), [businessId]) || [];
  const allCategories = useLiveQuery(() => db.categories.where({ businessId }).toArray(), [businessId]) || [];
  const allAddons = useLiveQuery(() => db.addons.where({ businessId }).toArray(), [businessId]) || [];
  const allKitchens = useLiveQuery(() => db.kitchens.where({ businessId }).toArray(), [businessId]) || [];

  // Fetch zones for name resolution
  const allZones =
    useLiveQuery(async () => {
      return await ZonesRepository.getAll(businessId);
    }, [businessId]) || [];

  // Build change items list
  const changeItems = useMemo<ChangeItem[]>(() => {
    const items: ChangeItem[] = [];

    // Add draftOps
    for (const op of draftOps) {
      let name = 'Unknown';
      let summary = '';

      if (op.entity === 'DISH') {
        const dish = allDishes.find((d) => d._id === op.entityId);
        name = dish?.name || op.entityId;
        if (op.opType === 'CREATE') {
          summary = 'NEW DISH';
        } else if (op.opType === 'UPDATE') {
          const changes: string[] = [];
          if (op.payload.price !== undefined) {
            const beforePrice = (op.before as any)?.price;
            if (beforePrice !== undefined) {
              changes.push(`PRICE: ₹${beforePrice} → ₹${op.payload.price}`);
            } else {
              changes.push(`PRICE: ₹${op.payload.price}`);
            }
          }
          if (op.payload.visibility !== undefined) {
            const before = (op.before as any)?.visibility;
            changes.push(`VISIBILITY: ${before ? 'ON' : 'OFF'} → ${op.payload.visibility ? 'ON' : 'OFF'}`);
          }
          if (op.payload.availability !== undefined) {
            const before = (op.before as any)?.availability;
            changes.push(`AVAILABILITY: ${before ? 'ON' : 'OFF'} → ${op.payload.availability ? 'ON' : 'OFF'}`);
          }
          summary = changes.length > 0 ? changes.join(', ') : 'UPDATED';
        } else {
          summary = 'DELETE';
        }
      } else if (op.entity === 'CATEGORY') {
        const cat = allCategories.find((c) => c._id === op.entityId);
        name = cat?.name || op.entityId;
        summary = op.opType === 'CREATE' ? 'NEW CATEGORY' : op.opType === 'UPDATE' ? 'UPDATED' : 'DELETE';
      } else if (op.entity === 'ADDON') {
        const addon = allAddons.find((a) => a._id === op.entityId);
        name = addon?.name || op.entityId;
        summary = op.opType === 'CREATE' ? 'NEW ADDON' : op.opType === 'UPDATE' ? 'UPDATED' : 'DELETE';
      } else if (op.entity === 'ZONE_KITCHENS') {
        // Zone kitchen linking
        const zone = allZones.find((z) => z._id === op.entityId);
        name = zone?.name || op.entityId;
        const payload = op.payload as { kitchenIds?: string[] };
        const kitchenCount = payload.kitchenIds?.length || 0;
        const kitchenNames =
          payload.kitchenIds
            ?.map((kitchenId) => allKitchens.find((k) => k._id === kitchenId)?.name)
            .filter(Boolean)
            .slice(0, 3) || [];
        summary = `LINK ${kitchenCount} KITCHEN${kitchenCount !== 1 ? 'S' : ''}${kitchenNames.length > 0 ? `: ${kitchenNames.join(', ')}${kitchenCount > 3 ? '...' : ''}` : ''}`;
      } else if (op.entity === 'DISH_ZONE_KITCHEN') {
        // Dish routing to kitchen for zone
        const payload = op.payload as { dishId?: string; zoneId?: string; kitchenId?: string };
        const dish = allDishes.find((d) => d._id === payload.dishId);
        const zone = allZones.find((z) => z._id === payload.zoneId);
        const kitchen = allKitchens.find((k) => k._id === payload.kitchenId);
        name = dish?.name || payload.dishId || 'Unknown Dish';
        summary = `ROUTE TO: ${kitchen?.name || payload.kitchenId || 'Unknown Kitchen'} (Zone: ${zone?.name || payload.zoneId || 'Unknown'})`;
      }

      items.push({
        id: `op-${op.id}`,
        type: 'DRAFT_OP',
        entityType: op.entity as ChangeItem['entityType'],
        entityId: op.entityId,
        name,
        summary,
        draftOp: op,
      });
    }

    // Add pendingImages
    const imagesByDish = new Map<string, IPendingImage[]>();
    for (const img of pendingImages) {
      const existing = imagesByDish.get(img.dishId) || [];
      existing.push(img);
      imagesByDish.set(img.dishId, existing);
    }

    for (const [dishId, images] of imagesByDish.entries()) {
      const dish = allDishes.find((d) => d._id === dishId);
      const dishName = dish?.name || 'Unknown Dish';
      items.push({
        id: `img-${dishId}`,
        type: 'PENDING_IMAGE',
        entityType: 'IMAGE',
        entityId: dishId,
        name: dishName,
        summary: `IMAGES: +${images.length} pending`,
        pendingImage: images[0], // Store first for reference
      });
    }

    return items;
  }, [draftOps, pendingImages, allDishes, allCategories, allAddons, allKitchens, allZones]);

  // Discard single change
  const handleDiscard = async (item: ChangeItem) => {
    if (isDiscarding) return;
    setIsDiscarding(item.id);

    try {
      if (item.type === 'DRAFT_OP' && item.draftOp) {
        const op = item.draftOp;

        // Handle zone and dish routing ops
        if (op.entity === 'ZONE_KITCHENS') {
          // Revert zone kitchenIds if before snapshot exists
          await db.transaction('rw', db.zones, db.draftOps, async () => {
            if (op.before && (op.before as { kitchenIds?: string[] }).kitchenIds) {
              await ZonesRepository.updateKitchenIds(op.entityId, (op.before as { kitchenIds: string[] }).kitchenIds || []);
            } else {
              // If no before snapshot, clear kitchenIds
              await ZonesRepository.updateKitchenIds(op.entityId, []);
            }
            await DraftOpsRepository.delete(op.id!);
          });
        } else if (op.entity === 'DISH_ZONE_KITCHEN') {
          // Delete the dish-zone-kitchen mapping
          await db.transaction('rw', db.dishZoneKitchen, db.draftOps, async () => {
            const payload = op.payload as { dishId?: string; zoneId?: string };
            if (payload.dishId && payload.zoneId) {
              await DishZoneKitchenRepository.delete(payload.dishId, payload.zoneId);
            }
            await DraftOpsRepository.delete(op.id!);
          });
        } else if (op.before && op.opType === 'UPDATE') {
          // If before snapshot exists, revert entity
          await db.transaction('rw', db.dishes, db.categories, db.addons, db.draftOps, async () => {
            if (op.entity === 'DISH') {
              await db.dishes.update(op.entityId, op.before as any);
            } else if (op.entity === 'CATEGORY') {
              await db.categories.update(op.entityId, op.before as any);
            } else if (op.entity === 'ADDON') {
              await db.addons.update(op.entityId, op.before as any);
            }
            await DraftOpsRepository.delete(op.id!);
          });
        } else if (op.opType === 'CREATE') {
          // For CREATE, delete the entity
          await db.transaction('rw', db.dishes, db.categories, db.addons, db.draftOps, async () => {
            if (op.entity === 'DISH') {
              await db.dishes.delete(op.entityId);
            } else if (op.entity === 'CATEGORY') {
              await db.categories.delete(op.entityId);
            } else if (op.entity === 'ADDON') {
              await db.addons.delete(op.entityId);
            }
            await DraftOpsRepository.delete(op.id!);
          });
        } else {
          // DELETE op - just remove the draftOp
          await DraftOpsRepository.delete(op.id!);
        }

        toast.success('Change discarded');
      } else if (item.type === 'PENDING_IMAGE' && item.entityId) {
        // Discard pending images for dish
        await db.transaction('rw', db.pendingImages, db.dishes, async () => {
          // Delete all pending images for this dish
          await db.pendingImages.where({ dishId: item.entityId }).delete();
        });

        toast.success('Pending images discarded');
      }
    } catch (error: any) {
      console.error('Failed to discard change:', error);
      toast.error('Failed to discard change');
    } finally {
      setIsDiscarding(null);
    }
  };

  // Discard all changes
  const handleDiscardAll = async () => {
    if (!showDiscardAllConfirm) {
      setShowDiscardAllConfirm(true);
      return;
    }

    setIsDiscarding('all');

    try {
      await db.transaction('rw', [db.dishes, db.categories, db.addons, db.zones, db.dishZoneKitchen, db.draftOps, db.pendingImages], async () => {
        // Group ops by entityId for proper revert
        const opsByEntity = new Map<string, IDraftOp[]>();

        for (const op of draftOps) {
          const key = `${op.entity}-${op.entityId}`;
          const existing = opsByEntity.get(key) || [];
          existing.push(op);
          opsByEntity.set(key, existing);
        }

        // Revert each entity to baseline
        for (const [key, ops] of opsByEntity.entries()) {
          const sortedOps = ops.sort((a, b) => a.createdAt - b.createdAt);
          const firstOp = sortedOps[0];

          // Revert to before state of first op, or delete if CREATE
          if (firstOp.opType === 'CREATE') {
            if (firstOp.entity === 'DISH') {
              await db.dishes.delete(firstOp.entityId);
            } else if (firstOp.entity === 'CATEGORY') {
              await db.categories.delete(firstOp.entityId);
            } else if (firstOp.entity === 'ADDON') {
              await db.addons.delete(firstOp.entityId);
            }
          } else if (firstOp.before) {
            if (firstOp.entity === 'DISH') {
              await db.dishes.update(firstOp.entityId, firstOp.before as any);
            } else if (firstOp.entity === 'CATEGORY') {
              await db.categories.update(firstOp.entityId, firstOp.before as any);
            } else if (firstOp.entity === 'ADDON') {
              await db.addons.update(firstOp.entityId, firstOp.before as any);
            } else if (firstOp.entity === 'ZONE_KITCHENS') {
              // Revert zone kitchenIds
              const beforeKitchenIds = (firstOp.before as { kitchenIds?: string[] }).kitchenIds || [];
              await ZonesRepository.updateKitchenIds(firstOp.entityId, beforeKitchenIds);
            }
          } else if (firstOp.entity === 'ZONE_KITCHENS') {
            // If no before snapshot, clear kitchenIds
            await ZonesRepository.updateKitchenIds(firstOp.entityId, []);
          } else if (firstOp.entity === 'DISH_ZONE_KITCHEN') {
            // Delete dish routing mapping
            const payload = firstOp.payload as { dishId?: string; zoneId?: string };
            if (payload.dishId && payload.zoneId) {
              await DishZoneKitchenRepository.delete(payload.dishId, payload.zoneId);
            }
          }
        }

        // Clear all draftOps
        await db.draftOps.where({ businessId }).delete();

        // Clear all pendingImages
        await db.pendingImages.where({ businessId }).delete();
      });

      toast.success('All local changes discarded');
      setShowDiscardAllConfirm(false);
      onClose();
    } catch (error: any) {
      console.error('Failed to discard all changes:', error);
      toast.error('Failed to discard all changes');
    } finally {
      setIsDiscarding(null);
    }
  };

  if (!isOpen) return null;

  const draftOpsCount = draftOps.length;
  const pendingImagesCount = pendingImages.length;
  const totalCount = draftOpsCount + pendingImagesCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="brutal-card max-h-[90vh] w-full max-w-4xl bg-white p-6" style={{ borderWidth: '3px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b-4 border-black pb-4">
          <h2 className="brutal-heading text-2xl">VIEW CHANGES</h2>
          <button
            onClick={onClose}
            className="brutal-button flex h-10 w-10 items-center justify-center bg-white p-0"
            style={{ width: '40px', height: '40px' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="brutal-card bg-yellow-100 p-4 text-center">
            <div className="text-3xl font-bold">{draftOpsCount}</div>
            <div className="text-sm font-bold">DRAFT OPS</div>
          </div>
          <div className="brutal-card bg-yellow-100 p-4 text-center">
            <div className="text-3xl font-bold">{pendingImagesCount}</div>
            <div className="text-sm font-bold">PENDING IMAGES</div>
          </div>
          <div className="brutal-card bg-yellow-300 p-4 text-center">
            <div className="text-3xl font-bold">{totalCount}</div>
            <div className="text-sm font-bold">TOTAL</div>
          </div>
        </div>

        {/* Changes List */}
        <div className="mb-6 max-h-[50vh] overflow-y-auto">
          {changeItems.length === 0 ? (
            <div className="brutal-card bg-gray-100 p-8 text-center">
              <p className="text-lg font-bold">NO PENDING CHANGES</p>
            </div>
          ) : (
            <div className="space-y-2">
              {changeItems.map((item) => (
                <div key={item.id} className="brutal-card flex items-center justify-between bg-white p-4">
                  <div className="flex-1">
                    <div className="font-bold">
                      {item.entityType === 'ZONE_KITCHENS' ? 'ZONE' : item.entityType === 'DISH_ZONE_KITCHEN' ? 'DISH ROUTING' : item.entityType}:{' '}
                      <span className="uppercase">{item.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">{item.summary}</div>
                  </div>
                  <button
                    onClick={() => handleDiscard(item)}
                    disabled={isDiscarding === item.id}
                    className="brutal-button ml-4 flex h-9 w-9 items-center justify-center bg-white p-0 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 border-t-4 border-black pt-4">
          {showDiscardAllConfirm && (
            <div className="mr-auto rounded-lg bg-red-100 p-3">
              <p className="text-sm font-bold text-red-800">This will remove all local edits and pending images. Continue?</p>
            </div>
          )}
          <Button
            onClick={() => {
              setShowDiscardAllConfirm(false);
              onClose();
            }}
            className="brutal-button bg-white"
            variant="outline"
          >
            CLOSE
          </Button>
          <Button
            onClick={handleDiscardAll}
            disabled={totalCount === 0 || isDiscarding === 'all'}
            className="brutal-button bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            variant="destructive"
          >
            {showDiscardAllConfirm ? 'CONFIRM DISCARD ALL' : 'DISCARD ALL'}
          </Button>
        </div>
      </div>
    </div>
  );
};
