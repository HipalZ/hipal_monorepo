import { memo } from "react";
import { useParams } from "react-router-dom";
import { apiRpc } from "@hi/common";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Phone, Table, DollarSign } from "lucide-react";
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import { MdTableBar } from "react-icons/md";

export interface IBillData {
    [key: string]: string | number;
    customerName: string;
    customerPhone: string;
    tableName: string;
    subTotal: number;
    serviceCharge: number;
    discount: number;
    tax: number;
    total: number;
}

const MemoGetBill = () => {
    const { businessId } = useParams();
    const queryClient = useQueryClient();
    const selectedTable = useOrderStore((s) => s.selectedTable);
    const userData = useHiClientZ((s) => s.captainData);

    const getTableBill = async () => {
        const response = await apiRpc.pos.get_bill.$get({
            query: {
                businessId: businessId || "",
                tableName: selectedTable?.name || "",
                generatedBy: userData?.name || "",
            },
        });

        if (response.status === 400) {
            return Promise.reject({
                status: 400,
                message: "Server timeout occurred",
            });
        }

        const res = await response.json();
        const payment = res?.data as IBillData;
        return payment;
    };

    const { isLoading, data } = useQuery({
        queryKey: ["getTableBill", businessId, selectedTable?.name, userData?.name],
        queryFn: getTableBill,
        enabled: !!businessId && !!selectedTable && !!userData,
        staleTime: 1000 * 60 * 30,
        initialData: () => {
            return queryClient.getQueryData([
                "getTableBill",
                businessId,
                selectedTable?.name,
                userData?.name,
            ]);
        }
    });

    if (isLoading) {
        return <SpinnerMemo />;
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No bill available.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md py-[5rem] md:py-[8rem] mx-auto my-8 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Bill Summary</h2>
                <Table className="w-6 h-6 text-gray-600" />
            </div>

            <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <p className="text-sm text-gray-700">
                        {data?.customerName} ({data?.customerPhone})
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <MdTableBar className="w-5 h-5 text-gray-600" />
                    <p className="text-sm text-gray-700">Table: {data?.tableName}</p>
                </div>
            </div>

            <Separator className="my-4" />
            <div className="mb-4 space-y-3">
                {Object.keys(data).map((key) => {
                    const value = data[key];

                    if (
                        (typeof value === "number" && value === 0) ||
                        key === "customerName" ||
                        key === "customerPhone" ||
                        key === "tableName" ||
                        key === "total"
                    ) {
                        return null;
                    }

                    return (
                        <div key={key} className="flex justify-between text-sm">
                            <p className="text-gray-700 capitalize">
                                {key?.replace(/([A-Z])/g, " $1")}
                            </p>
                            <p className="font-medium text-gray-900">
                                ₹{Number(value)?.toFixed(2)}
                            </p>
                        </div>
                    );
                })}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold">
                <p>Total</p>
                <p>₹{data?.total.toFixed(2)}</p>
            </div>
        </div>
    );
};

const GetBill = memo(MemoGetBill);
export default GetBill;
