/**
 * DishEditModal Component
 *
 * Reusable modal for editing dish details (availability, visibility, price, portions).
 * Supports both single dish and bulk update modes.
 */

import PopUp from '@/components/atom/popUp';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { memo, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { DraftOpsRepository } from '../../db/DraftOpsRepository';
import '../../styles/brutalist.css';
import type { DishEditModalProps, DishUpdatePayload, Portion } from '../../types';

export const DishEditModal = memo(function DishEditModal({ dish, isOpen, onClose, businessId, dishesGroupedByNameKey }: DishEditModalProps) {
  const [availability, setAvailability] = useState(dish?.availability ?? true);
  const [visibility, setVisibility] = useState(dish?.visibility ?? true);
  const [price, setPrice] = useState(dish?.price ?? 0);
  const [portions, setPortions] = useState<Portion[]>(dish?.portions || []);

  const nameKey = dish?.nameKey;
  const matchingDishes = nameKey ? dishesGroupedByNameKey.get(nameKey) || [] : [];
  // Default to true if multiple dishes exist (Merge Mode)
  const [applyToMerged, setApplyToMerged] = useState(matchingDishes.length > 1);

  useEffect(() => {
    if (dish) {
      setAvailability(dish.availability ?? true);
      setVisibility(dish.visibility ?? true);
      setPrice(dish.price ?? 0);
      setPortions(dish.portions || []);
      // Reset toggle when dish changes
      const matches = dish.nameKey ? dishesGroupedByNameKey.get(dish.nameKey) || [] : [];
      setApplyToMerged(matches.length > 1);
    }
  }, [dish, dishesGroupedByNameKey]);

  const handleSave = async () => {
    if (!dish) return;
    try {
      const updates: DishUpdatePayload = { availability, visibility };
      if (!portions || portions.length === 0) {
        updates.price = price;
      }

      if (applyToMerged && matchingDishes.length > 1 && nameKey) {
        // Apply to all matched dishes
        if (!portions || portions.length === 0) {
          // For simple fields (no portions), we can update by nameKey efficiently if needed,
          // but since we have IDs, looping is safer/granular.
          // Actually, matchingDishes contains specific menu instances.
          for (const d of matchingDishes) {
            await DraftOpsRepository.updateDishFields(d._id, businessId, updates);
          }
        } else {
          // Update fields + portions
          for (const d of matchingDishes) {
            await DraftOpsRepository.updateDishFields(d._id, businessId, updates);
            await DraftOpsRepository.updateDishPortions(d._id, businessId, portions);
          }
        }
        toast.success(`Updated ${matchingDishes.length} dishes across merged menus`);
      } else {
        // Apply to single dish
        await DraftOpsRepository.updateDishFields(dish._id, businessId, updates);
        if (portions && portions.length > 0) {
          await DraftOpsRepository.updateDishPortions(dish._id, businessId, portions);
        }
        toast.success('Dish updated successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to update dish');
    }
  };

  const handlePortionChange = (index: number, field: keyof Portion, value: string | number) => {
    const updated = [...portions];
    updated[index] = { ...updated[index], [field]: value };
    setPortions(updated);
  };

  if (!dish) return null;

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
            EDIT DISH: {dish.name.toUpperCase()}
          </h2>
          <p className="brutal-body mb-6" style={{ fontSize: '0.875rem' }}>
            UPDATE AVAILABILITY, VISIBILITY, PRICE, AND PORTIONS
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                AVAILABILITY
              </Label>
              <div className="flex items-center gap-2">
                <Checkbox checked={availability} onCheckedChange={(v) => setAvailability(Boolean(v))} />
                <span className="brutal-body">{availability ? 'AVAILABLE' : 'UNAVAILABLE'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                VISIBILITY
              </Label>
              <div className="flex items-center gap-2">
                <Checkbox checked={visibility} onCheckedChange={(v) => setVisibility(Boolean(v))} />
                <span className="brutal-body">{visibility ? 'VISIBLE' : 'HIDDEN'}</span>
              </div>
            </div>

            {(!portions || portions.length === 0) && (
              <div className="space-y-2">
                <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                  PRICE (₹)
                </Label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number.parseFloat(e.target.value) || 0)}
                  className="brutal-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                />
              </div>
            )}

            {portions && portions.length > 0 && (
              <div className="space-y-2">
                <Label className="brutal-heading" style={{ fontSize: '0.875rem' }}>
                  PORTIONS
                </Label>
                <div className="brutal-card space-y-3" style={{ padding: '16px' }}>
                  {portions.map((portion, idx) => (
                    <div key={portion._id || idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={portion.name || ''}
                        onChange={(e) => handlePortionChange(idx, 'name', e.target.value)}
                        placeholder="PORTION NAME"
                        className="brutal-input flex-1"
                        style={{ padding: '8px 12px', fontSize: '0.875rem' }}
                      />
                      <input
                        type="number"
                        value={portion.price || 0}
                        onChange={(e) => handlePortionChange(idx, 'price', Number.parseFloat(e.target.value) || 0)}
                        placeholder="PRICE"
                        className="brutal-input"
                        style={{ width: '128px', padding: '8px 12px', fontSize: '0.875rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchingDishes.length > 1 && (
              <div className="mt-4 rounded-md border-2 border-black bg-yellow-50 p-3">
                <div className="flex items-center gap-3">
                  <Checkbox id="applyMerged" checked={applyToMerged} onCheckedChange={(v) => setApplyToMerged(Boolean(v))} />
                  <label htmlFor="applyMerged" className="brutal-heading cursor-pointer text-sm">
                    APPLY TO MERGED MENUS ({matchingDishes.length})
                  </label>
                </div>
                <p className="mt-1 pl-7 text-xs text-gray-600">If checked, changes will apply to all matching items in the merged view.</p>
              </div>
            )}

            <div className="flex gap-3 pb-8 pt-4">
              <button type="button" onClick={handleSave} className="brutal-button-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                {applyToMerged && matchingDishes.length > 1 ? 'SAVE ALL' : 'SAVE'}
              </button>
              <button type="button" onClick={onClose} className="brutal-button" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </section>
    </PopUp>
  );
});
