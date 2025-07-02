import { memo, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import MemoizedHeader from "@/components/molecules/header/index.tsx";
import type { TaxById } from "@/hooks/useTax.ts";
import TaxList from "./TaxList.tsx";
import TaxForm from "./TaxForm.tsx";
import { useTaxStore } from "@/components/store/useTaxStore.ts";
export type TaxTypeModal = "edit" | "link";
const MemoAddTax = () => {
  const { businessId, menuId } = useParams<{
    businessId: string;
    menuId: string;
  }>();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxById | null>(null);
  const setLinkDishModal = useTaxStore((s) => s.setLinkDishModal);
  const handleAddTax = useCallback(() => {
    setEditingTax(null);
    setIsFormOpen(true);
  }, []);

  const handleEditTax = useCallback(
    (tax: TaxById, type: TaxTypeModal) => {
      console.log("Editing tax:", tax, type);
      setEditingTax(tax);
      if (type === "link") {
        setLinkDishModal(true);
      }
      if (type === "edit") {
        setIsFormOpen(true);
      }
    },
    [setLinkDishModal],
  );

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTax(null);
  }, []);

  if (!businessId || !menuId) {
    return (
      <main>
        <article className="linear_gradient_background">
          <MemoizedHeader title="Add Tax" />
          <div className="p-4">
            <div className="text-center text-red-500">
              Missing business ID or menu ID. Please check your URL parameters.
            </div>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main>
      <article className="linear_gradient_background">
        <MemoizedHeader title="Tax Management" />
      </article>
      <div className="p-4 space-y-6">
        <TaxList onEditTax={handleEditTax} onAddTax={handleAddTax} />
      </div>

      <TaxForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingTax={editingTax}
        businessId={businessId}
        menuId={menuId}
      />
    </main>
  );
};

const AddTax = memo(MemoAddTax);
AddTax.displayName = "AddTax";
export default AddTax;
