/**
 * QuickMenuPanel Component
 *
 * Inline editing interface for quickly updating dish name, price, and availability
 * across all menus. Similar to Menu Manager's Quick Menu but integrated with Menu V2's
 * offline-first architecture using IndexedDB and draft operations.
 */

import LoadingSpinner from '@/components/atom/loadingSpinner';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ChevronDown, Plus, Search, Trash2, X } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DraftOpsRepository } from '../db/DraftOpsRepository';
import { db } from '../db/menu.database';
import { useMenuViewData } from '../hooks/useMenuViewData';
import { useMenuUIStore } from '../store/useMenuUIStore';
import '../styles/brutalist.css';
import type { MenuDish, Portion } from '../types';

interface EditedDish {
  _id: string;
  nameKey: string;
  name?: string;
  price?: number;
  availability?: boolean;
  portions?: Portion[];
}

export const QuickMenuPanel = memo(function QuickMenuPanel({ businessId, onBack }: { businessId: string; onBack?: () => void }) {
  const selectedMenuId = useMenuUIStore((s) => s.selectedMenuId);
  const { dishes, categories, dishesGroupedByNameKey, isLoading } = useMenuViewData({ businessId });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDishType, setSelectedDishType] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['all']));
  const [editedDishes, setEditedDishes] = useState<Map<string, EditedDish>>(new Map());
  const [duplicateDishIds, setDuplicateDishIds] = useState<Set<string>>(new Set());

  // Extract unique dish types from dishes
  const availableDishTypes = useMemo(() => {
    const typesSet = new Set<string>();
    for (const dish of dishes) {
      const dishTypes = Array.isArray(dish.dishTypes) ? dish.dishTypes : [];
      for (const dt of dishTypes) {
        typesSet.add(dt);
      }
    }
    return Array.from(typesSet).sort();
  }, [dishes]);

  // Filter dishes based on selected menu
  // In ALL view, we want to show one dish per nameKey (representing all instances)
  // In specific menu view, show only dishes from that menu
  const filteredDishes = useMemo(() => {
    if (selectedMenuId === 'ALL') {
      // In ALL view, deduplicate by nameKey (show one representative per nameKey)
      const nameKeyMap = new Map<string, MenuDish>();
      for (const dish of dishes) {
        if (!dish.nameKey) continue;
        // Use first dish with this nameKey as representative
        if (!nameKeyMap.has(dish.nameKey)) {
          nameKeyMap.set(dish.nameKey, dish);
        }
      }
      return Array.from(nameKeyMap.values());
    }
    // Specific menu: show all dishes from that menu
    return dishes.filter((d) => d.menuId === selectedMenuId);
  }, [dishes, selectedMenuId]);

  // Group dishes by category
  const dishesByCategory = useMemo(() => {
    const grouped = new Map<string, MenuDish[]>();
    const uncategorized: MenuDish[] = [];

    for (const dish of filteredDishes) {
      const categoryIds = Array.isArray(dish.categoryIds) ? dish.categoryIds : [];
      if (categoryIds.length === 0) {
        uncategorized.push(dish);
      } else {
        for (const catId of categoryIds) {
          if (!grouped.has(catId)) {
            grouped.set(catId, []);
          }
          grouped.get(catId)!.push(dish);
        }
      }
    }

    return { grouped, uncategorized };
  }, [filteredDishes]);

  // Get available categories for filtering
  const availableCategories = useMemo(() => {
    const cats: Array<{ id: string; name: string; count: number }> = [{ id: 'all', name: 'ALL DISHES', count: filteredDishes.length }];

    if (dishesByCategory.uncategorized.length > 0) {
      cats.push({
        id: 'uncategorized',
        name: 'UNLINKED',
        count: dishesByCategory.uncategorized.length,
      });
    }

    for (const category of categories) {
      const dishCount = dishesByCategory.grouped.get(category._id || '')?.length || 0;
      if (dishCount > 0) {
        cats.push({
          id: category._id || '',
          name: (category.name || 'UNNAMED').toUpperCase(),
          count: dishCount,
        });
      }
    }

    return cats;
  }, [categories, dishesByCategory, filteredDishes.length]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (categoryId === 'all') {
        // If "all" is clicked, toggle it and clear others
        if (newSet.has('all')) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add('all');
        }
      } else {
        // Remove "all" if selecting specific category
        newSet.delete('all');
        if (newSet.has(categoryId)) {
          newSet.delete(categoryId);
        } else {
          newSet.add(categoryId);
        }
        // If no categories selected, add "all"
        if (newSet.size === 0) {
          newSet.add('all');
        }
      }
      return newSet;
    });
  };

  // Filter data by search, selected categories, and dish types
  const filteredData = useMemo(() => {
    const matchesSearch = (dish: MenuDish) => {
      if (!searchQuery.trim()) return true;
      const edit = editedDishes.get(dish._id || dish.nameKey || '');
      const finalName = edit?.name ?? dish.name ?? '';
      return finalName.toLowerCase().includes(searchQuery.toLowerCase());
    };

    const matchesDishType = (dish: MenuDish) => {
      if (selectedDishType === 'all') return true;
      const dishTypes = Array.isArray(dish.dishTypes) ? dish.dishTypes : [];
      return dishTypes.includes(selectedDishType);
    };

    const showAll = selectedCategories.has('all');
    const showUncategorized = showAll || selectedCategories.has('uncategorized');

    const uncategorized = dishesByCategory.uncategorized.filter((dish) => {
      if (!showUncategorized) return false;
      return matchesSearch(dish) && matchesDishType(dish);
    });

    const grouped = new Map<string, MenuDish[]>();
    for (const [catId, dishList] of dishesByCategory.grouped.entries()) {
      if (!showAll && !selectedCategories.has(catId)) continue;
      const filtered = dishList.filter((dish) => matchesSearch(dish) && matchesDishType(dish));
      if (filtered.length > 0) {
        grouped.set(catId, filtered);
      }
    }

    // Flatten all dishes for display
    const allFilteredDishes: MenuDish[] = [];
    if (showUncategorized) {
      allFilteredDishes.push(...uncategorized);
    }
    for (const dishList of grouped.values()) {
      allFilteredDishes.push(...dishList);
    }

    return { uncategorized, grouped, allDishes: allFilteredDishes };
  }, [dishesByCategory, searchQuery, selectedCategories, selectedDishType, editedDishes]);

  // Detect duplicate names
  useEffect(() => {
    const nameMap = new Map<string, string[]>();
    for (const dish of filteredData.allDishes) {
      const edit = editedDishes.get(dish._id || dish.nameKey || '');
      const finalName = edit?.name ?? dish.name ?? '';
      if (!nameMap.has(finalName)) {
        nameMap.set(finalName, []);
      }
      nameMap.get(finalName)!.push(dish._id || dish.nameKey || '');
    }

    const duplicates = new Set<string>();
    for (const [, ids] of nameMap.entries()) {
      if (ids.length > 1) {
        for (const id of ids) {
          duplicates.add(id);
        }
      }
    }
    setDuplicateDishIds(duplicates);
  }, [filteredData, editedDishes]);

  const handleEditField = (dish: MenuDish, fieldName: 'name' | 'price' | 'availability', value: string | number | boolean) => {
    const dishId = dish._id || dish.nameKey || '';
    const existing = editedDishes.get(dishId) || { _id: dish._id || '', nameKey: dish.nameKey || '' };

    if (fieldName === 'price' && typeof value === 'number') {
      const portions = existing.portions || dish.portions || [];
      if (portions.length > 0) {
        // Update first portion's price
        const updatedPortions = portions.map((p, idx) => (idx === 0 ? { ...p, price: value } : p));
        setEditedDishes(new Map(editedDishes).set(dishId, { ...existing, price: value, portions: updatedPortions }));
      } else {
        setEditedDishes(new Map(editedDishes).set(dishId, { ...existing, price: value }));
      }
    } else {
      setEditedDishes(new Map(editedDishes).set(dishId, { ...existing, [fieldName]: value }));
    }
  };

  const handleEditPortion = (
    dish: MenuDish,
    portionId: string,
    field: 'name' | 'price' | 'default' | 'portionTypes',
    value: string | number | boolean | string[],
  ) => {
    const dishId = dish._id || dish.nameKey || '';
    const existing = editedDishes.get(dishId) || { _id: dish._id || '', nameKey: dish.nameKey || '' };
    const portions = existing.portions || dish.portions || [];

    const updatedPortions = portions.map((p, idx) => {
      const pId = (p as any)._id || `temp-${idx}`;
      if (pId === portionId) {
        const updated = { ...p, [field]: field === 'price' ? Number(value) : value };
        // If setting default to true, unset all other defaults
        if (field === 'default' && value === true) {
          return updated;
        }
        return updated;
      }
      // If setting default to true, unset all other defaults
      if (field === 'default' && value === true) {
        return { ...p, default: false };
      }
      return p;
    });

    setEditedDishes(new Map(editedDishes).set(dishId, { ...existing, portions: updatedPortions }));
  };

  const handleAddPortion = (dish: MenuDish) => {
    const dishId = dish._id || dish.nameKey || '';
    const existing = editedDishes.get(dishId) || { _id: dish._id || '', nameKey: dish.nameKey || '' };
    const portions = existing.portions !== undefined ? existing.portions : dish.portions || [];

    // Get dish type (default to VEG if not available)
    const dishType = (dish as any).dishType || 'VEG';

    const newPortion: Portion = {
      name: '',
      price: 0,
      default: false, // User can set default manually
      portionTypes: [dishType], // Default to dish type
      _id: `temp-${Date.now()}-${Math.random()}`,
    };

    setEditedDishes(new Map(editedDishes).set(dishId, { ...existing, portions: [...portions, newPortion] }));
  };

  const handleRemovePortion = (dish: MenuDish, portionId: string) => {
    const dishId = dish._id || dish.nameKey || '';
    const existing = editedDishes.get(dishId) || { _id: dish._id || '', nameKey: dish.nameKey || '' };
    const portions = existing.portions || dish.portions || [];

    const updatedPortions = portions.filter((p, idx) => {
      const pId = (p as any)._id || `temp-${idx}`;
      return pId !== portionId;
    });

    setEditedDishes(new Map(editedDishes).set(dishId, { ...existing, portions: updatedPortions }));
  };

  // Helper function to clean portions before sending to server
  // Note: Don't include _id when creating/updating portions (server generates it)
  const cleanPortions = (portions: Portion[], dishType: string = 'VEG') => {
    return portions.map((portion) => {
      return {
        name: portion.name || '',
        price: portion.price || 0,
        default: portion.default ?? false, // Default to false if not specified
        portionTypes: portion.portionTypes && portion.portionTypes.length > 0 ? portion.portionTypes : [dishType], // Default to dish type if not specified
        // DO NOT include _id - server will generate for new portions
      };
    });
  };

  // Helper to compare if portions have actually changed
  const portionsChanged = (editedPortions: Portion[] | undefined, originalPortions: Portion[] | undefined): boolean => {
    if (!editedPortions && !originalPortions) return false;
    if (!editedPortions || !originalPortions) return true;
    if (editedPortions.length !== originalPortions.length) return true;

    // Compare each portion (ignore _id for comparison)
    for (let i = 0; i < editedPortions.length; i++) {
      const edited = editedPortions[i];
      const original = originalPortions[i];
      if (
        edited.name !== original.name ||
        edited.price !== original.price ||
        edited.default !== original.default ||
        JSON.stringify(edited.portionTypes || []) !== JSON.stringify(original.portionTypes || [])
      ) {
        return true;
      }
    }
    return false;
  };

  const handleSave = async () => {
    if (editedDishes.size === 0) {
      toast.error('No changes to save');
      return;
    }

    try {
      let savedCount = 0;

      // Use a transaction to ensure atomicity
      await db.transaction('rw', db.dishes, db.draftOps, async () => {
        for (const [, edit] of editedDishes.entries()) {
          const nameKey = edit.nameKey;
          // If no nameKey OR we are in specific menu mode (not ALL), use ID-based update
          if (!nameKey || selectedMenuId !== 'ALL') {
            // If no nameKey, update by dish _id (single dish update)
            if (!edit._id) continue;

            // Get original dish to compare
            const originalDish = await db.dishes.get(edit._id);
            if (!originalDish) continue;

            const updates: Record<string, unknown> = {};

            // Check if name changed
            if (edit.name !== undefined && edit.name !== originalDish.name) {
              updates.name = edit.name;
            }

            // Check if availability changed
            if (edit.availability !== undefined && edit.availability !== originalDish.availability) {
              updates.availability = edit.availability;
            }

            // Handle portions - check if they actually changed
            if (edit.portions !== undefined) {
              const dishType = (originalDish as any)?.dishType || 'VEG';
              const cleanedPortions = cleanPortions(edit.portions, dishType);

              // Compare with original portions
              if (portionsChanged(edit.portions, originalDish.portions)) {
                updates.portions = cleanedPortions;
                // If portions exist, don't set price (portions have their own prices)
                if (edit.portions.length === 0 && edit.price !== undefined && edit.price !== originalDish.price) {
                  updates.price = edit.price;
                }
              } else if (edit.price !== undefined && edit.price !== originalDish.price) {
                // Portions didn't change but price did
                updates.price = edit.price;
              }
            } else if (edit.price !== undefined && edit.price !== originalDish.price) {
              // No portions edited, just update price if it changed
              updates.price = edit.price;
            }

            // Skip if no updates to apply
            if (Object.keys(updates).length === 0) continue;

            await db.dishes.update(edit._id, updates);
            await DraftOpsRepository.addDraftOp({
              businessId,
              entity: 'DISH',
              entityId: edit._id,
              opType: 'UPDATE',
              payload: updates,
            });
            savedCount++;
            continue;
          }
          // Find all dishes with this nameKey
          const matchingDishes = dishesGroupedByNameKey.get(nameKey) || [];
          if (matchingDishes.length === 0) continue;

          // Get first dish for comparison (all dishes with same nameKey should have same base structure)
          const firstDish = matchingDishes[0];

          // Prepare updates
          const updates: Record<string, unknown> = {};

          // Check if name changed
          if (edit.name !== undefined && edit.name !== firstDish.name) {
            updates.name = edit.name;
          }

          // Check if availability changed
          if (edit.availability !== undefined && edit.availability !== firstDish.availability) {
            updates.availability = edit.availability;
          }

          // Handle portions - check if they actually changed
          if (edit.portions !== undefined) {
            const dishType = (firstDish as any)?.dishType || 'VEG';
            const cleanedPortions = cleanPortions(edit.portions, dishType);

            // Compare with original portions
            if (portionsChanged(edit.portions, firstDish.portions)) {
              updates.portions = cleanedPortions;
              // If portions exist, don't set price (portions have their own prices)
              if (edit.portions.length === 0 && edit.price !== undefined && edit.price !== firstDish.price) {
                updates.price = edit.price;
              }
            } else if (edit.price !== undefined && edit.price !== firstDish.price) {
              // Portions didn't change but price did
              updates.price = edit.price;
            }
          } else if (edit.price !== undefined && edit.price !== firstDish.price) {
            // No portions edited, just update price if it changed
            updates.price = edit.price;
          }

          // Skip if no updates to apply
          if (Object.keys(updates).length === 0) continue;

          // Update all matching dishes (across all menus if nameKey matches)
          for (const dish of matchingDishes) {
            await db.dishes.update(dish._id, updates);
            console.log('updates', updates);
            await DraftOpsRepository.addDraftOp({
              businessId,
              entity: 'DISH',
              entityId: dish._id,
              opType: 'UPDATE',
              payload: updates,
            });
            savedCount++;
          }
        }
      });

      if (savedCount > 0) {
        toast.success(`Saved ${savedCount} dish update${savedCount !== 1 ? 's' : ''}. Changes will be pushed when you "Push Menu".`);
        setEditedDishes(new Map());
      } else {
        toast.error('No valid changes to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    }
  };

  const renderDishCard = (dish: MenuDish, isDuplicate: boolean) => {
    const dishId = dish._id || dish.nameKey || '';
    const edit = editedDishes.get(dishId);
    const finalName = edit?.name ?? dish.name ?? '';
    const finalPrice = edit?.price ?? dish.price ?? 0;
    const finalAvail = edit?.availability ?? dish.availability ?? true;
    // Use edited portions if they exist, otherwise use dish portions (or empty array)
    const portions = edit?.portions !== undefined ? edit.portions : dish.portions || [];

    return (
      <div key={dishId} style={{ padding: '20px' }}>
        {/* Name, Price, and Availability in one line */}
        <div className="mb-4 flex items-center gap-3">
          <div style={{ flex: 2 }}>
            <Input
              type="text"
              value={finalName}
              onChange={(e) => handleEditField(dish, 'name', e.target.value)}
              className="brutal-input"
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: isDuplicate ? '1.5px solid #DC2626' : '1px solid rgba(42, 42, 42, 0.2)',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#111111',
                width: '100%',
              }}
              placeholder="Dish name"
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              type="number"
              value={finalPrice}
              onChange={(e) => handleEditField(dish, 'price', Number(e.target.value))}
              className="brutal-input"
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                border: '1px solid rgba(42, 42, 42, 0.2)',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#111111',
                width: '100%',
              }}
              min="0"
              step="0.01"
              placeholder="Price"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="whitespace-nowrap" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3A3A3A' }}>
              AVAILABLE
            </Label>
            <Switch checked={finalAvail} onCheckedChange={(checked) => handleEditField(dish, 'availability', checked)} />
          </div>
        </div>

        {/* Portions Section - Always visible */}
        <div style={{ borderTop: '1px solid rgba(42, 42, 42, 0.15)', paddingTop: '16px' }}>
          <div className="mb-3">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111111', letterSpacing: '0.02em' }}>
              PORTIONS {portions.length > 0 && `(${portions.length})`}
            </div>
          </div>

          {portions.length > 0 ? (
            <div>
              <div
                style={{
                  background: '#F0EFEA',
                  border: '1px solid rgba(42, 42, 42, 0.15)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                }}
              >
                <div className="space-y-2">
                  {portions.map((portion, idx) => {
                    const portionId = (portion as any)._id || `temp-${idx}`;
                    return (
                      <div
                        key={`${dishId}-${portionId}`}
                        style={{
                          border: '1px solid rgba(42, 42, 42, 0.15)',
                          borderRadius: '6px',
                          padding: '12px',
                          background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAF9',
                        }}
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <Input
                            type="text"
                            value={portion.name}
                            onChange={(e) => handleEditPortion(dish, portionId, 'name', e.target.value)}
                            className="brutal-input flex-1"
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              border: '1px solid rgba(42, 42, 42, 0.15)',
                              borderRadius: '6px',
                              background: '#FFFFFF',
                              color: '#111111',
                            }}
                            placeholder="Portion name"
                          />
                          <Input
                            type="number"
                            value={portion.price}
                            onChange={(e) => handleEditPortion(dish, portionId, 'price', Number(e.target.value))}
                            className="brutal-input"
                            style={{
                              width: '120px',
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              fontFamily: 'JetBrains Mono, monospace',
                              border: '1px solid rgba(42, 42, 42, 0.15)',
                              borderRadius: '6px',
                              background: '#FFFFFF',
                              color: '#111111',
                            }}
                            min="0"
                            step="0.01"
                            placeholder="Price"
                          />
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={portion.default ?? false}
                              onChange={(e) => handleEditPortion(dish, portionId, 'default', e.target.checked)}
                              className="h-4 w-4 border-2 border-black"
                            />
                            <span className="text-[10px] font-bold">DEFAULT</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemovePortion(dish, portionId)}
                            style={{
                              width: '32px',
                              height: '32px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#FFFFFF',
                              border: '1.5px solid #DC2626',
                              borderRadius: '6px',
                              color: '#DC2626',
                              cursor: 'pointer',
                              transition: 'all 0.1s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#DC2626';
                              e.currentTarget.style.color = '#FFFFFF';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#FFFFFF';
                              e.currentTarget.style.color = '#DC2626';
                            }}
                            title="Remove portion"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-[10px] font-bold">DISH TYPES</Label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {['VEG', 'NON_VEG', 'EGG', 'ALCOHOL', 'NON_ALCOHOL'].map((type) => (
                                <label key={type} className="flex items-center gap-1 text-[10px]">
                                  <input
                                    type="checkbox"
                                    checked={((portion.portionTypes || []) as string[]).includes(type)}
                                    onChange={(e) => {
                                      const current = (portion.portionTypes || []) as string[];
                                      const dishType = (dish as { dishType?: string })?.dishType || 'VEG';
                                      const updated = e.target.checked ? [...current, type] : current.filter((t) => t !== type);
                                      handleEditPortion(dish, portionId, 'portionTypes', updated.length > 0 ? updated : [dishType]);
                                    }}
                                    className="h-3 w-3 border border-black"
                                  />
                                  <span>{type}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAddPortion(dish)}
                className="flex items-center gap-2"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  border: '1.5px solid #111111',
                  borderRadius: '8px',
                  color: '#111111',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0EFEA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <Plus size={16} strokeWidth={2} />
                ADD PORTION
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => handleAddPortion(dish)}
                className="flex items-center gap-2"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  border: '1.5px solid #111111',
                  borderRadius: '8px',
                  color: '#111111',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0EFEA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <Plus size={16} strokeWidth={2} />
                ADD PORTION
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4" style={{ background: '#F5F4F0', minHeight: '100vh', padding: '16px' }}>
      {/* Breadcrumb Back Button at Top Left */}
      {onBack && (
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={onBack}
                  className="flex cursor-pointer items-center gap-2"
                  style={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#111111',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <ArrowLeft size={16} strokeWidth={2.5} />
                  BACK
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-default"
                  style={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#111111',
                    textDecoration: 'none',
                  }}
                >
                  QUICK MENU UPDATE
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Top Bar - Title, Changes Count, and Save Button */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: '#FFFFFF',
          border: '2px solid #111111',
          borderRadius: '10px',
          boxShadow: '3px 3px 0 #111111',
        }}
      >
        <div className="flex items-center gap-4">
          <h2 className="brutal-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', letterSpacing: '-0.02em' }}>
            QUICK MENU UPDATE
          </h2>
          {editedDishes.size > 0 && (
            <div className="brutal-body" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3A3A3A' }}>
              {editedDishes.size} DISH{editedDishes.size !== 1 ? 'ES' : ''} MODIFIED
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {editedDishes.size > 0 && (
            <button
              type="button"
              onClick={handleSave}
              className="brutal-button-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.875rem',
                fontWeight: 700,
                background: '#FFEB3B',
                border: '2px solid #111111',
                borderRadius: '8px',
                boxShadow: '3px 3px 0 #111111',
                color: '#111111',
                transition: 'all 0.1s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '2px 2px 0 #111111';
                e.currentTarget.style.transform = 'translate(1px, 1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '3px 3px 0 #111111';
                e.currentTarget.style.transform = 'translate(0, 0)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 #111111';
                e.currentTarget.style.transform = 'translate(3px, 3px)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = '2px 2px 0 #111111';
                e.currentTarget.style.transform = 'translate(1px, 1px)';
              }}
            >
              SAVE CHANGES
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Categories and Dishes */}
      <div className="flex gap-4">
        {/* Left Sidebar - Categories */}
        <aside
          style={{
            width: '240px',
            flexShrink: 0,
            background: '#FFFFFF',
            border: '2px solid #111111',
            borderRadius: '10px',
            boxShadow: '3px 3px 0 #111111',
            overflow: 'hidden',
          }}
        >
          <div className="max-h-[600px] overflow-y-auto">
            {availableCategories.map((cat, idx) => {
              const isSelected = selectedCategories.has(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left"
                  style={{
                    borderBottom: idx < availableCategories.length - 1 ? '1px solid rgba(42, 42, 42, 0.15)' : 'none',
                    fontSize: '0.875rem',
                    background: isSelected ? '#FFEB3B' : 'transparent',
                    fontWeight: isSelected ? 700 : 600,
                    color: '#111111',
                    transition: 'background 0.1s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#F0EFEA';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span className="truncate" style={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {cat.name}
                  </span>
                  <span
                    style={{
                      background: isSelected ? '#111111' : '#EFEDE7',
                      color: isSelected ? '#FFEB3B' : '#111111',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      minWidth: '28px',
                      textAlign: 'center',
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Side - Dishes */}
        <div className="min-w-0 flex-1">
          {/* Search Bar */}
          <div className="mb-4 flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1" style={{ minWidth: '200px' }}>
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: '#3A3A3A', strokeWidth: 2, pointerEvents: 'none' }}
              />
              <Input
                type="text"
                placeholder="SEARCH DISHES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="brutal-input"
                style={{
                  paddingLeft: '48px',
                  paddingRight: searchQuery ? '44px' : '16px',
                  padding: '10px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(42, 42, 42, 0.2)',
                  borderRadius: '8px',
                  color: '#111111',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{
                    width: '24px',
                    height: '24px',
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
                  <X size={16} strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Dish Type Dropdown */}
            <div style={{ minWidth: '180px' }}>
              <Select value={selectedDishType} onValueChange={setSelectedDishType}>
                <SelectTrigger
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(42, 42, 42, 0.2)',
                    borderRadius: '8px',
                    color: '#111111',
                  }}
                >
                  <SelectValue placeholder="FILTER BY TYPE" />
                  <ChevronDown size={16} style={{ color: '#3A3A3A' }} />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: '#FFFFFF',
                    border: '2px solid #111111',
                    borderRadius: '8px',
                    boxShadow: '3px 3px 0 #111111',
                  }}
                >
                  <SelectItem
                    value="all"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#111111',
                    }}
                  >
                    ALL TYPES
                  </SelectItem>
                  {availableDishTypes.map((dishType) => (
                    <SelectItem
                      key={dishType}
                      value={dishType}
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#111111',
                        textTransform: 'uppercase',
                      }}
                    >
                      {dishType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dish Count */}
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3A3A3A', whiteSpace: 'nowrap' }}>
              {filteredData.allDishes.length} DISH{filteredData.allDishes.length !== 1 ? 'ES' : ''}
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="max-h-[600px] overflow-y-auto" style={{ paddingRight: '4px' }}>
            {isLoading ? (
              <div
                style={{
                  height: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                  border: '2px solid #111111',
                  borderRadius: '10px',
                  boxShadow: '3px 3px 0 #111111',
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <LoadingSpinner />
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3A3A3A' }}>LOADING DISHES...</div>
                </div>
              </div>
            ) : filteredData.allDishes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredData.allDishes.map((dish, index) => {
                  const isDuplicate = duplicateDishIds.has(dish._id || dish.nameKey || '');
                  return (
                    <div
                      key={dish._id || dish.nameKey || index}
                      style={{
                        background: '#FFFFFF',
                        border: isDuplicate ? '1.5px solid #DC2626' : '1px solid rgba(42, 42, 42, 0.2)',
                        borderRadius: '10px',
                        boxShadow: isDuplicate ? '2px 2px 0 #DC2626' : '1px 1px 0 rgba(42, 42, 42, 0.2)',
                      }}
                    >
                      {renderDishCard(dish, isDuplicate)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="py-16 text-center"
                style={{
                  background: '#FFFFFF',
                  border: '2px solid #111111',
                  borderRadius: '10px',
                  boxShadow: '3px 3px 0 #111111',
                }}
              >
                <Search size={48} className="mx-auto mb-4" style={{ color: '#3A3A3A', opacity: 0.4, strokeWidth: 2 }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3A3A3A' }}>NO DISHES FOUND</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
