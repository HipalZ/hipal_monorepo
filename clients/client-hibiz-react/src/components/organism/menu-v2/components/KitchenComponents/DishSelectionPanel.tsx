import useBusinessData from '@/components/store/useBusinessData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { db } from '../../db/menu.database';

interface DishSelectionPanelProps {
  selectedIds: Set<string>;
  onSelectionChange: (ids: string[]) => void;
}

type CheckedState = boolean | 'indeterminate';

export const DishSelectionPanel = ({ selectedIds, onSelectionChange }: DishSelectionPanelProps) => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const dishes = useLiveQuery(() => db.dishes.where({ businessId: businessId || '' }).toArray(), [businessId]);
  const categories = useLiveQuery(() => db.categories.where({ businessId: businessId || '' }).toArray(), [businessId]);

  const groupedDishes = useMemo(() => {
    if (!dishes || !categories) return {} as Record<string, typeof dishes>;

    const q = searchQuery.trim().toLowerCase();
    const filtered = q.length > 0 ? dishes.filter((dish) => dish.name.toLowerCase().includes(q)) : dishes;

    const groups: Record<string, typeof dishes> = {};

    // Initialize groups for all categories
    for (const cat of categories) {
      groups[cat._id] = [];
    }
    groups.uncategorized = [];

    for (const dish of filtered) {
      if (dish.categoryIds && dish.categoryIds.length > 0) {
        for (const catId of dish.categoryIds) {
          if (groups[catId]) groups[catId].push(dish);
          else groups.uncategorized.push(dish);
        }
      } else {
        groups.uncategorized.push(dish);
      }
    }

    return groups;
  }, [dishes, categories, searchQuery]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const activeCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((c) => (groupedDishes as any)?.[c._id]?.length > 0);
  }, [categories, groupedDishes]);

  // Helper to check if all dishes in a category are selected
  const getCategorySelectionState = (catId: string): CheckedState => {
    const dishesInCat = (groupedDishes as any)?.[catId] || [];
    if (dishesInCat.length === 0) return false;

    const allSelected = dishesInCat.every((d: any) => selectedIds.has(d._id));
    if (allSelected) return true;

    const someSelected = dishesInCat.some((d: any) => selectedIds.has(d._id));
    return someSelected ? 'indeterminate' : false;
  };

  const handleToggleDish = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);

    onSelectionChange(Array.from(newSelected));
  };

  const handleCategoryCheckbox = (catId: string, checked: boolean) => {
    const dishesInCat = (groupedDishes as any)?.[catId] || [];
    const newSelected = new Set(selectedIds);

    for (const dish of dishesInCat) {
      if (checked) newSelected.add(dish._id);
      else newSelected.delete(dish._id);
    }

    onSelectionChange(Array.from(newSelected));
  };

  const isLoading = !categories || !dishes;

  return (
    <div className="brutal-border flex h-full w-full flex-col overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="border-b-2 border-black bg-gray-100 p-4">
        <h3 className="brutal-heading text-lg">SELECT DISHES</h3>
      </div>

      <div className="border-b-2 border-black p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="SEARCH DISHES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-none border-2 border-black pl-10 font-bold placeholder:font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {isLoading ? (
          <p className="py-8 text-center font-bold text-gray-500">LOADING DATA...</p>
        ) : (
          <div className="space-y-3">
            {/* Categories */}
            {activeCategories.map((category) => {
              const selectionState = getCategorySelectionState(category._id); // true | false | "indeterminate"
              const isExpanded = expandedCategories.has(category._id) || searchQuery.length > 0;
              const count = (groupedDishes as any)?.[category._id]?.length || 0;

              return (
                <div key={category._id} className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center border-b-2 border-black bg-white p-2 transition-colors hover:bg-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2 h-6 w-6 p-0 hover:bg-transparent"
                      type="button"
                      onClick={() => toggleCategory(category._id)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>

                    <Checkbox
                      id={`cat-${category._id}`}
                      // ✅ IMPORTANT: pass indeterminate properly
                      checked={selectionState}
                      onCheckedChange={(checked) => handleCategoryCheckbox(category._id, checked === true)}
                      // ✅ OPTIONAL: stop bubbling if you later make header clickable
                      onClick={(e) => e.stopPropagation()}
                      className="mr-3 h-5 w-5 rounded-none border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                    />

                    <label htmlFor={`cat-${category._id}`} className="flex-1 cursor-pointer select-none text-sm font-bold uppercase">
                      {category.name} <span className="ml-1 text-xs font-normal text-gray-500">({count})</span>
                    </label>
                  </div>

                  {isExpanded && (
                    <div className="space-y-1 bg-white p-2">
                      {(groupedDishes as any)?.[category._id]?.map((dish: any) => (
                        <div
                          key={dish._id}
                          className="flex cursor-pointer items-center p-2 hover:bg-[#FFEB3B]/20"
                          onClick={() => handleToggleDish(dish._id, !selectedIds.has(dish._id))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleToggleDish(dish._id, !selectedIds.has(dish._id));
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex w-8 justify-center" />

                          <Checkbox
                            id={dish._id}
                            checked={selectedIds.has(dish._id)}
                            // ✅ CRITICAL FIX: stop row onClick from firing when checkbox clicked
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => handleToggleDish(dish._id, checked === true)}
                            className="mr-3 h-5 w-5 rounded-none border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                          />

                          <span className="text-sm font-medium">{dish.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Uncategorized */}
            {(groupedDishes as any)?.uncategorized?.length > 0 && (
              <div className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center border-b-2 border-black bg-gray-100 p-2">
                  <span className="ml-8 text-sm font-bold uppercase text-gray-500">Uncategorized</span>
                </div>

                <div className="space-y-1 bg-white p-2">
                  {(groupedDishes as any).uncategorized.map((dish: any) => (
                    <div
                      key={dish._id}
                      className="flex cursor-pointer items-center p-2 hover:bg-[#FFEB3B]/20"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="w-8" />

                      <Checkbox
                        id={dish._id}
                        checked={selectedIds.has(dish._id)}
                        // ✅ CRITICAL FIX here too
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={(checked) => handleToggleDish(dish._id, checked === true)}
                        className="mr-3 h-5 w-5 rounded-none border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                      />

                      <span className="text-sm font-medium">{dish.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t-2 border-black bg-white p-3 text-center">
        <span className="text-xs font-bold uppercase text-gray-500">
          Selected: <span className="text-black">{selectedIds.size} dishes</span>
        </span>
      </div>
    </div>
  );
};
