import { apiRpc } from "@hi/common";
import { useQuery, useMutation } from "@tanstack/react-query";
import { memo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const PosOnlyMenuMemo = () => {
    const businessId = useParams<{ businessId: string }>().businessId;
    const [existingData, setExistingData] = useState<any>(null);
    const [formData, setFormData] = useState({ restId: "", tableName: "" });

    const handleFetchConfig = async () => {
        try {
            if (!businessId) {
                throw new Error("businessId is required");
            }
            const response = await apiRpc.sync_pos_menu_config[":businessId"].$get({
                param: { businessId },
            });

            const res = await response.json();
            if (response.status === 200 && res?.data?.config) {
                setExistingData(res.data.config);
                setFormData({
                    restId: res.data.config.restId || "",
                    tableName: res.data.config.tableName || "",
                });
            }
            return res;
        } catch (error) {
            console.error("Error fetching config data:", error);
        }
    };

    useQuery({
        queryKey: ["configData", businessId],
        queryFn: handleFetchConfig,
        enabled: !!businessId,
    });

    const handleFormSubmit = useMutation({
        mutationFn: async () => {
            const payload = {
                businessId,
                restId: formData.restId,
                tableName: formData.tableName,
            };
            const response = await apiRpc.sync_pos_menu_config.$post({
                json: payload,
            });
            return response.json();
        },

        onSuccess: (data) => {
            if (data.err) {
                toast.error(data.message);
                return console.error("Error:", data.message);
            }
            toast.success(
                existingData
                    ? "POS configuration updated successfully!"
                    : "POS setup completed successfully!"
            );
        },
        onError: (error: any) => {
            toast.error(
                error?.message ||
                (existingData
                    ? "Failed to update POS configuration."
                    : "Failed to submit POS details.")
            );
        },
    });

    return (
        <>
            {existingData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Current Configuration
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">POS Name:</span>
                            <p className="font-medium">{existingData.tableName}</p>
                        </div>
                        <div>
                            <span className="text-gray-600">Restaurant ID:</span>
                            <p className="font-medium">{existingData.restId}</p>
                        </div>
                    </div>
                </div>
            )}
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
                        !existingData?.restId &&
                        setFormData((prev) => ({ ...prev, restId: e.target.value }))
                    }
                    readOnly={!!existingData?.restId}
                    placeholder="Enter your restaurant ID"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent
            ${existingData?.restId
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                    required
                />
                <p className="mt-1 text-sm text-gray-500">
                    Your unique restaurant identifier in the POS system
                </p>
            </div>

            <br />

            <div>
                <label
                    htmlFor="tableName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    Table Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="tableName"
                    value={formData.tableName}
                    onChange={(e) =>
                        !existingData?.tableName &&
                        setFormData((prev) => ({ ...prev, tableName: e.target.value }))
                    }
                    readOnly={!!existingData?.tableName}
                    placeholder="Enter your table name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent
            ${existingData?.tableName
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                    required
                />
                <p className="mt-1 text-sm text-gray-500">
                    Your unique table identifier in the POS system
                </p>
            </div>

            <div className="flex gap-3 mt-8 pt-6">
                <button
                    type="button"
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={() => handleFormSubmit.mutate()}
                    disabled={!!(existingData?.restId && existingData?.tableName)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {existingData ? "Update Settings" : "Save Settings"}
                </button>
            </div>
        </>
    );
};

const PosOnlyMenu = memo(PosOnlyMenuMemo);
export default PosOnlyMenu;
