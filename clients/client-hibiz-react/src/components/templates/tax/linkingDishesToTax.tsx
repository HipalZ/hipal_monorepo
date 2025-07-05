import { memo, useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Utensils,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  MinusCircle,
  Percent,
  ArrowRight,
  Zap,
  Filter,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDishes } from "@/hooks/useDish.ts";
import {
  type TaxById,
  useLinkedDishesToTax,
  useUnlinkedDishesFromTax,
  type LinkedOrUnlinkedDishesPayload,
  useFetchTaxesByBusiness,
  useGetAllTaxes,
} from "@/hooks/useTax";
import { useChildCategories } from "@/hooks/useCategory.ts";
import { useCategoryStore } from "@/components/store/useCategoryStore.ts";
import type { DishType } from "@hi/db-models/src/validators";
import LoadingSpinner from "@/components/atom/loadingSpinner/index.tsx";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";

interface DishWithTaxStatus extends DishType {
  hasGst: boolean;
  originalGst: boolean;
  currentGstRate?: number;
  currentGstTaxId?: string;
  currentGstTaxName?: string;
  newGstRate?: number;
  isChanging?: boolean;
}

interface LinkingDishesToTaxProps {
  onClose?: () => void;
  getSelectedTax?: TaxById; // Changed from getGstTax
}

