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
import {
  Plus,
  Edit,
  Percent,
  DollarSign,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
    isActive: boolean;
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
    isActive: true,
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

  const extractGstPercentage = useCallback((taxName: string): number | null => {
    const gstMatch = taxName.match(
      /(gst|vat)\s*$$\s*(\d+(?:\.\d+)?)\s*%\s*$$/i,
    );
    console.log("Regex match for:", taxName, "Result:", gstMatch);
    return gstMatch ? Number.parseFloat(gstMatch[2]) : null;
  }, []);

  // Check if selected tax is a GST or VAT tax
  const isAutoTax = useMemo(() => {
    if (!selectedTax) return false;
    const taxName = selectedTax.name.toLowerCase();
    return taxName.includes("gst") || taxName.includes("vat");
  }, [selectedTax]);

  // Auto-extracted tax value for GST/VAT
  const autoTaxValue = useMemo(() => {
    if (!selectedTax || !isAutoTax) return null;
    return extractGstPercentage(selectedTax.name);
  }, [selectedTax, isAutoTax, extractGstPercentage]);

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
          isActive: editingTax.isActive,
        });
      } else {
        setFormData({
          selectedTaxId: "",
          value: "",
          type: "PERCENTAGE",
          isActive: true,
        });
      }
    }
  }, [isOpen, editingTax, allTaxes]);

  // Auto-set value when GST/VAT tax is selected
  useEffect(() => {
    if (selectedTax && isAutoTax && autoTaxValue !== null && !isEditing) {
      setFormData((prev) => ({
        ...prev,
        value: autoTaxValue.toString(),
        type: "PERCENTAGE",
      }));
    }
  }, [selectedTax, isAutoTax, autoTaxValue, isEditing]);

  const handleTaxSelection = useCallback(
    (taxId: string) => {
      const selectedTaxData = allTaxes?.find(
        (tax) => tax._id.toString() === taxId,
      );

      if (selectedTaxData) {
        const taxName = selectedTaxData.name.toLowerCase();
        const isSelectedAutoTax =
          taxName.includes("gst") || taxName.includes("vat");

        if (isSelectedAutoTax) {
          // Extract tax value immediately when GST/VAT tax is selected
          const extractedValue = extractGstPercentage(selectedTaxData.name);

          setFormData((prev) => ({
            ...prev,
            selectedTaxId: taxId,
            value: extractedValue !== null ? extractedValue.toString() : "",
            type: "PERCENTAGE",
          }));
        } else {
          // For non-GST/VAT taxes, just set the ID and reset other fields
          setFormData((prev) => ({
            ...prev,
            selectedTaxId: taxId,
            value: "",
            type: "PERCENTAGE",
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          selectedTaxId: taxId,
        }));
      }
    },
    [allTaxes, extractGstPercentage],
  );

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

  const handleActiveChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.selectedTaxId) {
      toast.error("Please select a tax");
      return false;
    }

    // For GST/VAT taxes, value is auto-extracted and always valid - skip manual validation
    if (isAutoTax && autoTaxValue !== null) {
      // Check for duplicates only
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
    }

    // For non-GST/VAT taxes, validate the manual input
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
  }, [
    formData,
    businessTaxes,
    selectedTax,
    isEditing,
    isAutoTax,
    autoTaxValue,
  ]);

  // Add debugging
  console.log("Debug info:", {
    selectedTax: selectedTax?.name,
    isAutoTax,
    autoTaxValue,
    extractedValue: selectedTax ? extractGstPercentage(selectedTax.name) : null,
  });

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !selectedTax) return;

    try {
      // Use auto-extracted value for GST/VAT taxes, otherwise use form value
      const taxValue =
        isAutoTax && autoTaxValue !== null
          ? autoTaxValue
          : Number.parseFloat(formData.value);

      if (isEditing && editingTax) {
        const updatePayload: updateTaxPayload = {
          taxId: editingTax._id,
          name: selectedTax.name,
          value: taxValue,
          type: isAutoTax ? "PERCENTAGE" : formData.type,
          isActive: formData.isActive,
          menuId,
        };
        await updateTax(updatePayload);
      } else {
        const createPayload: createTaxPayload = {
          name: selectedTax.name,
          value: taxValue,
          type: isAutoTax ? "PERCENTAGE" : formData.type,
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
    isAutoTax,
    autoTaxValue,
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

  const effectiveValue =
    isAutoTax && autoTaxValue !== null
      ? autoTaxValue.toString()
      : formData.value;
  const effectiveType = isAutoTax ? "PERCENTAGE" : formData.type;
  const isValueReadonly = isAutoTax && autoTaxValue !== null;
  const isTypeReadonly = isAutoTax;

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
              disabled={isLoading || isEditing} // Add isEditing to disable in edit mode
            >
              <SelectTrigger
                className={isEditing ? "bg-gray-50 text-gray-600" : ""}
              >
                <SelectValue placeholder="Choose a tax type" />
              </SelectTrigger>
              <SelectContent>
                {availableTaxes.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    {isEditing
                      ? "Tax type cannot be changed"
                      : "All available taxes have been added"}
                  </div>
                ) : (
                  availableTaxes.map((tax) => (
                    <SelectItem key={tax._id} value={tax._id.toString()}>
                      <div className="flex items-center gap-2">
                        {tax.name}
                        {(tax.name.toLowerCase().includes("gst") ||
                          tax.name.toLowerCase().includes("vat")) && (
                          <Badge variant="outline">Auto-value</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {isEditing && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Tax name cannot be changed when editing
              </p>
            )}
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

          {/* GST/VAT Auto-value Alert */}
          {isAutoTax && autoTaxValue !== null && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                {selectedTax?.name.toLowerCase().includes("gst")
                  ? "GST"
                  : "VAT"}{" "}
                tax value ({autoTaxValue}%) is automatically extracted from the
                tax name and cannot be modified.
              </AlertDescription>
            </Alert>
          )}

          {/* Tax Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="taxType">Tax Type</Label>
            <Select
              value={effectiveType}
              onValueChange={handleTypeChange}
              disabled={isLoading || isTypeReadonly || isEditing} // Add isEditing to disable in edit mode
            >
              <SelectTrigger
                className={isEditing ? "bg-gray-50 text-gray-600" : ""}
              >
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Percentage
                    {(isTypeReadonly || isEditing) && (
                      <Lock className="h-3 w-3 text-gray-400" />
                    )}
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
            {isEditing && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Tax type cannot be changed when editing
              </p>
            )}
          </div>

          {/* Tax Value Input - Show for all taxes when editing, but disable auto taxes */}
          <div className="space-y-2">
            <Label htmlFor="taxValue" className="flex items-center gap-2">
              Tax Value {effectiveType === "PERCENTAGE" ? "(%)" : "(₹)"}
              {(isValueReadonly || (isEditing && isAutoTax)) && (
                <Lock className="h-3 w-3 text-gray-400" />
              )}
            </Label>
            <Input
              id="taxValue"
              type="number"
              step="0.01"
              min="0"
              max={effectiveType === "PERCENTAGE" ? "100" : undefined}
              placeholder={
                effectiveType === "PERCENTAGE"
                  ? "Enter percentage (0-100)"
                  : "Enter fixed amount"
              }
              value={effectiveValue}
              onChange={(e) => handleInputChange("value", e.target.value)}
              disabled={
                isLoading || isValueReadonly || (isEditing && isAutoTax)
              }
              className={
                isValueReadonly || (isEditing && isAutoTax)
                  ? "bg-gray-50 text-gray-600"
                  : ""
              }
            />
            {(isValueReadonly || (isEditing && isAutoTax)) && (
              <p className="text-xs text-gray-500">
                {isAutoTax
                  ? "GST/VAT tax values cannot be modified. Only active/inactive status can be changed."
                  : "This value is automatically set based on the selected tax and cannot be modified."}
              </p>
            )}
            {isEditing && !isValueReadonly && !isAutoTax && (
              <p className="text-xs text-gray-500">
                You can modify the tax value when editing.
              </p>
            )}
          </div>

          {/* GST/VAT Auto-value Info - Only show for auto taxes */}
          {isAutoTax && autoTaxValue !== null && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedTax?.name.toLowerCase().includes("gst")
                    ? "GST"
                    : "VAT"}{" "}
                  Tax Value
                </span>
              </div>
              <p className="text-sm text-blue-700">
                Tax value <strong>{autoTaxValue}%</strong> is automatically
                extracted from the selected{" "}
                {selectedTax?.name.toLowerCase().includes("gst")
                  ? "GST"
                  : "VAT"}{" "}
                tax name and cannot be modified.
              </p>
            </div>
          )}

          {/* isActive Switch - Only visible when editing */}
          {isEditing && (
            <div className="flex items-center justify-between space-x-2 p-2 rounded-md bg-gray-50">
              <Label htmlFor="isActive" className="flex flex-col">
                <span className="text-sm font-medium leading-none">
                  Active Tax
                </span>
                <span className="text-xs text-muted-foreground">
                  Toggle to activate or deactivate this tax.
                </span>
              </Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleActiveChange}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Editing Restrictions Alert */}
          {isEditing && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                {isAutoTax ? (
                  <>
                    For <strong>GST/VAT taxes</strong>, you can only change the{" "}
                    <strong>active status</strong>. Tax name, type, and value
                    cannot be modified to maintain compliance and data
                    consistency.
                  </>
                ) : (
                  <>
                    When editing a tax, you can modify the{" "}
                    <strong>tax value</strong> and{" "}
                    <strong>active status</strong>. Tax name and type cannot be
                    changed to maintain data consistency.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {selectedTax && effectiveValue && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">Preview:</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{selectedTax.name}</Badge>
                <span className="text-sm">
                  {effectiveValue}
                  {effectiveType === "PERCENTAGE" ? "%" : "₹"}
                </span>
                {isAutoTax && <Badge variant="outline">Auto-extracted</Badge>}
                {isEditing && (
                  <Badge variant={formData.isActive ? "default" : "outline"}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
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
              // Only require value for non-auto taxes
              (!isAutoTax && !formData.value.trim()) ||
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
