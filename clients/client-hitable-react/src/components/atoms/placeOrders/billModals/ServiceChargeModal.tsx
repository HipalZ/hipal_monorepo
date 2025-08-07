import { memo, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock } from "lucide-react";
import { useOrderStore } from "@/components/store/useOrderData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useIsPasswordActive } from "@/components/hooks/usePasswordManager";
import toast from "react-hot-toast";
import {
  useAddServiceCharge,
  useRemoveServiceCharge,
} from "@/components/hooks/api/useServiceCharge.ts";

interface BillData {
  serviceCharge: number;
  serviceChargeAppliedBy: string;
  serviceChargeRemovedBy: string;
}

interface ServiceChargeModalProps {
  data: BillData;
  onClose: () => void;
}

const MemoServiceChargeModal = ({ data, onClose }: ServiceChargeModalProps) => {
  const { businessId } = useParams();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const selectedBill = useOrderStore((s) => s.selectedBill);
  const { captainData: userData } = useHiClientZ();
  const isSplitBill = useMemo(() => Array.isArray(data), [data]);
  const currentBill = useMemo(
    () => selectedBill || (isSplitBill ? null : data),
    [selectedBill, isSplitBill, data],
  );

  // Password management hook - only for removing service charge
  const { isLoading: isPasswordLoading, isActive: isPasswordActive } =
    useIsPasswordActive("SERVICE_CHARGE");

  const [serviceChargeReason, setServiceChargeReason] = useState<string>("");
  const [removePassword, setRemovePassword] = useState<string>(""); // Password state for remove operation

  const { addingServiceChargeLoader, addingServiceCharge } =
    useAddServiceCharge(currentBill);
  const { removingServiceChargeLoader, removingServiceCharge } =
    useRemoveServiceCharge(currentBill);

  const isServiceChargeApplied = data.serviceCharge > 0;

  const handleAddServiceCharge = useCallback(async () => {
    if (!businessId || !selectedTable?.name || !userData?._id) {
      return;
    }

    try {
      await addingServiceCharge({
        businessId,
        tableName: selectedTable.name,
        serviceChargeAppliedBy: userData._id,
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to add service charge.");
    }
  }, [
    businessId,
    selectedTable?.name,
    userData?._id,
    addingServiceCharge,
    onClose,
  ]);

  const handleRemoveServiceCharge = useCallback(async () => {
    if (
      !businessId ||
      !selectedTable?.name ||
      !userData?._id ||
      !serviceChargeReason
    ) {
      return;
    }

    // Check if password is required and validate
    if (isPasswordActive && !removePassword.trim()) {
      toast.error("Please enter the remove service charge password.");
      return;
    }

    try {
      const payload = {
        businessId,
        tableName: selectedTable.name,
        serviceChargeRemovedBy: userData._id,
        reasonOfServiceCharge: serviceChargeReason,
        ...(isPasswordActive && { password: removePassword }), // Include password only if required
      };

      const res = await removingServiceCharge(payload);
      if (res.status === 200) {
        // Reset form after successful removal
        setServiceChargeReason("");
        setRemovePassword("");
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to remove service charge.");
    }
  }, [
    businessId,
    selectedTable?.name,
    userData?._id,
    serviceChargeReason,
    removingServiceCharge,
    isPasswordActive,
    removePassword,
    onClose,
  ]);

  // Show loading spinner if password validation is in progress
  if (isPasswordLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Service Charge Management</h3>

      {!isServiceChargeApplied && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            No service charge currently applied
          </p>
          <Button
            onClick={handleAddServiceCharge}
            disabled={addingServiceChargeLoader}
            className="w-full"
          >
            {addingServiceChargeLoader ? "Adding..." : "Add Service Charge"}
          </Button>
        </div>
      )}

      {isServiceChargeApplied && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Service charge of ₹{data.serviceCharge} is currently applied
          </p>

          <div>
            <Label htmlFor="service-charge-reason">Reason for Removal</Label>
            <Textarea
              id="service-charge-reason"
              placeholder="Enter reason for removing service charge"
              value={serviceChargeReason}
              onChange={(e) => setServiceChargeReason(e.target.value)}
            />
          </div>

          {/* Password Input - Only show if password is required for removing service charge */}
          {isPasswordActive && (
            <div>
              <Label
                htmlFor="remove-service-charge-password"
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Remove Service Charge Password
              </Label>
              <Input
                id="remove-service-charge-password"
                type="password"
                value={removePassword}
                onChange={(e) => setRemovePassword(e.target.value)}
                placeholder="Enter remove service charge password"
                className="mt-1"
              />
            </div>
          )}

          <Button
            onClick={handleRemoveServiceCharge}
            disabled={
              removingServiceChargeLoader ||
              !serviceChargeReason ||
              (isPasswordActive && !removePassword.trim()) // Disable if password required but not provided
            }
            className="w-full"
            variant="destructive"
          >
            {removingServiceChargeLoader
              ? "Removing..."
              : "Remove Service Charge"}
          </Button>
        </>
      )}
    </div>
  );
};

const ServiceChargeModal = memo(MemoServiceChargeModal);
export default ServiceChargeModal;
