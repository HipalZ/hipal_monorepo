import { memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Plus, Info } from "lucide-react";
import {
  useFetchTaxesByBusiness,
  useGetAllTaxes,
  type TaxById,
} from "@/hooks/useTax";
import LoadingSpinner from "@/components/atom/loadingSpinner/index.tsx";
import PopUp from "@/components/atom/popUp/index.tsx";
import LinkingDishesToTax from "./linkingDishesToTax.tsx";
import { useTaxStore } from "@/components/store/useTaxStore.ts";

interface TaxListProps {
  onEditTax: (tax: TaxById, type?: string) => void;
  onAddTax: () => void;
}

const MemoTaxList = ({ onEditTax, onAddTax }: TaxListProps) => {
  const { isLoading: loadingBusinessTaxes, businessTaxes } =
    useFetchTaxesByBusiness();
  const { isLoading: loadingAllTaxes, taxes: allTaxes } = useGetAllTaxes();
  const setLinkDishModal = useTaxStore((s) => s.setLinkDishModal);
  const linkDishModal = useTaxStore((s) => s.linkDishModal);
  const selectedTaxId = useTaxStore((s) => s.selectedTaxId);
  const setSelectedTaxId = useTaxStore((s) => s.setSelectedTaxId);

  const isLoading = loadingBusinessTaxes || loadingAllTaxes;

  const activeTaxes = useMemo(
    () => businessTaxes?.filter((tax) => tax.isActive) || [],
    [businessTaxes],
  );

  const inactiveTaxes = useMemo(
    () => businessTaxes?.filter((tax) => !tax.isActive) || [],
    [businessTaxes],
  );

  const getSelectedTax = useMemo(() => {
    if (!selectedTaxId || !businessTaxes) return null;
    return (
      businessTaxes.find((tax) => tax._id === selectedTaxId && tax.isActive) ||
      null
    );
  }, [businessTaxes, selectedTaxId]);

  const availableTaxesToAdd = useMemo(() => {
    if (!allTaxes || !businessTaxes) return 0;
    const added = new Set(businessTaxes.map((t) => t.name));
    return allTaxes.filter((t) => !added.has(t.name)).length;
  }, [allTaxes, businessTaxes]);

  const handleEditClick = useCallback(
    (tax: TaxById) => onEditTax(tax, "edit"),
    [onEditTax],
  );

  const openModalFunc = useCallback(
    (tax: TaxById) => {
      setSelectedTaxId(tax._id);
      onEditTax(tax, "link");
    },
    [onEditTax, setSelectedTaxId],
  );

  const closeModalFunc = useCallback(
    () => setLinkDishModal(false),
    [setLinkDishModal],
  );

  const handleAddTaxClick = useCallback(() => {
    if (availableTaxesToAdd > 0) onAddTax();
  }, [availableTaxesToAdd, onAddTax]);

  const renderTaxCard = useCallback(
    (tax: TaxById, index: number) => {
      // only allow linking when this is an active GST or VAT tax:
      // const canLinkDishes = tax.isActive && /(gst|vat)/i.test(tax.name);
      const canLinkDishes = tax.isActive && /(gst)/i.test(tax.name);


      return (
        <Card key={tax._id} className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{tax.name}</span>
              <Badge variant="secondary">
                {tax.value}
                {tax.type === "PERCENTAGE" ? "%" : "₹"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-end space-x-2">
            {canLinkDishes && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModalFunc(tax)}
              >
                Link Dishes
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(tax)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      );
    },
    [openModalFunc, handleEditClick],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Tax Management</h2>
        <Button
          onClick={handleAddTaxClick}
          disabled={availableTaxesToAdd === 0}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Tax
        </Button>
      </div>

      {/* Info */}
      {availableTaxesToAdd > 0 && (
        <Alert className="mb-4">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription>
            You can add {availableTaxesToAdd} more tax type
            {availableTaxesToAdd !== 1 ? "s" : ""} to your business. VAT/GST
            taxes will have values auto-extracted from their names.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Taxes */}
      {activeTaxes.length > 0 && (
        <section className="mt-4">
          <h3 className="text-md font-semibold mb-2">
            Active Taxes ({activeTaxes.length})
          </h3>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
            {activeTaxes.map(renderTaxCard)}
          </section>
        </section>
      )}

      {/* Inactive Taxes */}
      {inactiveTaxes.length > 0 && (
        <section className="mt-4">
          <h3 className="text-md font-semibold mb-2">
            Inactive Taxes ({inactiveTaxes.length})
          </h3>
          {inactiveTaxes.map(renderTaxCard)}
        </section>
      )}

      {/* Empty State */}
      {activeTaxes.length === 0 && inactiveTaxes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No taxes configured</p>
          {availableTaxesToAdd > 0 ? (
            <p className="mt-2 text-sm">
              Get started by adding your first tax. VAT/GST taxes will have
              values auto-extracted.
            </p>
          ) : (
            <p className="mt-2 text-sm">
              No tax types are available to add. Contact support for assistance.
            </p>
          )}
          {availableTaxesToAdd > 0 && (
            <Button className="mt-4" onClick={handleAddTaxClick}>
              Add Your First Tax
            </Button>
          )}
        </div>
      )}

      {/* Link Dishes Modal */}
      {linkDishModal && getSelectedTax && (
        <PopUp
          show={linkDishModal}
          hide
          height="h-[100dvh] lg:h-[90dvh]"
          onClose={closeModalFunc}
          rightTopBack
        >
          <LinkingDishesToTax
            getSelectedTax={getSelectedTax}
            onClose={closeModalFunc}
          />
        </PopUp>
      )}
    </>
  );
};

const TaxList = memo(MemoTaxList);
TaxList.displayName = "TaxList";
export default TaxList;