const MemoLinkingDishesToTax = ({
  onClose,
  getSelectedTax,
}: LinkingDishesToTaxProps) => {
  const { data: dishes, isLoading: loadingDishes } = useDishes();
  const { isLoading: catLoading } = useChildCategories();
  const { isLoading: loadingAllTaxes, taxes: allTaxes } = useGetAllTaxes();
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
  const [expandedGstGroups, setExpandedGstGroups] = useState<Set<string>>(
    new Set(),
  );
  const [initialDishStates, setInitialDishStates] = useState<
    Record<string, string | null>
  >({}); // Store tax ID instead of boolean
  const [activeTab, setActiveTab] = useState("gst-filter");

  const isLoading =
    loadingDishes ||
    catLoading ||
    linkingDishes ||
    unlinkingDishes ||
    loadingAllTaxes;

  // Extract GST rate from tax name
  const extractGstRate = useCallback((taxName: string): number | null => {
    // look for: gst (28%)  —  case‐insensitive, with optional spaces
    const gstMatch = taxName.match(/gst\s*\(\s*(\d+(?:\.\d+)?)\s*%\s*\)/i);
    return gstMatch ? Number.parseFloat(gstMatch[1]) : null;
  }, []);

  // Get all GST taxes with their rates (from both business and all taxes)
  const allGstTaxes = useMemo(() => {
    if (!allTaxes) return [];
    return allTaxes
      .filter((tax) => tax.name.toLowerCase().includes("gst"))
      .map((tax) => ({
        ...tax,
        rate: extractGstRate(tax.name) || 0,
      }))
      .sort((a, b) => a.rate - b.rate);
  }, [allTaxes, extractGstRate]);

  const dishesWithTaxStatus = useMemo<DishWithTaxStatus[]>(() => {
    if (!dishes || !allGstTaxes.length) return [];

    return dishes.map((dish) => {
      const gstTax = dish.gst
        ? allGstTaxes.find((tax) => tax.rate === dish.gst)
        : undefined;

      const currentGstRate = gstTax?.rate;
      const currentGstTaxId = gstTax?._id;
      const currentGstTaxName = gstTax?.name;

      const newGstRate = getSelectedTax?.value;

      return {
        ...dish,

        hasGst: !!dish.gst,
        originalGst: dish.gst ?? null,

        currentGstRate,
        currentGstTaxId,
        currentGstTaxName,

        newGstRate,
        isChanging: newGstRate !== undefined && newGstRate !== currentGstRate,
      };
    });
  }, [dishes, allGstTaxes, getSelectedTax]);

  useEffect(() => {
    if (dishesWithTaxStatus.length > 0) {
      const initialStates: Record<string, string | null> = {};
      const initialSelected: string[] = [];

      for (const dish of dishesWithTaxStatus) {
        // Store the current tax ID (or null if no GST)
        initialStates[dish._id] = dish.currentGstTaxId || null;

        // Select dishes that already have the target GST rate
        if (dish.currentGstTaxId === getSelectedTax?._id) {
          initialSelected.push(dish._id);
        }
      }

      setInitialDishStates(initialStates);
      setSelectedDishIds(initialSelected);
    }
  }, [dishesWithTaxStatus, getSelectedTax]);
  const dishesByGstRate = useMemo(() => {
    const groups: { [key: string]: DishWithTaxStatus[] } = {};

    groups["No GST"] = [];
    for (const tax of allGstTaxes) {
      groups[`${tax.name} (${tax.rate}%)`] = [];
    }

    const filteredDishes = dishesWithTaxStatus.filter((dish) =>
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    for (const dish of filteredDishes) {
      if (!dish.hasGst || !dish.currentGstTaxName) {
        groups["No GST"].push(dish);
      } else {
        const groupKey = `${dish.currentGstTaxName} (${dish.currentGstRate}%)`;
        if (groups[groupKey]) {
          groups[groupKey].push(dish);
        }
      }
    }

    return Object.fromEntries(
      Object.entries(groups).filter(([, dishes]) => dishes.length > 0),
    );
  }, [dishesWithTaxStatus, allGstTaxes, searchTerm]);

  const groupedDishes = useMemo(() => {
    const groups: { [key: string]: DishWithTaxStatus[] } = {
      "Unlinked Dishes": [],
    };

    for (const category of subCategories) {
      groups[category.name] = [];
    }

    const filteredDishes = dishesWithTaxStatus.filter((dish) =>
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Map dishes to their categories
    for (const dish of filteredDishes) {
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

    return Object.fromEntries(
      Object.entries(groups).filter(([, dishes]) => dishes.length > 0),
    );
  }, [dishesWithTaxStatus, subCategories, searchTerm]);

  const changesAnalysis = useMemo(() => {
    const changingDishes: DishWithTaxStatus[] = [];
    const addingGst: DishWithTaxStatus[] = [];
    const removingGst: DishWithTaxStatus[] = [];
    const switchingGst: DishWithTaxStatus[] = [];

    for (const dish of dishesWithTaxStatus) {
      const isCurrentlySelected = selectedDishIds.includes(dish._id);
      const originalTaxId = initialDishStates[dish._id];

      // Determine what will happen to this dish
      const willHaveTargetTax = isCurrentlySelected;
      const currentlyHasTargetTax = originalTaxId === getSelectedTax?._id;

      if (willHaveTargetTax !== currentlyHasTargetTax) {
        if (willHaveTargetTax) {
          // Will get the target GST rate
          if (!dish.hasGst) {
            addingGst.push({ ...dish, isChanging: true });
          } else {
            switchingGst.push({ ...dish, isChanging: true });
          }
        } else {
          // Will lose the target GST (but might keep another GST)
          if (dish.currentGstTaxId === getSelectedTax?._id) {
            removingGst.push({ ...dish, isChanging: true });
          }
        }
        changingDishes.push({ ...dish, isChanging: true });
      }
    }

    return {
      changingDishes,
      addingGst,
      removingGst,
      switchingGst,
      hasChanges: changingDishes.length > 0,
      totalChanges: changingDishes.length,
    };
  }, [dishesWithTaxStatus, selectedDishIds, initialDishStates, getSelectedTax]);

  const toggleGstGroupExpansion = useCallback((groupName: string) => {
    setExpandedGstGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  }, []);

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

  const toggleSelectAllInGstGroup = useCallback(
    (groupName: string) => {
      const dishesInGroup = dishesByGstRate[groupName] || [];
      const allSelectedInThisGroup = dishesInGroup.every((dish) =>
        selectedDishIds.includes(dish._id),
      );

      setSelectedDishIds((prev) => {
        let newSelected = [...prev];

        if (allSelectedInThisGroup) {
          newSelected = newSelected.filter(
            (id) => !dishesInGroup.some((dish) => dish._id === id),
          );
        } else {
          for (const dish of dishesInGroup) {
            if (!newSelected.includes(dish._id)) {
              newSelected.push(dish._id);
            }
          }
        }

        return newSelected;
      });
    },
    [dishesByGstRate, selectedDishIds],
  );

  const toggleSelectAllInCategory = useCallback(
    (categoryName: string) => {
      const dishesInCategory = groupedDishes[categoryName] || [];
      const allSelectedInThisCategory = dishesInCategory.every((dish) =>
        selectedDishIds.includes(dish._id),
      );

      setSelectedDishIds((prev) => {
        let newSelected = [...prev];

        if (allSelectedInThisCategory) {
          newSelected = newSelected.filter(
            (id) => !dishesInCategory.some((dish) => dish._id === id),
          );
        } else {
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

  const handleSaveChanges = useCallback(async () => {
    try {
      const dishesToLink: string[] = [];
      const dishesToUnlink: string[] = [];

      for (const dish of dishesWithTaxStatus) {
        const isCurrentlySelected = selectedDishIds.includes(dish._id);
        const originalTaxId = initialDishStates[dish._id];
        const currentlyHasTargetTax = originalTaxId === getSelectedTax?._id;

        if (isCurrentlySelected && !currentlyHasTargetTax) {
          dishesToLink.push(dish._id);
        } else if (!isCurrentlySelected && currentlyHasTargetTax) {
          dishesToUnlink.push(dish._id);
        }
      }

      if (dishesToLink.length > 0) {
        const linkPayload: LinkedOrUnlinkedDishesPayload = {
          taxId: getSelectedTax?._id,
          dishIds: dishesToLink,
        };
        await linkDishes(linkPayload);
      }

      if (dishesToUnlink.length > 0) {
        const unlinkPayload: LinkedOrUnlinkedDishesPayload = {
          taxId: getSelectedTax?._id,
          dishIds: dishesToUnlink,
        };
        await unlinkDishes(unlinkPayload);
      }

      // Update initial states
      const newInitialStates: Record<string, string | null> = {};
      for (const dish of dishesWithTaxStatus) {
        if (selectedDishIds.includes(dish._id)) {
          newInitialStates[dish._id] = getSelectedTax?._id || null;
        } else {
          newInitialStates[dish._id] = dish.currentGstTaxId || null;
        }
      }
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
      console.error(error);
    }
  }, [
    dishesWithTaxStatus,
    selectedDishIds,
    initialDishStates,
    linkDishes,
    unlinkDishes,
    onClose,
    getSelectedTax,
  ]);

  if (isLoading && dishesWithTaxStatus.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const renderDishCard = (dish: DishWithTaxStatus) => {
    const isSelected = selectedDishIds.includes(dish._id);
    const originalTaxId = initialDishStates[dish._id];
    const willHaveTargetTax = isSelected;
    const currentlyHasTargetTax = originalTaxId === getSelectedTax?._id;
    const hasChanged = willHaveTargetTax !== currentlyHasTargetTax;

    const getCurrentGstBadge = () => {
      if (!dish.hasGst) {
        return <Badge variant="outline">No GST</Badge>;
      }
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Percent className="h-3 w-3 mr-1" />
          {dish.currentGstRate}%
        </Badge>
      );
    };

    const getTargetGstBadge = () => {
      if (!isSelected) {
        return <Badge variant="outline">Will Remove</Badge>;
      }
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <Percent className="h-3 w-3 mr-1" />
          {getSelectedTax?.value}%
        </Badge>
      );
    };

    const getChangeType = () => {
      if (!hasChanged) return null;

      if (isSelected && !dish.hasGst) {
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Zap className="h-3 w-3 mr-1" />
            Adding GST
          </Badge>
        );
      }

      if (
        isSelected &&
        dish.hasGst &&
        dish.currentGstRate !== getSelectedTax?.value
      ) {
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <ArrowRight className="h-3 w-3 mr-1" />
            Switching GST
          </Badge>
        );
      }

      if (!isSelected && dish.currentGstTaxId === getSelectedTax?._id) {
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <MinusCircle className="h-3 w-3 mr-1" />
            Removing GST
          </Badge>
        );
      }

      return null;
    };

    return (
      <Card
        key={dish._id}
        className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
          isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-gray-50"
        } ${hasChanged ? "border-l-4 border-l-blue-500" : ""}`}
        onClick={() => toggleDishSelection(dish._id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleDishSelection(dish._id)}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-primary mt-1"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{dish.name}</h4>
                <span className="font-semibold text-gray-900">
                  ₹{dish.price}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Current:</span>
                {getCurrentGstBadge()}
                {hasChanged && (
                  <>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Will be:</span>
                    {getTargetGstBadge()}
                  </>
                )}
              </div>

              {hasChanged && (
                <div className="flex items-center gap-2">{getChangeType()}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl p-6 mx-auto h-[100dvh] pb-[10rem] lg:h-[90dvh] overflow-auto hide-scrollbar">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">GST Management</h3>
            <p className="text-gray-600">Assign dishes to GST rates</p>
          </div>
          {changesAnalysis.hasChanges && (
            <Badge variant="outline" className="text-blue-600 px-3 py-1">
              {changesAnalysis.totalChanges} pending changes
            </Badge>
          )}
        </div>

        {/* Target Tax Info */}
        {getSelectedTax && (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-2">
                <span>Target Tax Rate:</span>
                <Badge variant="default" className="bg-primary ">
                  <Percent className="h-3 w-3 mr-1" />
                  {getSelectedTax.name}
                </Badge>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                Select dishes to assign this tax rate. You can move dishes from
                other tax rates or add tax to dishes that don't have it.
              </p>
            </AlertDescription>
          </Alert>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gst-filter" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter by GST Rate
          </TabsTrigger>
          <TabsTrigger
            value="category-filter"
            className="flex items-center gap-2"
          >
            <Utensils className="h-4 w-4" />
            Filter by Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gst-filter" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            View dishes grouped by their current GST rates. Select dishes to
            move them to <strong>{getSelectedTax?.name}</strong>.
          </div>

          {Object.keys(dishesByGstRate).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(dishesByGstRate).map(
                ([gstGroup, dishesInGroup]) => {
                  const isExpanded = expandedGstGroups.has(gstGroup);
                  const selectedInThisGroupCount = dishesInGroup.filter(
                    (dish) => selectedDishIds.includes(dish._id),
                  ).length;
                  const totalInThisGroup = dishesInGroup.length;
                  const allSelectedInThisGroup =
                    totalInThisGroup > 0 &&
                    selectedInThisGroupCount === totalInThisGroup;
                  const someSelectedInThisGroup =
                    selectedInThisGroupCount > 0 &&
                    selectedInThisGroupCount < totalInThisGroup;

                  return (
                    <Card key={gstGroup} className="overflow-hidden">
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50 transition-colors pb-3"
                        onClick={() => toggleGstGroupExpansion(gstGroup)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={allSelectedInThisGroup}
                              indeterminate={someSelectedInThisGroup}
                              onCheckedChange={() =>
                                toggleSelectAllInGstGroup(gstGroup)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="data-[state=checked]:bg-primary"
                            />
                            <div className="flex items-center gap-2">
                              {gstGroup === "No GST" ? (
                                <MinusCircle className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Percent className="h-5 w-5 text-green-600" />
                              )}
                              <div>
                                <CardTitle className="text-lg text-gray-800">
                                  {gstGroup?.slice(0, 9)}
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                  {selectedInThisGroupCount} of{" "}
                                  {totalInThisGroup} dishes selected
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {totalInThisGroup} dishes
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dishesInGroup.map((dish) => renderDishCard(dish))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                },
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Filter className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  No dishes found matching your search.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="category-filter" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            View dishes grouped by categories. Select dishes to assign{" "}
            <strong>{getSelectedTax?.name}</strong>.
          </div>

          {Object.keys(groupedDishes).length > 0 ? (
            <div className="space-y-4">
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
                    <Card key={categoryName} className="overflow-hidden">
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50 transition-colors pb-3"
                        onClick={() => toggleCategoryExpansion(categoryName)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={allSelectedInThisCategory}
                              indeterminate={someSelectedInThisCategory}
                              onCheckedChange={() =>
                                toggleSelectAllInCategory(categoryName)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="data-[state=checked]:bg-primary"
                            />
                            <div>
                              <CardTitle className="text-lg text-gray-800">
                                {categoryName}
                              </CardTitle>
                              <p className="text-sm text-gray-500">
                                {selectedInThisCategoryCount} of{" "}
                                {totalInThisCategory} dishes selected
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {totalInThisCategory} dishes
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dishesInGroup.map((dish) => renderDishCard(dish))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                },
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Utensils className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  No dishes found matching your search.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Changes Summary */}
      {changesAnalysis.hasChanges && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Summary of Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {changesAnalysis.addingGst.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  +{changesAnalysis.addingGst.length}
                </Badge>
                <span>dishes will get GST {getSelectedTax?.value}%</span>
              </div>
            )}
            {changesAnalysis.switchingGst.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800"
                >
                  ↔{changesAnalysis.switchingGst.length}
                </Badge>
                <span>dishes will switch to GST {getSelectedTax?.value}%</span>
              </div>
            )}
            {changesAnalysis.removingGst.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  -{changesAnalysis.removingGst.length}
                </Badge>
                <span>
                  dishes will have GST {getSelectedTax?.value}% removed
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {changesAnalysis.hasChanges ? (
            <span>Ready to apply {changesAnalysis.totalChanges} changes</span>
          ) : (
            <span>No changes to apply</span>
          )}
        </div>

        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <AdvancedBottomButton
            fixed={false}
            maxWidth="30rem"
            buttons={[
              {
                text: changesAnalysis.hasChanges
                  ? "Apply Changes"
                  : "No Changes",
                icon: <CheckCircle className="mr-2 h-4 w-4" />,
                onClick: handleSaveChanges,
                className: changesAnalysis.hasChanges
                  ? "bg-primary hover:bg-primary/90 w-full"
                  : "w-full",
                disable: !changesAnalysis.hasChanges || isLoading,
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