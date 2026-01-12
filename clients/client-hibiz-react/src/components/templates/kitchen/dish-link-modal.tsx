import { memo, useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";
import { useDishesStore } from "@/components/store/useDishesStore.ts";
import type { DishType } from "@hi/db-models/src/validators"; // Assuming this path is correct
import {
  Search,
  Utensils,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import { useDishes } from "@/hooks/useDish.ts";
import { useChildCategories } from "@/hooks/useCategory.ts";
import { useCategoryStore } from "@/components/store/useCategoryStore.ts";

interface DishLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedDishIds: string[];
  onSave: (selectedIds: string[]) => void;
}

function DishLinkModalComponent({
  isOpen,
  onClose,
  initialSelectedDishIds,
  onSave,
}: DishLinkModalProps) {
  const { dishes } = useDishesStore();
  const { isLoading: catLoading } = useChildCategories();
  const { isLoading: loadingDishes } = useDishes();
  const { subCategories } = useCategoryStore((state) => ({
    subCategories: state.subCategories,
  }));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>(
    initialSelectedDishIds,
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    setSelectedDishIds(initialSelectedDishIds);
  }, [initialSelectedDishIds]);

  const groupedDishes = useMemo(() => {
    const groups: { [key: string]: DishType[] } = {
      "Unlinked Dishes": [],
    };

    // Initialize groups with actual categories
    for (const category of subCategories) {
      groups[category.name] = [];
    }

    // Map dishes to their categories
    for (const dish of dishes) {
      let foundCategory = false;
      for (const category of subCategories) {
        if (category.dishIds.includes(dish?._id)) {
          groups[category.name].push(dish);
          foundCategory = true;
          break;
        }
      }
      if (!foundCategory) {
        groups["Unlinked Dishes"].push(dish);
      }
    }

    // Filter dishes within each group based on search term
    const filteredGroups: { [key: string]: DishType[] } = {};
    for (const [categoryName, dishList] of Object.entries(groups)) {
      const filteredList = dishList.filter((dish) =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      if (filteredList.length > 0) {
        filteredGroups[categoryName] = filteredList;
      }
    }

    return filteredGroups;
  }, [dishes, subCategories, searchTerm]);

  const allFilteredDishes = useMemo(() => {
    return Object.values(groupedDishes).flat();
  }, [groupedDishes]);

  const allFilteredDishesSelected = useMemo(() => {
    if (allFilteredDishes.length === 0) return false;
    return allFilteredDishes.every((dish) =>
      selectedDishIds.includes(dish?._id),
    );
  }, [allFilteredDishes, selectedDishIds]);

  const someFilteredDishesSelected = useMemo(() => {
    if (allFilteredDishes.length === 0) return false;
    return (
      allFilteredDishes.some((dish) => selectedDishIds.includes(dish?._id)) &&
      !allFilteredDishesSelected
    );
  }, [allFilteredDishes, selectedDishIds, allFilteredDishesSelected]);

  const handleToggleAllDishes = useCallback(() => {
    setSelectedDishIds((prev) => {
      if (allFilteredDishesSelected) {
        // Deselect all filtered dishes
        return prev.filter(
          (id) => !allFilteredDishes.some((dish) => dish?._id === id),
        );
      } else {
        // Select all filtered dishes
        const newSelected = new Set(prev);
        allFilteredDishes.forEach((dish) => newSelected.add(dish?._id));
        return Array.from(newSelected);
      }
    });
  }, [allFilteredDishesSelected, allFilteredDishes]);

  const toggleCategoryExpansion = useCallback((categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  }, []);

  const toggleDishSelection = useCallback((dishId: string) => {
    setSelectedDishIds((prev) => {
      if (prev.includes(dishId)) {
        return prev.filter((id) => id !== dishId);
      } else {
        return [...prev, dishId];
      }
    });
  }, []);

  const toggleSelectAllCategory = useCallback(
    (categoryName: string) => {
      const dishesInCategory = groupedDishes[categoryName] || [];
      const allSelectedInThisCategory = dishesInCategory.every((dish) =>
        selectedDishIds.includes(dish?._id),
      );

      setSelectedDishIds((prev) => {
        let newSelected = [...prev];
        if (allSelectedInThisCategory) {
          // Deselect all in this category
          newSelected = newSelected.filter(
            (id) => !dishesInCategory.some((dish) => dish?._id === id),
          );
        } else {
          // Select all in this category
          for (const dish of dishesInCategory) {
            if (!newSelected.includes(dish?._id)) {
              newSelected.push(dish?._id);
            }
          }
        }
        return newSelected;
      });
    },
    [groupedDishes, selectedDishIds],
  );

  const handleSave = useCallback(() => {
    onSave(selectedDishIds);
    onClose();
  }, [onSave, selectedDishIds, onClose]);

  const isLoading = loadingDishes || catLoading;

  const navigationButtons = useMemo(() => {
    return [
      {
        text: "Cancel",
        onClick: onClose,
        className:
          "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors",
      },
      {
        text: "Save Dishes",
        icon: <CheckCircle className="mr-2 h-4 w-4" />,
        onClick: handleSave,
        disable: isLoading,
        className:
          "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors",
      },
    ];
  }, [onClose, handleSave, isLoading]);

  return (
    <PopUp
      hide
      height="h-[100dvh] lg:h-[90dvh]"
      width="w-full max-w-[69rem]"
      onClose={onClose}
      show={isOpen}
      rightTopBack
    >
      <div className="bg-white mx-auto h-full flex flex-col p-4 h-[80dvh] overflow-y-auto w-full">
        <div className=" border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Link Dishes to Kitchen
          </h2>
          <p className="text-gray-600">
            Select the dishes available in this kitchen.
          </p>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search dishes by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          {allFilteredDishes.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <Checkbox
                checked={allFilteredDishesSelected}
                indeterminate={someFilteredDishesSelected}
                onCheckedChange={handleToggleAllDishes}
                className="data-[state=checked]:bg-primary"
              />
              <label
                htmlFor="select-all-dishes"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {allFilteredDishesSelected ? "Deselect All" : "Select All"} (
                {selectedDishIds.length} / {allFilteredDishes.length} filtered)
              </label>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <ScrollArea className="flex-1 py-4">
            {Object.keys(groupedDishes).length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">No dishes found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {Object.entries(groupedDishes).map(
                  ([categoryName, dishesInGroup]) => {
                    const isExpanded = expandedCategories.has(categoryName);
                    const selectedInThisCategoryCount = dishesInGroup.filter(
                      (dish) => selectedDishIds.includes(dish?._id),
                    ).length;
                    const totalInThisCategory = dishesInGroup.length;
                    const allSelectedInThisCategory =
                      totalInThisCategory > 0 &&
                      selectedInThisCategoryCount === totalInThisCategory;
                    const someSelectedInThisCategory =
                      selectedInThisCategoryCount > 0 &&
                      selectedInThisCategoryCount < totalInThisCategory;

                    return (
                      <div
                        key={categoryName}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => toggleCategoryExpansion(categoryName)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              toggleCategoryExpansion(categoryName);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={allSelectedInThisCategory}
                              indeterminate={someSelectedInThisCategory}
                              onCheckedChange={() =>
                                toggleSelectAllCategory(categoryName)
                              }
                              onClick={(e) => e.stopPropagation()} // Prevent toggling expansion when clicking checkbox
                              className="data-[state=checked]:bg-primary"
                            />
                            <h3 className="font-semibold text-lg text-gray-800">
                              {categoryName}
                            </h3>
                            {totalInThisCategory > 0 && (
                              <Badge variant="secondary">
                                {selectedInThisCategoryCount} /{" "}
                                {totalInThisCategory} selected
                              </Badge>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        {isExpanded && (
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                            {dishesInGroup.map((dish) => (
                              <div
                                key={dish?._id}
                                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                                  selectedDishIds.includes(dish?._id)
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 bg-white hover:border-gray-100"
                                }`}
                                onClick={() => toggleDishSelection(dish?._id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    toggleDishSelection(dish?._id);
                                  }
                                }}
                                tabIndex={0}
                                role="checkbox"
                                aria-checked={selectedDishIds.includes(
                                  dish?._id,
                                )}
                              >
                                <Checkbox
                                  id={`dish-${dish?._id}`}
                                  checked={selectedDishIds.includes(dish?._id)}
                                  onCheckedChange={() =>
                                    toggleDishSelection(dish?._id)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="data-[state=checked]:bg-primary"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-primary ">
                                    {dish.name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">
                                    ₹{dish.price}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </ScrollArea>
        )}

        <div className="p-6 border-t">
          <AdvancedBottomButton
            fixed={true}
            maxWidth="30rem"
            buttons={navigationButtons}
          />
        </div>
      </div>
    </PopUp>
  );
}

const DishLinkModal = memo(DishLinkModalComponent);
export default DishLinkModal;
