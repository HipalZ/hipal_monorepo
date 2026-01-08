/**
 * Kitchen Dish Link Modal
 *
 * Screen C: Modal for linking dishes to a kitchen for a specific zone.
 */

import PopUp from '@/components/atom/popUp';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DishZoneKitchenRepository } from '../../db/DishZoneKitchenRepository';
import { DraftOpsRepository } from '../../db/DraftOpsRepository';
import { useMenuViewData } from '../../hooks/useMenuViewData';
import '../../styles/brutalist.css';
import type { MenuCategory, MenuDish, MenuKitchen, MenuZone } from '../../types';

interface KitchenDishLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: MenuZone;
  kitchen: MenuKitchen;
  businessId: string;
}

export const KitchenDishLinkModal = ({ isOpen, onClose, zone, kitchen, businessId }: KitchenDishLinkModalProps) => {
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Get menu view data for categories and dishes grouping
  const { dishes: allDishes, categories } = useMenuViewData({ businessId });

  // Get current mappings for this zone
  const currentMappings =
    useLiveQuery(async () => {
      return await DishZoneKitchenRepository.getByZone(zone._id, businessId);
    }, [zone._id, businessId]) || [];

  // Get dishes already linked to this kitchen for this zone
  const linkedDishIds = useMemo(() => {
    return new Set(currentMappings.filter((m) => m.kitchenId === kitchen._id).map((m) => m.dishId));
  }, [currentMappings, kitchen._id]);

  // Get kitchen name for each dish in this zone
  const dishKitchenMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const mapping of currentMappings) {
      map.set(mapping.dishId, mapping.kitchenId);
    }
    return map;
  }, [currentMappings]);

  // Group dishes by category
  const dishesByCategory = useMemo(() => {
    const map = new Map<string, { category: MenuCategory; dishes: MenuDish[] }>();

    // Get all categories
    const allCats = categories || [];

    // Group dishes by their first category (or "Uncategorized")
    for (const dish of allDishes || []) {
      if (dish.isDeleted) continue;

      const categoryIds = (dish as MenuDish & { categoryIds?: string[] }).categoryIds || [];
      if (categoryIds.length > 0) {
        const categoryId = categoryIds[0]; // Use first category
        const category = allCats.find((c) => c._id === categoryId);

        if (category) {
          if (!map.has(categoryId)) {
            map.set(categoryId, { category, dishes: [] });
          }
          map.get(categoryId)!.dishes.push(dish);
        }
      } else {
        // Uncategorized dishes
        if (!map.has('uncategorized')) {
          const uncategorizedCategory: MenuCategory = {
            _id: 'uncategorized',
            name: 'Uncategorized',
            businessId,
            menuId: '',
            hierarchy: 'CHILD',
          } as MenuCategory;
          map.set('uncategorized', {
            category: uncategorizedCategory,
            dishes: [],
          });
        }
        map.get('uncategorized')!.dishes.push(dish);
      }
    }

    return map;
  }, [allDishes, categories, businessId]);

  // Filter categories and dishes by search
  const filteredDishesByCategory = useMemo(() => {
    if (!searchQuery.trim()) return dishesByCategory;

    const q = searchQuery.toLowerCase();
    const filtered = new Map<string, { category: MenuCategory; dishes: MenuDish[] }>();

    for (const [catId, { category, dishes }] of dishesByCategory.entries()) {
      // Check if category name matches
      const categoryMatches = category.name?.toLowerCase().includes(q);

      // Filter dishes by name
      const filteredDishes = dishes.filter((d) => d.name?.toLowerCase().includes(q));

      // Include if category matches or has matching dishes
      if (categoryMatches || filteredDishes.length > 0) {
        filtered.set(catId, {
          category,
          dishes: categoryMatches ? dishes : filteredDishes, // Show all dishes if category matches
        });
      }
    }

    return filtered;
  }, [dishesByCategory, searchQuery]);

  // Initialize selected dishes to currently linked ones when modal opens
  useEffect(() => {
    if (isOpen && linkedDishIds.size > 0) {
      setSelectedDishIds(Array.from(linkedDishIds));
      // Auto-expand categories with linked dishes
      const catsToExpand = new Set<string>();
      for (const [catId, { dishes }] of dishesByCategory.entries()) {
        if (dishes.some((d) => linkedDishIds.has(d._id))) {
          catsToExpand.add(catId);
        }
      }
      setExpandedCategories(catsToExpand);
    } else if (isOpen && linkedDishIds.size === 0) {
      setSelectedDishIds([]);
      setExpandedCategories(new Set());
    }
  }, [isOpen, linkedDishIds, dishesByCategory]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Get category selection state
  const getCategoryState = (dishes: MenuDish[]): 'all' | 'some' | 'none' => {
    const selectedCount = dishes.filter((d) => selectedDishIds.includes(d._id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === dishes.length) return 'all';
    return 'some';
  };

  const toggleDish = (dishId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedDishIds((prev) => (prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]));
  };

  const toggleCategorySelection = (dishes: MenuDish[], e: React.MouseEvent) => {
    e.stopPropagation();
    const categoryState = getCategoryState(dishes);
    const dishIds = dishes.map((d) => d._id);

    if (categoryState === 'all') {
      // Deselect all
      setSelectedDishIds((prev) => prev.filter((id) => !dishIds.includes(id)));
    } else {
      // Select all
      setSelectedDishIds((prev) => {
        const newSelection = [...prev];
        for (const dishId of dishIds) {
          if (!newSelection.includes(dishId)) {
            newSelection.push(dishId);
          }
        }
        return newSelection;
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Bulk link selected dishes to this kitchen for this zone
      await DraftOpsRepository.bulkLinkDishesToKitchen(selectedDishIds, zone._id, kitchen._id, businessId);

      toast.success(`Linked ${selectedDishIds.length} dish(es) to ${kitchen.name}`);
      onClose();
    } catch (error) {
      console.error('Failed to link dishes:', error);
      toast.error('Failed to link dishes');
    } finally {
      setIsSaving(false);
    }
  };

  const getKitchenName = (dishId: string): string | null => {
    const kitchenId = dishKitchenMap.get(dishId);
    if (!kitchenId) return null;
    // Find kitchen name (would need to query, but for now return ID)
    return kitchenId === kitchen._id ? kitchen.name : 'Other Kitchen';
  };

  if (!isOpen) return null;

  return (
    <PopUp show={isOpen} onClose={onClose} hide>
      <div className="mx-auto flex h-full flex-col bg-white p-4">
        <div className="mb-4">
          <div className="brutal-body" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
            Zone: <strong>{zone.name}</strong> | Kitchen: <strong>{kitchen.name}</strong>
          </div>
          <div className="brutal-data" style={{ fontSize: '0.75rem', color: '#666' }}>
            Select dishes to route to this kitchen when ordered from this zone.
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="SEARCH DISHES"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="brutal-input"
            style={{ width: '100%', padding: '10px 14px', fontSize: '0.875rem' }}
          />
        </div>

        {/* Categories and Dishes List */}
        <div className="mb-6 max-h-[500px] overflow-y-auto" style={{ border: '3px solid #000000' }}>
          {filteredDishesByCategory.size === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div className="brutal-body" style={{ fontSize: '0.875rem' }}>
                {searchQuery ? 'NO DISHES FOUND' : 'NO DISHES AVAILABLE'}
              </div>
            </div>
          ) : (
            <div>
              {Array.from(filteredDishesByCategory.entries()).map(([categoryId, { category, dishes }]) => {
                const isExpanded = expandedCategories.has(categoryId);
                const categoryState = getCategoryState(dishes);
                const selectedCount = dishes.filter((d) => selectedDishIds.includes(d._id)).length;

                return (
                  <div key={categoryId} style={{ borderBottom: '2px solid #000000' }}>
                    {/* Category Header */}
                    <div
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer"
                      style={{
                        padding: '12px 16px',
                        background: '#F9F9F9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                      onClick={() => toggleCategory(categoryId)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleCategory(categoryId);
                        }
                      }}
                    >
                      {/* Expand/Collapse Icon */}
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 900,
                        }}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </div>

                      {/* Category Checkbox */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => toggleCategorySelection(dishes, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleCategorySelection(dishes, e as unknown as React.MouseEvent);
                          }
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '3px solid #000000',
                          background: categoryState === 'all' ? '#000000' : categoryState === 'some' ? '#666' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        {categoryState === 'all' && <span style={{ color: '#FFEB3B', fontSize: '12px', fontWeight: 900 }}>✓</span>}
                        {categoryState === 'some' && <span style={{ color: '#FFEB3B', fontSize: '12px', fontWeight: 900 }}>–</span>}
                      </div>

                      {/* Category Name and Count */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="brutal-heading" style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                          {category.name}
                        </div>
                        <div className="brutal-data" style={{ fontSize: '0.75rem', color: '#666', marginLeft: '12px' }}>
                          {selectedCount}/{dishes.length} selected
                        </div>
                      </div>
                    </div>

                    {/* Dishes in Category */}
                    {isExpanded && (
                      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                        {dishes.map((dish) => {
                          const isSelected = selectedDishIds.includes(dish._id);
                          const currentKitchen = getKitchenName(dish._id);

                          return (
                            <div
                              key={dish._id}
                              role="button"
                              tabIndex={0}
                              className="cursor-pointer"
                              style={{
                                padding: '12px 16px 12px 48px',
                                borderBottom: '1px solid #E5E5E5',
                                borderRight: '1px solid #E5E5E5',
                                background: isSelected ? '#FFEB3B' : '#FFFFFF',
                                transition: 'background 0.15s',
                              }}
                              onClick={(e) => toggleDish(dish._id, e)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleDish(dish._id);
                                }
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = '#FFF9C4';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = '#FFFFFF';
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="brutal-body" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                    {dish.name}
                                  </div>
                                  {currentKitchen && currentKitchen !== kitchen.name && (
                                    <div className="brutal-data" style={{ fontSize: '0.6875rem', color: '#666', marginTop: '2px' }}>
                                      Currently: {currentKitchen}
                                    </div>
                                  )}
                                  {!currentKitchen && (
                                    <div className="brutal-data" style={{ fontSize: '0.6875rem', color: '#999', marginTop: '2px' }}>
                                      Not linked
                                    </div>
                                  )}
                                </div>
                                <div
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid #000000',
                                    background: isSelected ? '#000000' : '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginLeft: '12px',
                                  }}
                                >
                                  {isSelected && <span style={{ color: '#FFEB3B', fontSize: '14px', fontWeight: 900 }}>✓</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="brutal-data" style={{ fontSize: '0.875rem' }}>
            {selectedDishIds.length} dish{selectedDishIds.length !== 1 ? 'es' : ''} selected
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="brutal-button" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || selectedDishIds.length === 0}
              className="brutal-button-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.875rem',
                fontWeight: 700,
                opacity: isSaving || selectedDishIds.length === 0 ? 0.5 : 1,
              }}
            >
              {isSaving ? 'SAVING...' : 'SAVE LINKING'}
            </button>
          </div>
        </div>
      </div>
    </PopUp>
  );
};
