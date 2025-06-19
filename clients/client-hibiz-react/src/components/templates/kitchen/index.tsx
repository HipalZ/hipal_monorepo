import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Plus } from "lucide-react";
import LoadingSpinner from "@/components/atom/loadingSpinner"; // Assuming you have this
import { type KitchenData, useGetAllKitchens } from "@/hooks/useKItchenHook.ts";
import KitchenCard from "./kitchen-card.tsx";
import KitchenDetailsModal from "./kitchen-details-modal.tsx";
import KitchenFormModal from "./kitchen-form-modal.tsx";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";

export default function KitchenPage() {
  const { kitchenData, kitchenLoading } = useGetAllKitchens();

  const [selectedKitchen, setSelectedKitchen] = useState<KitchenData | null>(
    null,
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState<KitchenData | null>(
    null,
  );

  const handleAddKitchen = useCallback(() => {
    setEditingKitchen(null);
    setIsFormModalOpen(true);
  }, []);

  const handleViewKitchen = useCallback((kitchen: KitchenData) => {
    setSelectedKitchen(kitchen);
    setIsDetailsModalOpen(true);
  }, []);

  const handleEditKitchen = useCallback((kitchen: KitchenData) => {
    setSelectedKitchen(null);
    setIsDetailsModalOpen(false);
    setEditingKitchen(kitchen);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedKitchen(null);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingKitchen(null);
  }, []);

  return (
    <div className="pb-[4rem]">
      <main className="p-4 md:p-6 lg:p-0">
        <h1 className="text-2xl mb-4 mt-4 font-semibold text-gray-800">Kitchens</h1>

        {kitchenLoading && <LoadingSpinner />}

        {!kitchenLoading && kitchenData && kitchenData.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No Kitchens Found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first kitchen.
            </p>
            <Button
              onClick={handleAddKitchen}
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              Add Your First Kitchen
            </Button>
          </div>
        )}

        {!kitchenLoading && kitchenData && kitchenData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4">
            {kitchenData.map((kitchen) => (
              <KitchenCard
                key={kitchen._id}
                kitchen={kitchen}
                onViewDetails={() => handleViewKitchen(kitchen)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedKitchen && isDetailsModalOpen && (
        <KitchenDetailsModal
          kitchenId={selectedKitchen._id}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          onEdit={() => handleEditKitchen(selectedKitchen)}
        />
      )}

      {isFormModalOpen && (
        <KitchenFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          existingKitchen={editingKitchen}
        />
      )}

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Add Kitchen",
            icon: <Plus className="mr-2 h-4 w-4" />,
            onClick: handleAddKitchen,
            className: "w-full",
          },
        ]}
      />
    </div>
  );
}
