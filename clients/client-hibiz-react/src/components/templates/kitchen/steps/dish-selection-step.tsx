import { memo, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDishesStore } from "@/components/store/useDishesStore.ts";
import type { DishType } from "@hi/db-models/src/validators";
import {
  Utensils,
  PlusCircle,
  CheckCircle,
  MinusCircle,
  XCircle,
} from "lucide-react";
import DishLinkModal from "../dish-link-modal.tsx";

interface DishSelectionStepProps {
  formData: {
    selectedDishIds: string[];
    removeDishIds?: string[];
  };
  updateFormData: (
    updates: Partial<{ selectedDishIds: string[]; removeDishIds: string[] }>,
  ) => void;
  initialKitchenDishIds?: string[];
}

function DishSelectionStepComponent({
  formData,
  updateFormData,
  initialKitchenDishIds,
}: DishSelectionStepProps) {
  const { dishes } = useDishesStore();
  const [isDishLinkModalOpen, setIsDishLinkModalOpen] = useState(false);

  const selectedDishesDetails = useMemo(() => {
    return dishes.filter((dish) => formData.selectedDishIds.includes(dish._id));
  }, [dishes, formData.selectedDishIds]);

  const addedDishes = useMemo(() => {
    if (!initialKitchenDishIds) return [];
    const initialSet = new Set(initialKitchenDishIds);
    return selectedDishesDetails.filter((dish) => !initialSet.has(dish._id));
  }, [selectedDishesDetails, initialKitchenDishIds]);

  const removedDishes = useMemo(() => {
    if (!initialKitchenDishIds) return [];
    const currentSelectedSet = new Set(formData.selectedDishIds);
    return dishes.filter(
      (dish) =>
        initialKitchenDishIds.includes(dish._id) &&
        !currentSelectedSet.has(dish._id),
    );
  }, [dishes, formData.selectedDishIds, initialKitchenDishIds]);

  const handleOpenDishLinkModal = useCallback(() => {
    setIsDishLinkModalOpen(true);
  }, []);

  const handleCloseDishLinkModal = useCallback(() => {
    setIsDishLinkModalOpen(false);
  }, []);

  const handleSaveLinkedDishes = useCallback(
    (newSelectedIds: string[]) => {
      const currentDishIdsSet = new Set(formData.selectedDishIds);
      const newlyRemovedIds = Array.from(currentDishIdsSet).filter(
        (id) => !newSelectedIds.includes(id),
      );

      updateFormData({
        selectedDishIds: newSelectedIds,
        removeDishIds: newlyRemovedIds,
      });
    },
    [formData.selectedDishIds, updateFormData],
  );

  const handleRemoveDish = useCallback(
    (dishId: string, type: "added" | "removed") => {
      if (type === "added") {
        const newSelectedDishIds = formData.selectedDishIds.filter(
          (id) => id !== dishId,
        );
        updateFormData({ selectedDishIds: newSelectedDishIds });
      } else if (type === "removed") {
        const newSelectedDishIds = [...formData.selectedDishIds, dishId];
        const newRemoveDishIds =
          formData.removeDishIds?.filter((id) => id !== dishId) || [];
        updateFormData({
          selectedDishIds: newSelectedDishIds,
          removeDishIds: newRemoveDishIds,
        });
      }
    },
    [formData.selectedDishIds, formData.removeDishIds, updateFormData],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Linked Dishes</h3>
        <Button onClick={handleOpenDishLinkModal} className="bg-primary">
          <PlusCircle className="mr-2 h-5 w-5" />
          Link Dishes
        </Button>
      </div>

      {selectedDishesDetails.length > 0 ? (
        <div className="border-2 rounded-xl p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 hide-scrollbar overflow-y-auto">
            {selectedDishesDetails.map((dish: DishType) => (
              <div
                key={dish._id}
                className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 bg-white shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{dish.name}</p>
                    {dish.price && (
                      <Badge variant="outline" className="text-xs">
                        ₹{dish.price}
                      </Badge>
                    )}
                  </div>
                 
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No dishes linked to this kitchen yet.</p>
          <Button
            onClick={handleOpenDishLinkModal}
            variant="outline"
            className="mt-4"
          >
            Link Dishes Now
          </Button>
        </div>
      )}

      {initialKitchenDishIds && addedDishes.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> Newly Added Dishes (
            {addedDishes.length})
          </h3>
          <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 hide-scrollbar overflow-y-auto">
              {addedDishes.map((dish: DishType) => (
                <div
                  key={dish._id}
                  className="relative flex items-center space-x-3 p-4 rounded-xl border-2 border-green-300 bg-white shadow-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{dish.name}</p>
                    {dish.price && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        ₹{dish.price}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveDish(dish._id, "added")}
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

      {initialKitchenDishIds && removedDishes.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-red-700 flex items-center gap-2">
            <MinusCircle className="h-5 w-5" /> Removed Dishes (
            {removedDishes.length})
          </h3>
          <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 hide-scrollbar overflow-y-auto">
              {removedDishes.map((dish: DishType) => (
                <div
                  key={dish._id}
                  className="relative flex items-center space-x-3 p-4 rounded-xl border-2 border-red-300 bg-white shadow-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-red-800">{dish.name}</p>
                    {dish.price && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-red-100 text-red-800"
                      >
                        ₹{dish.price}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-green-500"
                    onClick={() => handleRemoveDish(dish._id, "removed")}
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

      {isDishLinkModalOpen && (
        <DishLinkModal
          isOpen={isDishLinkModalOpen}
          onClose={handleCloseDishLinkModal}
          initialSelectedDishIds={formData.selectedDishIds}
          onSave={handleSaveLinkedDishes}
        />
      )}
    </div>
  );
}

export default memo(DishSelectionStepComponent);
