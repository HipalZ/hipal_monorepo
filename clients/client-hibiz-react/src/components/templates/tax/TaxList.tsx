import { memo, useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Edit,
  Percent,
  DollarSign,
  Plus,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  useFetchTaxesByBusiness,
  useGetAllTaxes,
  type TaxById,
} from "@/hooks/useTax";
import LoadingSpinner from "@/components/atom/loadingSpinner/index.tsx";
import PopUp from "@/components/atom/popUp/index.tsx";
import LinkingDishesToTax from "./linkingDishesToTax.tsx";

interface TaxListProps {
  onEditTax: (tax: TaxById) => void;
  onAddTax: () => void;
}

const MemoTaxList = ({ onEditTax, onAddTax }: TaxListProps) => {
  const { isLoading: loadingBusinessTaxes, businessTaxes } =
    useFetchTaxesByBusiness();
  const { isLoading: loadingAllTaxes, taxes: allTaxes } = useGetAllTaxes();
  const [linkDishModal, setLinkDishModal] = useState<boolean>(false);

  const isLoading = loadingBusinessTaxes || loadingAllTaxes;

  const activeTaxes = useMemo(() => {
    return businessTaxes?.filter((tax) => tax.isActive) || [];
  }, [businessTaxes]);

  const getGstTax = useMemo(() => {
    return businessTaxes?.find((tax) => tax.name === "gst") || null;
  }, [businessTaxes]);

  const inactiveTaxes = useMemo(() => {
    return businessTaxes?.filter((tax) => !tax.isActive) || [];
  }, [businessTaxes]);

  // Check if there are any taxes available to add
  const availableTaxesToAdd = useMemo(() => {
    if (!allTaxes || !businessTaxes) return 0;
    const addedTaxNames = new Set(businessTaxes.map((tax) => tax.name));
    return allTaxes.filter((tax) => !addedTaxNames.has(tax.name)).length;
  }, [allTaxes, businessTaxes]);

  const handleEditClick = useCallback(
    (tax: TaxById) => {
      onEditTax(tax);
    },
    [onEditTax],
  );

  const openModalFunc = useCallback(() => {
    setLinkDishModal(true);
  }, []);

  const closeModalFunc = useCallback(() => {
    setLinkDishModal(false);
  }, []);

  const handleAddTaxClick = useCallback(() => {
    if (availableTaxesToAdd === 0) {
      return; // Button should be disabled, but just in case
    }
    onAddTax();
  }, [availableTaxesToAdd, onAddTax]);

  const renderTaxCard = useCallback(
    (tax: TaxById, index: number) => (
      <div key={tax._id}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {tax.type === "PERCENTAGE" ? (
                <Percent className="h-4 w-4 text-blue-500" />
              ) : (
                <DollarSign className="h-4 w-4 text-green-500" />
              )}
              <span className="font-medium">{tax.name}</span>
            </div>
            <Badge variant={tax.isActive ? "default" : "secondary"}>
              {tax.value}
              {tax.type === "PERCENTAGE" ? "%" : "₹"}
            </Badge>
            {!tax.isActive && <Badge variant="outline">Inactive</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {tax.name === "gst" && (
              <Button onClick={openModalFunc} variant="outline" size="sm">
                Link Dishes
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(tax)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {index < activeTaxes.length - 1 && (
          <hr className="my-4 border-t-2 border-gray-200" />
        )}
      </div>
    ),
    [handleEditClick],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tax Management</h2>
          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={handleAddTaxClick}
              className="flex items-center gap-2"
              disabled={availableTaxesToAdd === 0}
            >
              <Plus className="h-4 w-4" />
              Add Tax
            </Button>
            {availableTaxesToAdd === 0 &&
              businessTaxes &&
              businessTaxes.length > 0 && (
                <span className="text-xs text-gray-500">
                  All available taxes added
                </span>
              )}
          </div>
        </div>

        {/* Available taxes counter */}
        {availableTaxesToAdd > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You can add {availableTaxesToAdd} more tax type
              {availableTaxesToAdd !== 1 ? "s" : ""} to your business.
            </AlertDescription>
          </Alert>
        )}

        {/* Active Taxes */}
        {activeTaxes.length > 0 && (
          <Card className="max-w-[30rem]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Active Taxes</span>
                <Badge variant="default">{activeTaxes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {activeTaxes.map(renderTaxCard)}
            </CardContent>
          </Card>
        )}

        {/* Inactive Taxes */}
        {inactiveTaxes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Inactive Taxes</span>
                <Badge variant="secondary">{inactiveTaxes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inactiveTaxes.map(renderTaxCard)}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {activeTaxes.length === 0 && inactiveTaxes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No taxes configured
              </h3>
              <p className="text-gray-500 mb-4">
                {availableTaxesToAdd > 0
                  ? "Get started by adding your first tax configuration from the available options."
                  : "No tax types are available to add. Contact support for assistance."}
              </p>
              {availableTaxesToAdd > 0 && (
                <Button
                  onClick={handleAddTaxClick}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Tax
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      {linkDishModal && (
        <PopUp rightTopBack hide height="h-[100dvh] lg:h-[90dvh]" show={linkDishModal} onClose={closeModalFunc}>
          <LinkingDishesToTax getGstTax={getGstTax} />
        </PopUp>
      )}
    </>
  );
};

const TaxList = memo(MemoTaxList);
TaxList.displayName = "TaxList";
export default TaxList;
