import { usePosSync } from "@/hooks/usePosHook.ts";
import { memo, useCallback } from "react";
import { BiSync } from "react-icons/bi";

interface PosConfigData {
  _id: string;
  businessId: string;
  posId: string;
  orderMode: string;
  orderVerificationType: "CAPTAIN" | "USER";
  petPoojaId: string;
  restName: string;
  posName: string;
  restId: string;
  defaultTableName: string;
  accessKey?: string;
  authToken?: string;
  secretKey?: string;
  branchId?: string;
  isDeleted: boolean;
}

interface PosConfigCardProps {
  config: PosConfigData;
  onEdit: () => void;
}

const MemoPosConfigCard = ({ config, onEdit }: PosConfigCardProps) => {
  const { isPending, mutate } = usePosSync();

  const handleSync = useCallback((restId: string) => {
    mutate(restId);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-[30rem]">
      <div className="bg-primary px-6 py-4">
        <h2 className="text-xl font-bold text-white">POS Configuration</h2>
        <p className="text-blue-100">Current setup details</p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              POS Details
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">POS Name:</span>
                <p className="font-semibold text-gray-900 capitalize">
                  {config.posName}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Restaurant Name:</span>
                <p className="font-semibold text-gray-900">{config.restName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Restaurant ID:</span>
                <p className="font-semibold text-gray-900">{config.restId}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Order Mode:</span>
                <p className="font-semibold text-gray-900">
                  {config?.orderMode?.replace("_", " ")}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">
                  Order Verification:
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      config.orderVerificationType === "CAPTAIN"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {config.orderVerificationType}
                  </span>
                  <span className="text-sm text-gray-600">
                    {config.orderVerificationType === "CAPTAIN"
                      ? "(Requires approval)"
                      : "(Direct to kitchen)"}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Default Table:</span>
                <p className="font-semibold text-gray-900">
                  {config.defaultTableName}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-6">
          <button
            type="button"
            onClick={onEdit}
            disabled={isPending}
            className="w-full border border-black text-sm text-nowrap text-black md:w-auto  px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Edit Configuration
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSync(config?.restId)}
            className={`
      flex items-center justify-center
      w-full md:w-auto bg-primary text-white px-6 py-2 rounded-lg font-medium
      transition-colors
      ${isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-dark"}
    `}
          >
            {isPending ? (
              // spinner
              <span
                className="inline-block h-4 w-4 mr-2
                   border-2 border-white border-t-transparent
                   rounded-full animate-spin"
              />
            ) : (
              <BiSync className="inline-block mr-2" />
            )}
            {isPending ? "Syncing..." : "Sync"}
          </button>
        </div>
      </div>
    </div>
  );
};

const PosConfigCard = memo(MemoPosConfigCard);
export default PosConfigCard;
