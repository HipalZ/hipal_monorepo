import { memo, useCallback, useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Percent, DollarSign, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  useCreateTax,
  useUpdateTax,
  useGetAllTaxes,
  useFetchTaxesByBusiness,
  type createTaxPayload,
  type updateTaxPayload,
  type taxType,
} from "@/hooks/useTax.ts";
import LoadingSpinner from "@/components/atom/loadingSpinner/index.tsx";

interface TaxFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTax?: {
    _id: string;
    name: string;
    value: number;
    type: taxType;
  } | null;
  businessId: string;
  menuId: string;
}

const MemoTaxForm = ({
  isOpen,
  onClose,
  editingTax,
  businessId,
  menuId,
}: TaxFormProps) => {
  const [formData, setFormData] = useState({
    selectedTaxId: "",
    value: "",
    type: "PERCENTAGE" as taxType,
  });

  const { isLoading: loadingAllTaxes, taxes: allTaxes } = useGetAllTaxes();
  const { businessTaxes } = useFetchTaxesByBusiness();
  const { creatingTax, createTax } = useCreateTax();
  const { updatingTax, updateTax } = useUpdateTax();

  const isLoading = creatingTax || updatingTax;
  const isEditing = !!editingTax;

  const availableTaxes = useMemo(() => {
    if (!allTaxes) return [];

    if (isEditing) {
      return allTaxes;
    }

    const addedTaxNames = new Set(businessTaxes?.map((tax) => tax.name) || []);
    return allTaxes.filter((tax) => !addedTaxNames.has(tax.name));
  }, [allTaxes, businessTaxes, isEditing]);

  const selectedTax = useMemo(() => {
    if (!formData.selectedTaxId || !allTaxes) return null;
    return (
      allTaxes.find((tax) => tax._id.toString() === formData.selectedTaxId) ||
      null
    );
  }, [formData.selectedTaxId, allTaxes]);

  useEffect(() => {
    if (isOpen) {
      if (editingTax) {
        const taxFromAll = allTaxes?.find(
          (tax) => tax.name === editingTax.name,
        );
        setFormData({
          selectedTaxId: taxFromAll?._id.toString() || "",
          value: editingTax.value.toString(),
          type: editingTax.type,
        });
      } else {
        setFormData({
          selectedTaxId: "",
          value: "",
          type: "PERCENTAGE",
        });
      }
    }
  }, [isOpen, editingTax, allTaxes]);

  const handleTaxSelection = useCallback((taxId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTaxId: taxId,
    }));
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleTypeChange = useCallback((value: taxType) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.selectedTaxId) {
      toast.error("Please select a tax");
      return false;
    }
    if (!formData.value.trim()) {
      toast.error("Tax value is required");
      return false;
    }
    const numValue = Number.parseFloat(formData.value);
    if (isNaN(numValue) || numValue < 0) {
      toast.error("Tax value must be a valid positive number");
      return false;
    }
    if (formData.type === "PERCENTAGE" && numValue > 100) {
      toast.error("Percentage value cannot exceed 100%");
      return false;
    }

    if (!isEditing && businessTaxes && selectedTax) {
      const isDuplicate = businessTaxes.some(
        (tax) => tax.name === selectedTax.name,
      );
      if (isDuplicate) {
        toast.error("This tax is already added to your business");
        return false;
      }
    }

    return true;
  }, [formData, businessTaxes, selectedTax, isEditing]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !selectedTax) return;

    try {
      const numValue = Number.parseFloat(formData.value);

      if (isEditing && editingTax) {
        const updatePayload: updateTaxPayload = {
          taxId: editingTax._id,
          name: selectedTax.name,
          value: numValue,
          type: formData.type,
          menuId,
        };
        await updateTax(updatePayload);
      } else {
        const createPayload: createTaxPayload = {
          name: selectedTax.name,
          value: numValue,
          type: formData.type,
          businessId,
          menuId,
        };
        await createTax(createPayload);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [
    formData,
    validateForm,
    selectedTax,
    isEditing,
    editingTax,
    updateTax,
    createTax,
    businessId,
    menuId,
    onClose,
  ]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
    }
  }, [isLoading, onClose]);

  if (loadingAllTaxes) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <Edit className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {isEditing ? "Edit Tax" : "Add New Tax"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tax Selection */}
          <div className="space-y-2">
            <Label htmlFor="taxSelect">Select Tax</Label>
            <Select
              value={formData.selectedTaxId}
              onValueChange={handleTaxSelection}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a tax type" />
              </SelectTrigger>
              <SelectContent>
                {availableTaxes.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    {isEditing
                      ? "No taxes available"
                      : "All available taxes have been added"}
                  </div>
                ) : (
                  availableTaxes.map((tax) => (
                    <SelectItem key={tax._id} value={tax._id.toString()}>
                      {tax.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Show alert if no taxes available for new addition */}
          {!isEditing && availableTaxes.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                All available taxes have been added to your business. You can
                edit existing taxes or contact support to add new tax types.
              </AlertDescription>
            </Alert>
          )}

          {/* Tax Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="taxType">Tax Type</Label>
            <Select
              value={formData.type}
              onValueChange={handleTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Percentage
                  </div>
                </SelectItem>
                <SelectItem value="FIXED">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Fixed Amount
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tax Value Input */}
          <div className="space-y-2">
            <Label htmlFor="taxValue">
              Tax Value {formData.type === "PERCENTAGE" ? "(%)" : "(₹)"}
            </Label>
            <Input
              id="taxValue"
              type="number"
              step="0.01"
              min="0"
              max={formData.type === "PERCENTAGE" ? "100" : undefined}
              placeholder={
                formData.type === "PERCENTAGE"
                  ? "Enter percentage (0-100)"
                  : "Enter fixed amount"
              }
              value={formData.value}
              onChange={(e) => handleInputChange("value", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Preview */}
          {selectedTax && formData.value && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">Preview:</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{selectedTax.name}</Badge>
                <span className="text-sm">
                  {formData.value}
                  {formData.type === "PERCENTAGE" ? "%" : "₹"}
                </span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !formData.selectedTaxId ||
              !formData.value.trim() ||
              (availableTaxes.length === 0 && !isEditing)
            }
          >
            {isLoading && (
              <span className="inline-block h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {isEditing ? "Update Tax" : "Add Tax"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaxForm = memo(MemoTaxForm);
TaxForm.displayName = "TaxForm";
export default TaxForm;
