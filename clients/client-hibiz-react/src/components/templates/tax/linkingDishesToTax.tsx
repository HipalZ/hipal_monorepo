import { memo, useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Utensils,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  MinusCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDishes } from "@/hooks/useDish.ts";
import {
  useLinkedDishesToTax,
  useUnlinkedDishesFromTax,
  type LinkedOrUnlinkedDishesPayload,
} from "@/hooks/useTax";
import { useChildCategories } from "@/hooks/useCategory.ts";
import { useCategoryStore } from "@/components/store/useCategoryStore.ts";
import type { DishType } from "@hi/db-models/src/validators";
import LoadingSpinner from "@/components/atom/loadingSpinner/index.tsx";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";

interface DishWithTaxStatus extends DishType {
  hasGst: boolean;
  originalGst: boolean;
  isAdded?: boolean;
  isRemoved?: boolean;
}

interface LinkingDishesToTaxProps {
  onClose?: () => void;
  getGstTax?: TaxById;
}

const MemoLinkingDishesToTax = ({
  onClose,
  getGstTax,
}: LinkingDishesToTaxProps) => {
  const { data: dishes, isLoading: loadingDishes } = useDishes();
  const { isLoading: catLoading } = useChildCategories();
  const { subCategories } = useCategoryStore((state) => ({
    subCategories: state.subCategories,
  }));
  const { linkingDishes, linkDishes } = useLinkedDishesToTax();
  const { unlinkingDishes, unlinkDishes } = useUnlinkedDishesFromTax();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [initialDishStates, setInitialDishStates] = useState<
    Record<string, boolean>
  >({});

  const isLoading =
    loadingDishes || catLoading || linkingDishes || unlinkingDishes;

  // Process dishes with GST status
  const dishesWithTaxStatus = useMemo<DishWithTaxStatus[]>(() => {
    if (!dishes) return [];

    return dishes.map((dish) => ({
      ...dish,
      hasGst: dish.gst || false,
      originalGst: dish.gst || false,
    }));
  }, [dishes]);

  // Initialize selected dishes and states
  useEffect(() => {
    if (dishesWithTaxStatus.length > 0) {
      const initialStates: Record<string, boolean> = {};
      const initialSelected: string[] = [];

      dishesWithTaxStatus.forEach((dish) => {
        initialStates[dish._id] = dish.hasGst;
        if (dish.hasGst) {
          initialSelected.push(dish._id);
        }
      });

      setInitialDishStates(initialStates);
      setSelectedDishIds(initialSelected);
    }
  }, [dishesWithTaxStatus]);

  // Group dishes by categories
  const groupedDishes = useMemo(() => {
    const groups: { [key: string]: DishWithTaxStatus[] } = {
      "Unlinked Dishes": [],
    };

    // Initialize groups with actual categories
    for (const category of subCategories) {
      groups[category.name] = [];
    }

    // Map dishes to their categories
    for (const dish of dishesWithTaxStatus) {
      let foundCategory = false;
      for (const category of subCategories) {
        if (category.dishIds.includes(dish._id)) {
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
    const filteredGroups: { [key: string]: DishWithTaxStatus[] } = {};
    for (const [categoryName, dishList] of Object.entries(groups)) {
      const filteredList = dishList.filter((dish) =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      if (filteredList.length > 0) {
        filteredGroups[categoryName] = filteredList;
      }
    }

    return filteredGroups;
  }, [dishesWithTaxStatus, subCategories, searchTerm]);

  // Calculate changes
  const changesAnalysis = useMemo(() => {
    const addedDishes: DishWithTaxStatus[] = [];
    const removedDishes: DishWithTaxStatus[] = [];

    dishesWithTaxStatus.forEach((dish) => {
      const isCurrentlySelected = selectedDishIds.includes(dish._id);
      const wasOriginallySelected = initialDishStates[dish._id] || false;

      if (isCurrentlySelected && !wasOriginallySelected) {
        addedDishes.push({ ...dish, isAdded: true });
      } else if (!isCurrentlySelected && wasOriginallySelected) {
        removedDishes.push({ ...dish, isRemoved: true });
      }
    });

    return {
      addedDishes,
      removedDishes,
      hasChanges: addedDishes.length > 0 || removedDishes.length > 0,
      totalChanges: addedDishes.length + removedDishes.length,
    };
  }, [dishesWithTaxStatus, selectedDishIds, initialDishStates]);

  const allFilteredDishes = useMemo(() => {
    return Object.values(groupedDishes).flat();
  }, [groupedDishes]);

  const allFilteredDishesSelected = useMemo(() => {
    if (allFilteredDishes.length === 0) return false;
    return allFilteredDishes.every((dish) =>
      selectedDishIds.includes(dish._id),
    );
  }, [allFilteredDishes, selectedDishIds]);

  const someFilteredDishesSelected = useMemo(() => {
    if (allFilteredDishes.length === 0) return false;
    return (
      allFilteredDishes.some((dish) => selectedDishIds.includes(dish._id)) &&
      !allFilteredDishesSelected
    );
  }, [allFilteredDishes, selectedDishIds, allFilteredDishesSelected]);

  const handleToggleAllDishes = useCallback(() => {
    setSelectedDishIds((prev) => {
      if (allFilteredDishesSelected) {
        // Deselect all filtered dishes
        return prev.filter(
          (id) => !allFilteredDishes.some((dish) => dish._id === id),
        );
      } else {
        // Select all filtered dishes
        const newSelected = new Set(prev);
        allFilteredDishes.forEach((dish) => newSelected.add(dish._id));
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
        selectedDishIds.includes(dish._id),
      );

      setSelectedDishIds((prev) => {
        let newSelected = [...prev];

        if (allSelectedInThisCategory) {
          // Deselect all in this category
          newSelected = newSelected.filter(
            (id) => !dishesInCategory.some((dish) => dish._id === id),
          );
        } else {
          // Select all in this category
          for (const dish of dishesInCategory) {
            if (!newSelected.includes(dish._id)) {
              newSelected.push(dish._id);
            }
          }
        }

        return newSelected;
      });
    },
    [groupedDishes, selectedDishIds],
  );

  const handleRemoveChange = useCallback(
    (dishId: string, type: "added" | "removed") => {
      if (type === "added") {
        // Remove from selected (undo addition)
        setSelectedDishIds((prev) => prev.filter((id) => id !== dishId));
      } else if (type === "removed") {
        // Add back to selected (undo removal)
        setSelectedDishIds((prev) => [...prev, dishId]);
      }
    },
    [],
  );

  const handleSaveChanges = useCallback(async () => {
    try {
      const dishesToLink: string[] = [];
      const dishesToUnlink: string[] = [];

      // Identify changes
      dishesWithTaxStatus.forEach((dish) => {
        const isCurrentlySelected = selectedDishIds.includes(dish._id);
        const wasOriginallySelected = initialDishStates[dish._id] || false;

        if (isCurrentlySelected && !wasOriginallySelected) {
          dishesToLink.push(dish._id);
        } else if (!isCurrentlySelected && wasOriginallySelected) {
          dishesToUnlink.push(dish._id);
        }
      });

      // Execute API calls
      if (dishesToLink.length > 0) {
        const linkPayload: LinkedOrUnlinkedDishesPayload = {
          taxId: getGstTax?._id,
          dishIds: dishesToLink,
        };
        await linkDishes(linkPayload);
      }

      if (dishesToUnlink.length > 0) {
        const unlinkPayload: LinkedOrUnlinkedDishesPayload = {
          taxId: getGstTax?._id,
          dishIds: dishesToUnlink,
        };
        await unlinkDishes(unlinkPayload);
      }

      // Update initial states after successful API calls
      const newInitialStates: Record<string, boolean> = {};
      dishesWithTaxStatus.forEach((dish) => {
        newInitialStates[dish._id] = selectedDishIds.includes(dish._id);
      });
      setInitialDishStates(newInitialStates);

      toast.success(
        `Successfully updated ${
          dishesToLink.length + dishesToUnlink.length
        } dish${dishesToLink.length + dishesToUnlink.length !== 1 ? "es" : ""}`,
      );

      if (onClose) {
        onClose();
      }
    } catch (error) {
      // Error handling is done in the hooks
    }
  }, [
    dishesWithTaxStatus,
    selectedDishIds,
    initialDishStates,
    linkDishes,
    unlinkDishes,
    onClose,
  ]);

  if (isLoading && dishesWithTaxStatus.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl p-6 mx-auto h-[100dvh] pb-[10rem] lg:h-[90dvh] overflow-auto hide-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Link Dishes to GST
        </h3>
        {changesAnalysis.hasChanges && (
          <Badge variant="outline" className="text-blue-600">
            {changesAnalysis.totalChanges} pending changes
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search dishes by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Select All */}
      {allFilteredDishes.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allFilteredDishesSelected}
            indeterminate={someFilteredDishesSelected}
            onCheckedChange={handleToggleAllDishes}
            className="data-[state=checked]:bg-primary"
          />
          <label className="text-sm font-medium text-gray-700 cursor-pointer">
            {allFilteredDishesSelected ? "Deselect All" : "Select All"} (
            {selectedDishIds.length} / {allFilteredDishes.length} filtered)
          </label>
        </div>
      )}

      {/* Dishes by Category */}
      {Object.keys(groupedDishes).length > 0 ? (
        <ScrollArea className="h-[400px] border rounded-lg">
          <div className="p-4 space-y-4">
            {Object.entries(groupedDishes).map(
              ([categoryName, dishesInGroup]) => {
                const isExpanded = expandedCategories.has(categoryName);
                const selectedInThisCategoryCount = dishesInGroup.filter(
                  (dish) => selectedDishIds.includes(dish._id),
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
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={allSelectedInThisCategory}
                          indeterminate={someSelectedInThisCategory}
                          onCheckedChange={() =>
                            toggleSelectAllCategory(categoryName)
                          }
                          onClick={(e) => e.stopPropagation()}
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
                        {dishesInGroup.map((dish) => {
                          const isSelected = selectedDishIds.includes(dish._id);
                          const wasOriginallySelected =
                            initialDishStates[dish._id] || false;
                          const hasChanged =
                            isSelected !== wasOriginallySelected;

                          return (
                            <div
                              key={dish._id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              } ${hasChanged ? "ring-2 ring-blue-200" : ""}`}
                              onClick={() => toggleDishSelection(dish._id)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleDishSelection(dish._id)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-primary"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-primary">
                                    {dish.name}
                                  </p>
                                  {hasChanged && (
                                    <Badge variant="outline">Changed</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  ₹{dish.price}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-12">
          <Utensils className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500">No dishes found.</p>
        </div>
      )}

      {/* Changes Summary */}
      {changesAnalysis.addedDishes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> Newly Added to GST (
            {changesAnalysis.addedDishes.length})
          </h3>
          <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {changesAnalysis.addedDishes.map((dish) => (
                <div
                  key={dish._id}
                  className="relative flex items-center space-x-3 p-4 rounded-xl border-2 border-green-300 bg-white shadow-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{dish.name}</p>
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-100 text-green-800"
                    >
                      ₹{dish.price}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveChange(dish._id, "added")}
                    aria-label={`Remove ${dish.name}`}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {changesAnalysis.removedDishes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-red-700 flex items-center gap-2">
            <MinusCircle className="h-5 w-5" /> Removed from GST (
            {changesAnalysis.removedDishes.length})
          </h3>
          <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {changesAnalysis.removedDishes.map((dish) => (
                <div
                  key={dish._id}
                  className="relative flex items-center space-x-3 p-4 rounded-xl border-2 border-red-300 bg-white shadow-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-red-800">{dish.name}</p>
                    <Badge
                      variant="outline"
                      className="text-xs bg-red-100 text-red-800"
                    >
                      ₹{dish.price}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-green-500"
                    onClick={() => handleRemoveChange(dish._id, "removed")}
                    aria-label={`Undo removal of ${dish.name}`}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {changesAnalysis.addedDishes.length > 0 && (
            <span className="text-green-600">
              +{changesAnalysis.addedDishes.length} to link
            </span>
          )}
          {changesAnalysis.addedDishes.length > 0 &&
            changesAnalysis.removedDishes.length > 0 && (
              <span className="mx-2">•</span>
            )}
          {changesAnalysis.removedDishes.length > 0 && (
            <span className="text-red-600">
              -{changesAnalysis.removedDishes.length} to unlink
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          )}

          <AdvancedBottomButton
            fixed={true}
            maxWidth="30rem"
            buttons={[
              {
                text: "save changes",
                icon: <CheckCircle className="mr-2 h-4 w-4" />,
                onClick: handleSaveChanges,
                className: "w-full",
                disable: isLoading,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

const LinkingDishesToTax = memo(MemoLinkingDishesToTax);
LinkingDishesToTax.displayName = "LinkingDishesToTax";
export default LinkingDishesToTax;
