/**
 * PriceAdjustmentModal Component
 *
 * Modal for increasing or decreasing dish prices and portion prices
 * by rupees or percentage, with category or dish selection.
 */

import PopUp from '@/components/atom/popUp';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DraftOpsRepository } from '../../db/DraftOpsRepository';
import { db } from '../../db/menu.database';
import { useMenuViewData } from '../../hooks/useMenuViewData';
import '../../styles/brutalist.css';
import type { MenuDish } from '../../types';

interface PriceAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export const PriceAdjustmentModal = memo(function PriceAdjustmentModal({ isOpen, onClose, businessId }: PriceAdjustmentModalProps) {
  const { dishes, categories, dishesByCategoryId } = useMenuViewData({ businessId });
  const [mode, setMode] = useState<'rupees' | 'percentage'>('rupees');
  const [operation, setOperation] = useState<'increase' | 'decrease'>('increase');
  const [value, setValue] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<'category' | 'dish'>('category');

  // Get available categories with dish counts
  const availableCategories = useMemo(() => {
    return categories.filter((cat) => {
      const dishCount = dishesByCategoryId.get(cat._id || '')?.length || 0;
      return dishCount > 0;
    });
  }, [categories, dishesByCategoryId]);

  // Get available dishes
  const availableDishes = useMemo(() => {
    return dishes;
  }, [dishes]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleDish = (dishId: string) => {
    setSelectedDishes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dishId)) {
        newSet.delete(dishId);
      } else {
        newSet.add(dishId);
      }
      return newSet;
    });
  };

  const calculateNewPrice = (currentPrice: number): number => {
    const numValue = Number.parseFloat(value);
    if (Number.isNaN(numValue) || numValue < 0) return currentPrice;

    let newPrice: number;
    if (mode === 'rupees') {
      newPrice = operation === 'increase' ? currentPrice + numValue : Math.max(0, currentPrice - numValue);
    } else {
      // percentage
      const multiplier = operation === 'increase' ? 1 + numValue / 100 : 1 - numValue / 100;
      newPrice = Math.max(0, currentPrice * multiplier);
    }
    // Round to 2 decimal places for currency
    return Math.round(newPrice * 100) / 100;
  };

  const handleApply = async () => {
    if (!value || Number.parseFloat(value) <= 0) {
      toast.error('Please enter a valid value');
      return;
    }

    if (selectionMode === 'category' && selectedCategories.size === 0) {
      toast.error('Please select at least one category');
      return;
    }

    if (selectionMode === 'dish' && selectedDishes.size === 0) {
      toast.error('Please select at least one dish');
      return;
    }

    try {
      let updatedCount = 0;

      await db.transaction('rw', db.dishes, db.draftOps, async () => {
        const dishesToUpdate: MenuDish[] = [];

        if (selectionMode === 'category') {
          // Get all dishes from selected categories
          for (const categoryId of selectedCategories) {
            const categoryDishes = dishesByCategoryId.get(categoryId) || [];
            dishesToUpdate.push(...categoryDishes);
          }
        } else {
          // Get selected dishes
          for (const dishId of selectedDishes) {
            const dish = dishes.find((d) => d._id === dishId);
            if (dish) dishesToUpdate.push(dish);
          }
        }

        // Remove duplicates by _id
        const uniqueDishes = Array.from(new Map(dishesToUpdate.map((d) => [d._id, d])).values());

        for (const dish of uniqueDishes) {
          const updates: Record<string, unknown> = {};

          // Update dish price if it exists
          if (dish.price !== undefined && dish.price !== null) {
            const newPrice = calculateNewPrice(dish.price);
            updates.price = newPrice;
          }

          // Update portion prices if portions exist
          if (dish.portions && dish.portions.length > 0) {
            const updatedPortions = dish.portions.map((portion) => {
              const cleaned: typeof portion = {
                name: portion.name || '',
                price: calculateNewPrice(portion.price || 0),
              };
              // Only include valid fields
              const portionId = portion._id?.toString() || '';
              if (portionId && !portionId.startsWith('temp-')) {
                cleaned._id = portionId;
              }
              if (portion.portionTypes) {
                cleaned.portionTypes = portion.portionTypes;
              }
              if (portion.default !== undefined) {
                cleaned.default = portion.default;
              }
              return cleaned;
            });
            updates.portions = updatedPortions;
          }

          if (Object.keys(updates).length > 0) {
            await db.dishes.update(dish._id, updates);
            await DraftOpsRepository.addDraftOp({
              businessId,
              entity: 'DISH',
              entityId: dish._id,
              opType: 'UPDATE',
              payload: updates,
            });
            updatedCount++;
          }
        }
      });

      toast.success(`Updated prices for ${updatedCount} dish${updatedCount !== 1 ? 'es' : ''}. Changes will be pushed when you "Push Menu".`);
      onClose();
      // Reset form
      setValue('');
      setSelectedCategories(new Set());
      setSelectedDishes(new Set());
    } catch (error) {
      console.error('Price adjustment error:', error);
      toast.error('Failed to update prices');
    }
  };

  return (
    <PopUp height="h-[90dvh]" width="full max-w-[90vw]" show={isOpen} onClose={onClose} rightTopBack hide>
      <div className="space-y-6" style={{ padding: '24px' }}>
        {/* Mode Selection: Rupees or Percentage */}
        <div>
          <Label className="brutal-body mb-3 block" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            ADJUSTMENT TYPE
          </Label>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'rupees' | 'percentage')}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="rupees" id="rupees" />
                <Label htmlFor="rupees" className="brutal-body cursor-pointer" style={{ fontSize: '0.875rem' }}>
                  RUPEES (₹)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="brutal-body cursor-pointer" style={{ fontSize: '0.875rem' }}>
                  PERCENTAGE (%)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Operation: Increase or Decrease */}
        <div>
          <Label className="brutal-body mb-3 block" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            OPERATION
          </Label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setOperation('increase')}
              className={`brutal-button ${operation === 'increase' ? 'brutal-active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              INCREASE
            </button>
            <button
              type="button"
              onClick={() => setOperation('decrease')}
              className={`brutal-button ${operation === 'decrease' ? 'brutal-active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              DECREASE
            </button>
          </div>
        </div>

        {/* Value Input */}
        <div>
          <Label className="brutal-body mb-2 block" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            {mode === 'rupees' ? 'AMOUNT (₹)' : 'PERCENTAGE (%)'}
          </Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="brutal-input"
            style={{ padding: '8px 12px', fontSize: '0.875rem' }}
            placeholder={mode === 'rupees' ? 'Enter amount' : 'Enter percentage'}
            min="0"
            step={mode === 'rupees' ? '0.01' : '0.1'}
          />
        </div>

        {/* Selection Mode: Category or Dish */}
        <div>
          <Label className="brutal-body mb-3 block" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            SELECT BY
          </Label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setSelectionMode('category');
                setSelectedDishes(new Set());
              }}
              className={`brutal-button ${selectionMode === 'category' ? 'brutal-active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              CATEGORY
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectionMode('dish');
                setSelectedCategories(new Set());
              }}
              className={`brutal-button ${selectionMode === 'dish' ? 'brutal-active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              DISH
            </button>
          </div>
        </div>

        {/* Selection List */}
        <div style={{ borderTop: '2px solid #000000', paddingTop: '16px' }}>
          <div className="mb-3 flex items-center justify-between">
            <Label className="brutal-body block" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
              {selectionMode === 'category' ? 'SELECT CATEGORIES' : 'SELECT DISHES'}
            </Label>
            <button
              type="button"
              onClick={() => {
                if (selectionMode === 'category') {
                  const allCategoryIds = new Set(availableCategories.map((cat) => cat._id || '').filter(Boolean));
                  if (selectedCategories.size === allCategoryIds.size && allCategoryIds.size > 0) {
                    setSelectedCategories(new Set());
                  } else {
                    setSelectedCategories(allCategoryIds);
                  }
                } else {
                  const allDishIds = new Set(availableDishes.map((dish) => dish._id || '').filter(Boolean));
                  if (selectedDishes.size === allDishIds.size && allDishIds.size > 0) {
                    setSelectedDishes(new Set());
                  } else {
                    setSelectedDishes(allDishIds);
                  }
                }
              }}
              className="brutal-button"
              style={{ padding: '4px 12px', fontSize: '0.75rem' }}
            >
              {selectionMode === 'category'
                ? selectedCategories.size === availableCategories.length && availableCategories.length > 0
                  ? 'DESELECT ALL'
                  : 'SELECT ALL'
                : selectedDishes.size === availableDishes.length && availableDishes.length > 0
                  ? 'DESELECT ALL'
                  : 'SELECT ALL'}
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto" style={{ border: '2px solid #000000' }}>
            {selectionMode === 'category' ? (
              availableCategories.length > 0 ? (
                availableCategories.map((cat) => {
                  const isSelected = selectedCategories.has(cat._id || '');
                  const dishCount = dishesByCategoryId.get(cat._id || '')?.length || 0;
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => toggleCategory(cat._id || '')}
                      className={`brutal-body flex w-full items-center justify-between px-4 py-2 text-left ${isSelected ? 'brutal-active' : ''}`}
                      style={{
                        borderBottom: '1px solid #000000',
                        fontSize: '0.875rem',
                        background: isSelected ? '#FFEB3B' : 'transparent',
                        fontWeight: isSelected ? 900 : 600,
                      }}
                    >
                      <span className="truncate" style={{ textTransform: 'uppercase' }}>
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="brutal-badge">{dishCount}</span>
                        {isSelected && <Check size={16} />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="brutal-body p-4 text-center" style={{ fontSize: '0.875rem', color: '#666' }}>
                  NO CATEGORIES WITH DISHES
                </div>
              )
            ) : availableDishes.length > 0 ? (
              availableDishes.map((dish) => {
                const isSelected = selectedDishes.has(dish._id || '');
                return (
                  <button
                    key={dish._id}
                    type="button"
                    onClick={() => toggleDish(dish._id || '')}
                    className={`brutal-body flex w-full items-center justify-between px-4 py-2 text-left ${isSelected ? 'brutal-active' : ''}`}
                    style={{
                      borderBottom: '1px solid #000000',
                      fontSize: '0.875rem',
                      background: isSelected ? '#FFEB3B' : 'transparent',
                      fontWeight: isSelected ? 900 : 600,
                    }}
                  >
                    <span className="truncate">{dish.name}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })
            ) : (
              <div className="brutal-body p-4 text-center" style={{ fontSize: '0.875rem', color: '#666' }}>
                NO DISHES AVAILABLE
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3" style={{ borderTop: '2px solid #000000', paddingTop: '16px' }}>
          <button type="button" onClick={onClose} className="brutal-button" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            CANCEL
          </button>
          <button type="button" onClick={handleApply} className="brutal-button-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            APPLY
          </button>
        </div>
      </div>
    </PopUp>
  );
});
