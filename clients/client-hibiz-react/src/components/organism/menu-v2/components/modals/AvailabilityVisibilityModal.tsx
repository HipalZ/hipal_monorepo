/**
 * AvailabilityVisibilityModal Component
 *
 * Modal for closing/opening dishes by category or dish type.
 * Users can select categories or dish types and set availability/visibility to false (close) or true (open).
 */

import PopUp from '@/components/atom/popUp';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Search, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DraftOpsRepository } from '../../db/DraftOpsRepository';
import { db } from '../../db/menu.database';
import { useMenuViewData } from '../../hooks/useMenuViewData';
import '../../styles/brutalist.css';
import type { MenuDish } from '../../types';

interface AvailabilityVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export const AvailabilityVisibilityModal = memo(function AvailabilityVisibilityModal({
  isOpen,
  onClose,
  businessId,
}: AvailabilityVisibilityModalProps) {
  const { dishes, categories, dishesByCategoryId } = useMenuViewData({ businessId });
  const [closeBy, setCloseBy] = useState<'category' | 'dishType' | 'item'>('category');
  const [action, setAction] = useState<'close' | 'open'>('close');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedDishTypes, setSelectedDishTypes] = useState<Set<string>>(new Set());
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Get available categories with dish counts
  const availableCategories = useMemo(() => {
    return categories.filter((cat) => {
      const dishCount = dishesByCategoryId.get(cat._id || '')?.length || 0;
      return dishCount > 0;
    });
  }, [categories, dishesByCategoryId]);

  // Get unique dish types from all dishes
  const availableDishTypes = useMemo(() => {
    const dishTypeSet = new Set<string>();
    for (const dish of dishes) {
      if (dish.dishTypes && Array.isArray(dish.dishTypes)) {
        for (const dt of dish.dishTypes) {
          if (dt && typeof dt === 'string') {
            dishTypeSet.add(dt);
          }
        }
      }
    }
    return Array.from(dishTypeSet).sort();
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

  const toggleDishType = (dishType: string) => {
    setSelectedDishTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dishType)) {
        newSet.delete(dishType);
      } else {
        newSet.add(dishType);
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

  // Filter dishes by search query when item wise is selected
  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    const q = searchQuery.toLowerCase();
    return dishes.filter((dish) => dish.name?.toLowerCase().includes(q));
  }, [dishes, searchQuery]);

  const handleApply = async () => {
    if (closeBy === 'category' && selectedCategories.size === 0) {
      toast.error('Please select at least one category');
      return;
    }

    if (closeBy === 'dishType' && selectedDishTypes.size === 0) {
      toast.error('Please select at least one dish type');
      return;
    }

    if (closeBy === 'item' && selectedDishes.size === 0) {
      toast.error('Please select at least one dish');
      return;
    }

    try {
      let updatedCount = 0;
      const value = action !== 'close';

      await db.transaction('rw', db.dishes, db.draftOps, async () => {
        const dishesToUpdate: MenuDish[] = [];

        if (closeBy === 'category') {
          // Get all dishes from selected categories
          for (const categoryId of selectedCategories) {
            const categoryDishes = dishesByCategoryId.get(categoryId) || [];
            dishesToUpdate.push(...categoryDishes);
          }
        } else if (closeBy === 'dishType') {
          // Get all dishes with selected dish types
          for (const dish of dishes) {
            if (dish.dishTypes && Array.isArray(dish.dishTypes)) {
              const hasSelectedType = dish.dishTypes.some((dt) => selectedDishTypes.has(dt));
              if (hasSelectedType) {
                dishesToUpdate.push(dish);
              }
            }
          }
        } else {
          // Get selected dishes by ID
          for (const dishId of selectedDishes) {
            const dish = dishes.find((d) => d._id === dishId);
            if (dish) {
              dishesToUpdate.push(dish);
            }
          }
        }

        // Remove duplicates by _id
        const uniqueDishes = Array.from(new Map(dishesToUpdate.map((d) => [d._id, d])).values());

        for (const dish of uniqueDishes) {
          const updates = {
            availability: value,
            visibility: value,
          };

          await db.dishes.update(dish._id, {
            availability: value,
            visibility: value,
          });
          await DraftOpsRepository.addDraftOp({
            businessId,
            entity: 'DISH',
            entityId: dish._id,
            opType: 'UPDATE',
            payload: updates,
          });
          updatedCount++;
        }
      });

      toast.success(
        `${action === 'close' ? 'Closed' : 'Opened'} ${updatedCount} dish${updatedCount !== 1 ? 'es' : ''}. Changes will be pushed when you "Push Menu".`,
      );
      onClose();
      // Reset form
      setSelectedCategories(new Set());
      setSelectedDishTypes(new Set());
      setSelectedDishes(new Set());
      setSearchQuery('');
    } catch (error) {
      console.error('Availability/Visibility update error:', error);
      toast.error('Failed to update dishes');
    }
  };

  return (
    <PopUp show={isOpen} onClose={onClose} hide>
      <div className="space-y-6" style={{ padding: '24px' }}>
        {/* Modal Title */}
        <div className="mb-4">
          <h2 className="brutal-heading" style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111111' }}>
            AVAILABILITY/VISIBILITY
          </h2>
        </div>

        {/* Action Selection: Close or Open */}
        <div>
          <Label className="brutal-body mb-3 block" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            ACTION
          </Label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setAction('close')}
              className={`brutal-button ${action === 'close' ? 'brutal-active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              CLOSE
            </button>
            <button
              type="button"
              onClick={() => setAction('open')}
              className={`brutal-button ${action === 'open' ? 'brutal-active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              OPEN
            </button>
          </div>
        </div>

        {/* Close By Selection: Category or Dish Type */}
        <div>
          <Label className="brutal-body mb-3 block" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            CLOSE BY
          </Label>
          <RadioGroup value={closeBy} onValueChange={(v) => setCloseBy(v as 'category' | 'dishType' | 'item')}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="category" id="category" />
                <Label htmlFor="category" className="brutal-body cursor-pointer" style={{ fontSize: '0.875rem' }}>
                  CATEGORY
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="dishType" id="dishType" />
                <Label htmlFor="dishType" className="brutal-body cursor-pointer" style={{ fontSize: '0.875rem' }}>
                  DISH TYPE
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="item" id="item" />
                <Label htmlFor="item" className="brutal-body cursor-pointer" style={{ fontSize: '0.875rem' }}>
                  ITEM WISE
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Selection List */}
        <div style={{ borderTop: '2px solid #000000', paddingTop: '16px' }}>
          {/* Search for items when item wise is selected */}
          {closeBy === 'item' && (
            <div className="mb-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={16}
                  style={{ color: '#3A3A3A', strokeWidth: 2, pointerEvents: 'none' }}
                />
                <Input
                  type="text"
                  placeholder="SEARCH DISHES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="brutal-input"
                  style={{
                    paddingLeft: '36px',
                    paddingRight: searchQuery ? '36px' : '12px',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      width: '20px',
                      height: '20px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#3A3A3A',
                    }}
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
            <Label className="brutal-body block" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
              {closeBy === 'category' ? 'SELECT CATEGORIES' : closeBy === 'dishType' ? 'SELECT DISH TYPES' : 'SELECT DISHES'}
            </Label>
            <button
              type="button"
              onClick={() => {
                if (closeBy === 'category') {
                  const allCategoryIds = new Set(availableCategories.map((cat) => cat._id || '').filter(Boolean));
                  if (selectedCategories.size === allCategoryIds.size && allCategoryIds.size > 0) {
                    setSelectedCategories(new Set());
                  } else {
                    setSelectedCategories(allCategoryIds);
                  }
                } else if (closeBy === 'dishType') {
                  const allDishTypes = new Set(availableDishTypes);
                  if (selectedDishTypes.size === allDishTypes.size && allDishTypes.size > 0) {
                    setSelectedDishTypes(new Set());
                  } else {
                    setSelectedDishTypes(allDishTypes);
                  }
                } else {
                  const allDishIds = new Set(filteredDishes.map((d) => d._id || '').filter(Boolean));
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
              {closeBy === 'category'
                ? selectedCategories.size === availableCategories.length && availableCategories.length > 0
                  ? 'DESELECT ALL'
                  : 'SELECT ALL'
                : closeBy === 'dishType'
                  ? selectedDishTypes.size === availableDishTypes.length && availableDishTypes.length > 0
                    ? 'DESELECT ALL'
                    : 'SELECT ALL'
                  : selectedDishes.size === filteredDishes.length && filteredDishes.length > 0
                    ? 'DESELECT ALL'
                    : 'SELECT ALL'}
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto" style={{ border: '2px solid #000000' }}>
            {closeBy === 'category' ? (
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
            ) : closeBy === 'dishType' ? (
              availableDishTypes.length > 0 ? (
                availableDishTypes.map((dishType) => {
                  const isSelected = selectedDishTypes.has(dishType);
                  // Count dishes with this dish type
                  const dishCount = dishes.filter((d) => d.dishTypes && Array.isArray(d.dishTypes) && d.dishTypes.includes(dishType)).length;
                  return (
                    <button
                      key={dishType}
                      type="button"
                      onClick={() => toggleDishType(dishType)}
                      className={`brutal-body flex w-full items-center justify-between px-4 py-2 text-left ${isSelected ? 'brutal-active' : ''}`}
                      style={{
                        borderBottom: '1px solid #000000',
                        fontSize: '0.875rem',
                        background: isSelected ? '#FFEB3B' : 'transparent',
                        fontWeight: isSelected ? 900 : 600,
                      }}
                    >
                      <span className="truncate" style={{ textTransform: 'uppercase' }}>
                        {dishType}
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
                  NO DISH TYPES AVAILABLE
                </div>
              )
            ) : filteredDishes.length > 0 ? (
              filteredDishes.map((dish) => {
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
                    <span className="truncate" style={{ textTransform: 'uppercase' }}>
                      {dish.name || 'UNNAMED'}
                    </span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })
            ) : (
              <div className="brutal-body p-4 text-center" style={{ fontSize: '0.875rem', color: '#666' }}>
                {searchQuery ? 'NO DISHES FOUND' : 'NO DISHES AVAILABLE'}
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
