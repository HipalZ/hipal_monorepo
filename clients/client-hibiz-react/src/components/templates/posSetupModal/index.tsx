import { memo, useCallback, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

interface PosData {
  _id: string;
  name: string;
}
export type VerificationType = "CAPTAIN" | "USER";

interface PosConfigData {
  _id: string;
  businessId: string;
  posId: string;
  orderMode: string;
  orderVerificationType: VerificationType;
  petPoojaId: string;
  restName: string;
  posName: string;
  restId: string;
  defaultTableName: string;
}

interface PosSetupModalProps {
  onComplete: () => void;
  onClose: () => void;
  existingConfig?: PosConfigData | null;
}
interface PosSetupModalPayload {
  businessId: string;
  posId?: string;
  restId?: string;
  orderVerificationType?: VerificationType;
}

const MemoPosSetupModal = ({
  onComplete,
  onClose,
  existingConfig,
}: PosSetupModalProps) => {
  const businessId = useParams<{ businessId: string }>().businessId;
  const [step, setStep] = useState(existingConfig ? 2 : 1);
  const [selectedPos, setSelectedPos] = useState<PosData | null>(null);
  const [formData, setFormData] = useState({
    restId: existingConfig?.restId || "",
    orderVerificationType:
      existingConfig?.orderVerificationType || ("USER" as "CAPTAIN" | "USER"),
  });

  const fetchAllPos = useCallback(async (businessId: string) => {
    try {
      const response = await apiRpc.pos.all_pos.$get({
        businessId,
      });
      const res = await response.json();
      return res.data as PosData[];
    } catch (e) {
      console.error(e);
      throw new Error("Failed to fetch POS data");
    }
  }, []);

  const { data: posList, isLoading } = useQuery({
    queryKey: ["fetchAllPos", businessId],
    queryFn: () => fetchAllPos(businessId || ""),
    enabled: !!businessId && step === 1,
  });

  const handleFormSubmit = useMutation({
    mutationFn: async (submitData: PosSetupModalPayload) => {
      if (existingConfig) {
        // Update existing config
        const response = await apiRpc.pos.update_pos_config.$put({
          json: {
            posConfigId: existingConfig._id,
            orderVerificationType: submitData.orderVerificationType,
          },
        });
        return response.json();
      }
      const response = await apiRpc.pos.setup.$post({
        json: submitData,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.err) {
        toast.error(data.message);
        return console.error("Error:", data.message);
      }
      toast.success(
        existingConfig
          ? "POS configuration updated successfully!"
          : "POS setup completed successfully!",
      );
      onComplete();
    },
    onError: (error: any) => {
      toast.error(
        error?.message ||
          (existingConfig
            ? "Failed to update POS configuration."
            : "Failed to submit POS details."),
      );
    },
  });

  const handlePosSelect = useCallback((pos: PosData) => {
    setSelectedPos(pos);
    setStep(2);
  }, []);

  const handleFormSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (existingConfig) {
      const submitData = {
        posConfigId: existingConfig._id,
        orderVerificationType: formData.orderVerificationType,
      };
      handleFormSubmit.mutate(submitData);
    } else {
      // For new setup, send all required fields
      const submitData = {
        posId: selectedPos?._id,
        restId: formData.restId,
        orderVerificationType: formData.orderVerificationType,
        businessId: businessId,
      };
      handleFormSubmit.mutate(submitData);
    }
  };

  const renderStep1 = () => (
    <div className="h-[70vh] overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select POS System
        </h2>
        <p className="text-gray-600">Choose your Point of Sale system</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posList?.map((pos) => (
            <button
              type="button"
              key={pos._id}
              onClick={() => handlePosSelect(pos)}
              className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-6 text-left transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-center h-16 mb-4">
                {pos.name === "petPooja" ? (
                  <img
                    alt="petPooja"
                    src="https://gdm-catalog-fmapi-prod.imgix.net/ProductLogo/5ee5d327-b1e8-44ae-a2c6-6c9e358f3ec7.png"
                    className="h-12 object-contain"
                  />
                ) : (
                  <div className="text-2xl font-bold text-gray-700 capitalize">
                    {pos.name}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-center capitalize">
                {pos.name}
              </h3>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <form
      onSubmit={handleFormSubmitAction}
      className="h-[70vh] overflow-y-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {existingConfig ? "Edit POS Configuration" : "Configure POS Settings"}
        </h2>
        <p className="text-gray-600">
          {existingConfig
            ? "Update your POS settings"
            : "Set up your POS configuration"}
        </p>
      </div>

      <div className="space-y-6">
        {!existingConfig && (
          <div>
            <label
              htmlFor="restId"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Restaurant ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="restId"
              value={formData.restId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, restId: e.target.value }))
              }
              placeholder="Enter your restaurant ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Your unique restaurant identifier in the POS system
            </p>
          </div>
        )}

        {existingConfig && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Current Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">POS Name:</span>
                <p className="font-medium">{existingConfig.posName}</p>
              </div>
              <div>
                <span className="text-gray-600">Restaurant ID:</span>
                <p className="font-medium">{existingConfig.restId}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <fieldset>
            <legend className="block text-sm font-semibold text-gray-700 mb-3">
              Order Verification Method <span className="text-red-500">*</span>
            </legend>
            <div className="space-y-4">
              <label
                className={`relative flex p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.orderVerificationType === "USER"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                    : "border-gray-200 hover:border-green-200"
                }`}
              >
                <input
                  type="radio"
                  name="orderVerificationType"
                  value="USER"
                  checked={formData.orderVerificationType === "USER"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderVerificationType: e.target.value as
                        | "USER"
                        | "CAPTAIN",
                    }))
                  }
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      Direct to Kitchen
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      FASTER
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Orders go directly to the kitchen without any approval.
                    <strong> Best for quick service and trusted staff.</strong>
                  </p>
                </div>
              </label>

              <label
                className={`relative flex p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.orderVerificationType === "CAPTAIN"
                    ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                    : "border-gray-200 hover:border-orange-200"
                }`}
              >
                <input
                  type="radio"
                  name="orderVerificationType"
                  value="CAPTAIN"
                  checked={formData.orderVerificationType === "CAPTAIN"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderVerificationType: e.target.value as
                        | "USER"
                        | "CAPTAIN",
                    }))
                  }
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      Captain Approval Required
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      SECURE
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Orders require captain/manager approval before going to
                    kitchen.
                    <strong>
                      {" "}
                      Best for quality control and order verification.
                    </strong>
                  </p>
                </div>
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      <div className="flex gap-3 mt-8 pt-6 border-t">
        <button
          type="button"
          onClick={existingConfig ? onClose : () => setStep(1)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {existingConfig ? "Cancel" : "Back"}
        </button>
        <button
          type="submit"
          disabled={handleFormSubmit.isPending}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {handleFormSubmit.isPending
            ? existingConfig
              ? "Updating..."
              : "Setting up..."
            : existingConfig
              ? "Update Configuration"
              : "Complete Setup"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <div className="p-6">{step === 1 ? renderStep1() : renderStep2()}</div>
    </div>
  );
};

const PosSetupModal = memo(MemoPosSetupModal);
export default PosSetupModal;
