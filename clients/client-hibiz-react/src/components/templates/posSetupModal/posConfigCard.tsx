import { memo } from "react";

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
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
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

        <div className="mt-6">
          <button
            type="button"
            onClick={onEdit}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Edit Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

const PosConfigCard = memo(MemoPosConfigCard);
export default PosConfigCard;
