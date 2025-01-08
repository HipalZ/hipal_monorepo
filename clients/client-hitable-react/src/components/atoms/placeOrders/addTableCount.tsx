import { memo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useOrderStore } from "@/components/store/useOrderData";
import toast from "react-hot-toast";
import SpinnerMemo from "../loadingSpinner";
import BottomPopUp from "../universalPopup";
import CommonBottomButton from "../bottomButton";
import type { TableData } from "@/components/store/useZonesAndTable";

const MemoAddTableCount = ({ selectedTable }: { selectedTable: TableData | null }) => {
    const [count, setCount] = useState<string>("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showError, setShowError] = useState(false);
    const { setSelectedTable, setOpenOrderModal } = useOrderStore();

    const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && Number(value) <= 99) {
            setCount(value);
        }
    };

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (userCount: number) => {
            const res = await apiRpc.table.update_guest.$put({
                json: {
                    tableId: selectedTable?._id || "",
                    guestCount: userCount
                }
            });
            const response = await res?.json()
            const data = response?.data as TableData
            if (res.status === 200 || res.status === 201) {
                setSelectedTable(data)
                setOpenOrderModal(false)
            }
            return data;
        },
        onSuccess: (data) => {
            if (data.err) {
                setShowError(true);
                return;
            }
            toast.success(data.message);
        },
        onError: (error) => {
            setShowError(true);
        }
    });

    const handleUpdateCount = async () => {
        if (count === "" || Number(count) === 0) {
            setShowError(true);
            return;
        }

        const currentCapacity = selectedTable?.capacity || 0;

        if (Number(count) < currentCapacity) {
            setShowConfirmation(true);
        } else {
            await mutateAsync(Number(count));
        }
    };

    const confirmUpdate = async () => {
        setShowConfirmation(false);
        await mutateAsync(Number(count));
    };

    if (isPending) {
        return <SpinnerMemo />;
    }

    return (
        <section className="max-w-md p-4 mx-auto mt-16 space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">Update Guest Count</h2>

            {selectedTable?.capacity > 0 && (
                <div className="text-center">
                    <span className="text-sm text-gray-500">Current Guest Count</span>
                    <div className="text-4xl font-bold text-blue-600">
                        {selectedTable?.capacity}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label
                    htmlFor="count"
                    className="text-sm font-medium text-gray-700"
                >
                    Number of Guests
                </label>
                <Input
                    id="count"
                    type="tel"
                    value={count}
                    onChange={handleCountChange}
                    className="w-full"
                    placeholder="Enter guest count (0-99)"
                />
            </div>

            <Button
                className="w-full"
                onClick={handleUpdateCount}
                disabled={count === "" || Number(count) === 0}
            >
                Update Guest Count
            </Button>

            <BottomPopUp height="h-[40dvh]" show={showConfirmation} onClose={() => setShowConfirmation(false)}>
                <div className="p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Update</h3>
                    <p className="text-gray-700">
                        The current guest count is greater than the entered value. Are you sure you want to update it?
                    </p>
                </div>
                <CommonBottomButton
                    fixed={true}
                    maxWidth="48rem"
                    buttons={[

                        {
                            text: "Cancel",
                            onClick: () => setShowConfirmation(false),
                            type: "button" as const,
                        },
                        {
                            text: "Update",
                            onClick: () => { confirmUpdate(); },
                            type: "button" as const,
                        },
                    ]}
                />
            </BottomPopUp>

            <BottomPopUp
                height="h-[40dvh]"
                show={showError}
                onClose={() => setShowError(false)}>
                <div className="p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Error</h3>
                    <p className="text-gray-700">
                        An error occurred while updating the guest count. Please try again.
                    </p>
                </div>
                <CommonBottomButton
                    fixed={true}
                    maxWidth="30rem"
                    buttons={[
                        {
                            text: "Close",
                            onClick: () => setShowError(false),
                            type: "button" as const,
                        },
                    ]}
                />
            </BottomPopUp>
        </section>
    );
};

const AddTableCount = memo(MemoAddTableCount);
export default AddTableCount;

