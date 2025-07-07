import { memo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrderStore } from "@/components/store/useOrderData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import {
  useAddServiceCharge,
  useRemoveServiceCharge,
} from "@/components/hooks/useBill";

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
  const { captainData: userData } = useHiClientZ();

  const [serviceChargeReason, setServiceChargeReason] = useState<string>("");

  const { addingServiceChargeLoader, addingServiceCharge } =
    useAddServiceCharge();
  const { removingServiceChargeLoader, removingServiceCharge } =
    useRemoveServiceCharge();

  const isServiceChargeApplied = data.serviceCharge > 0;

  const handleAddServiceCharge = useCallback(async () => {
    if (!businessId || !selectedTable?.name || !userData?._id) {
      return;
    }

    await addingServiceCharge({
      businessId,
      tableName: selectedTable.name,
      serviceChargeAppliedBy: userData._id,
    });

    onClose();
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

    await removingServiceCharge({
      businessId,
      tableName: selectedTable.name,
      serviceChargeRemovedBy: userData._id,
      reasonOfServiceCharge: serviceChargeReason,
    });

    onClose();
  }, [
    businessId,
    selectedTable?.name,
    userData?._id,
    serviceChargeReason,
    removingServiceCharge,
    onClose,
  ]);

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
          <Button
            onClick={handleRemoveServiceCharge}
            disabled={removingServiceChargeLoader || !serviceChargeReason}
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
