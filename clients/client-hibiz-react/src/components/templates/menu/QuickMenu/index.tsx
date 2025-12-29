import BottomButton from '@/components/atom/bottomButton';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';

import { useDishesStore } from '@/components/store/useDishesStore';
import { useEditDishesStore } from '@/components/store/useQuickMenu';

import { useDishes, useLinkedDishes, useUpdateDish } from '@/hooks/useDish';

interface QuickMenuProps {
  isPetpoojaEnabled: boolean;
}

const QuickMenu = ({ isPetpoojaEnabled }: QuickMenuProps) => {
  const { dishes } = useDishesStore((s) => ({ dishes: s.dishes }));
  const { isLoading, refetch } = useDishes();
  const { data: linkedCategories, refetchLinked } = useLinkedDishes();
  const { isPending, mutateAsync } = useUpdateDish();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allDishes = useMemo(() => {
    const linkedDishes = linkedCategories?.flatMap((cat) => cat.dishIds) || [];
    return [...dishes, ...linkedDishes];
  }, [dishes, linkedCategories]);

  const { unlinkedDishes } = useMemo(() => {
    const unlinked = allDishes.filter((dish) => !dish?.categoryIds || dish?.categoryIds.length === 0);
    return { unlinkedDishes: unlinked };
  }, [allDishes]);

  const filteredLinkedCategories = useMemo(() => {
    return (
      linkedCategories
        ?.map((category) => ({
          ...category,
          dishIds: category.dishIds.filter((dish) => allDishes.some((ad) => ad._id === dish._id)),
        }))
        .filter((category) => category.dishIds.length > 0) || []
    );
  }, [linkedCategories, allDishes]);

  // Enhanced filtering logic with search and category filter
  const filteredData = useMemo(() => {
    const { editedDishes } = useEditDishesStore.getState();

    // Helper function to check if dish matches search query
    const matchesSearch = (dish: any) => {
      if (!searchQuery.trim()) return true;

      const edit = editedDishes.find((ed) => ed._id === dish._id);
      const finalName = edit?.name ?? dish.name;

      return finalName.toLowerCase().includes(searchQuery.toLowerCase());
    };

    // Filter unlinked dishes
    const filteredUnlinked = unlinkedDishes.filter((dish) => {
      if (selectedCategory !== 'all' && selectedCategory !== 'unlinked') return false;
      return matchesSearch(dish);
    });

    // Filter linked categories and their dishes
    const filteredCategories = filteredLinkedCategories
      .map((category) => ({
        ...category,
        dishIds: category.dishIds.filter((dish) => {
          if (selectedCategory !== 'all' && selectedCategory !== category._id) return false;
          return matchesSearch(dish);
        }),
      }))
      .filter((category) => category.dishIds.length > 0);

    return {
      unlinkedDishes: filteredUnlinked,
      linkedCategories: filteredCategories,
    };
  }, [unlinkedDishes, filteredLinkedCategories, searchQuery, selectedCategory]);

  // Get available categories for navigation
  const availableCategories = useMemo(() => {
    const categories = [{ id: 'all', name: 'All Dishes', count: allDishes.length }];

    if (unlinkedDishes.length > 0) {
      categories.push({
        id: 'unlinked',
        name: 'Unlinked',
        count: unlinkedDishes.length,
      });
    }

    filteredLinkedCategories.forEach((cat) => {
      categories.push({
        id: cat._id,
        name: cat.name,
        count: cat.dishIds.length,
      });
    });

    return categories;
  }, [allDishes, unlinkedDishes, filteredLinkedCategories]);

  const { editedDishes, addEditedDish, clearEditedDishes } = useEditDishesStore();
  const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set());

  const [duplicateDishIds, setDuplicateDishIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const nameMap: Record<string, string[]> = {};
    for (const dish of filteredData.unlinkedDishes) {
      const edit = editedDishes.find((ed) => ed._id === dish._id);
      const finalName = edit?.name ?? dish.name;
      if (!nameMap[finalName]) {
        nameMap[finalName] = [];
      }
      nameMap[finalName].push(dish._id);
    }

    for (const cat of filteredData.linkedCategories) {
      for (const dish of cat.dishIds) {
        const edit = editedDishes.find((ed) => ed._id === dish._id);
        const finalName = edit?.name ?? dish.name;
        if (!nameMap[finalName]) {
          nameMap[finalName] = [];
        }
        nameMap[finalName].push(dish._id);
      }
    }

    const duplicates = new Set<string>();
    Object.keys(nameMap).forEach((dishName) => {
      const dishIds = nameMap[dishName];
      if (dishIds.length > 1) {
        dishIds.forEach((id) => duplicates.add(id));
      }
    });

    setDuplicateDishIds(duplicates);
  }, [filteredData.unlinkedDishes, filteredData.linkedCategories, editedDishes]);

  const handleEditField = (dishId: string, fieldName: 'name' | 'price' | 'availability', value: string | number | boolean) => {
    // If updating price and dish has portions, also update first portion's price
    if (fieldName === 'price' && typeof value === 'number') {
      const editedDish = editedDishes.find((dish) => dish._id === dishId);
      const originalDish = allDishes.find((dish) => dish._id === dishId);

      if (!originalDish) {
        addEditedDish({ _id: dishId, [fieldName]: value });
        return;
      }

      const currentPortions = editedDish?.portions || originalDish.portions || [];

      // If dish has portions, update the first portion's price
      if (currentPortions.length > 0) {
        const updatedPortions = currentPortions.map((portion: any, index: number) => {
          if (index === 0) {
            // Update first portion's price to match dish price
            return {
              ...portion,
              price: value,
            };
          }
          return portion;
        });

        addEditedDish({
          _id: dishId,
          [fieldName]: value,
          portions: updatedPortions,
        });
      } else {
        // No portions, just update the price
        addEditedDish({ _id: dishId, [fieldName]: value });
      }
    } else {
      // For other fields (name, availability), update normally
      addEditedDish({ _id: dishId, [fieldName]: value });
    }
  };

  const handleEditPortion = (dishId: string, portionId: string, field: 'name' | 'price', value: string | number) => {
    const editedDish = editedDishes.find((dish) => dish._id === dishId);
    const originalDish = allDishes.find((dish) => dish._id === dishId);

    if (!originalDish) return;

    const currentPortions = editedDish?.portions || originalDish.portions || [];

    const updatedPortions = currentPortions.map((portion) => {
      if (portion._id === portionId) {
        return {
          ...portion,
          [field]: field === 'price' ? Number(value) : value,
        };
      }
      return portion;
    });

    addEditedDish({
      _id: dishId,
      portions: updatedPortions,
    });
  };

  const toggleDishExpand = (dishId: string) => {
    setExpandedDishes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dishId)) {
        newSet.delete(dishId);
      } else {
        newSet.add(dishId);
      }
      return newSet;
    });
  };

  const handleSaveChoice = async () => {
    try {
      for (const dishPayload of editedDishes) {
        await mutateAsync(dishPayload);
      }
      refetch();
      refetchLinked();
      clearEditedDishes();
      console.log('All updated dishes have been processed.');
    } catch (err) {
      console.error('Error updating dishes:', err);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (isLoading || isPending) {
    return <LoadingSpinner />;
  }

  const renderDishRow = (dish: any, isDuplicate: boolean) => {
    const edit = editedDishes.find((ed) => ed._id === dish._id);
    const finalName = edit?.name ?? dish.name;
    const finalPrice = edit?.price ?? dish.price;
    const finalAvail = edit?.availability ?? dish.availability;
    const isExpanded = expandedDishes.has(dish._id);
    const portions = edit?.portions || dish.portions || [];

    return (
      <>
        <tr key={`${dish._id}-main`} className="border-b">
          <td className="py-2">
            <div className="flex items-center px-2">
              <Input
                type="text"
                value={finalName}
                disabled={isPetpoojaEnabled}
                onChange={(e) => handleEditField(dish._id, 'name', e.target.value)}
                className={'w-full ' + (isDuplicate ? 'border-red-500 text-red-500 focus-visible:ring-red-500' : '')}
              />
              {portions && portions.length > 0 && (
                <Button variant="ghost" size="sm" className="ml-2" onClick={() => toggleDishExpand(dish._id)}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              )}
            </div>
          </td>
          <td className="py-2">
            <Input
              type="number"
              value={finalPrice}
              disabled={isPetpoojaEnabled}
              onChange={(e) => handleEditField(dish._id, 'price', Number(e.target.value))}
              className="w-[5rem]"
            />
          </td>
          <td className="px-4 text-center">
            <Switch
              checked={finalAvail}
              onCheckedChange={(checked) => handleEditField(dish._id, 'availability', checked)}
              className={finalAvail ? 'data-[state=checked]:bg-green-500' : 'data-[state=unchecked]:bg-red-500'}
            />
          </td>
        </tr>
        {isExpanded && portions && portions.length > 0 && (
          <>
            <tr className="bg-gray-50">
              <td colSpan={3} className="p-2 text-xs font-medium text-gray-500">
                Portions
              </td>
            </tr>
            {portions.map((portion: any) => (
              <tr key={`${dish._id}-${portion._id}`} className="border-b bg-gray-50 last:border-0">
                <td className="p-2 pl-6">
                  <Input
                    type="text"
                    disabled={isPetpoojaEnabled}
                    value={portion.name}
                    onChange={(e) => handleEditPortion(dish._id, portion._id, 'name', e.target.value)}
                    className="w-full text-sm"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={portion.price}
                    disabled={isPetpoojaEnabled}
                    onChange={(e) => handleEditPortion(dish._id, portion._id, 'price', Number(e.target.value))}
                    className="w-full text-sm"
                  />
                </td>
                <td className="p-2 text-xs">
                  {portion.default ? <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">Default</span> : null}
                </td>
              </tr>
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6 pb-[7rem]">
      <h1 className="pl-4 text-xl font-bold">Quick Menu Edit</h1>

      {/* Search and Filter Controls */}
      <div className="space-y-4 px-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search dishes by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={clearSearch} className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 transform p-0">
              <X size={16} />
            </Button>
          )}
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
            >
              {category.name}
              <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs">{category.count}</span>
            </Button>
          ))}
        </div>

        {/* Results Summary */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="text-sm text-gray-600">
            {searchQuery && (
              <span>
                Searching for "{searchQuery}"{selectedCategory !== 'all' && ' in selected category'}
              </span>
            )}
            {!searchQuery && selectedCategory !== 'all' && (
              <span>Showing {availableCategories.find((c) => c.id === selectedCategory)?.name} category</span>
            )}
          </div>
        )}
      </div>

      {/* No Results Message */}
      {filteredData.unlinkedDishes.length === 0 && filteredData.linkedCategories.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No dishes found</p>
          <p className="text-sm">Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Unlinked Dishes (if any and matching filters) */}
      {filteredData.unlinkedDishes.length > 0 && (
        <div className="space-y-2">
          <h2 className="ml-4 text-lg font-semibold opacity-50">
            Unlinked Dishes
            <span className="ml-2 text-sm font-normal">({filteredData.unlinkedDishes.length})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[70%] p-3 text-left">Dish Name</th>
                  <th className="w-[20%] p-3 text-left">Price</th>
                  <th className="w-[10%] p-3 text-left">Availability</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.unlinkedDishes.map((dish) => {
                  const isDuplicate = duplicateDishIds.has(dish._id);
                  return renderDishRow(dish, isDuplicate);
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Linked Dishes by Category */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredData.linkedCategories.map((category) => {
          if (!category.dishIds || category.dishIds.length === 0) return null;

          return (
            <div key={category._id} className="space-y-2">
              <h2 className="pl-4 text-lg font-semibold opacity-50">
                {category.name}
                <span className="ml-2 text-sm font-normal">({category.dishIds.length})</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-[70%] p-3 text-left">Dish Name</th>
                      <th className="w-[20%] p-3 text-left">Price</th>
                      <th className="w-[10%] p-3 text-left">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.dishIds.map((dish: any) => {
                      const isDuplicate = duplicateDishIds.has(dish._id);
                      return renderDishRow(dish, isDuplicate);
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </section>

      {editedDishes.length > 0 && (
        <BottomButton
          fixed
          buttons={[
            {
              text: 'Save',
              onClick: handleSaveChoice,
              type: 'button',
            },
          ]}
        />
      )}
    </div>
  );
};

export default QuickMenu;
