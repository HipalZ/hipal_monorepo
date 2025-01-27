import { memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { CreditCard, Banknote, Smartphone } from "lucide-react";
import CommonBottomButton from "../bottomButton";
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import toast from "react-hot-toast";
import type { Alert, IBillData } from "@/components/types/hiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import MultipleModes from "./multipleModes";
import SingleMode from "./singleMode";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useGetAllModes } from "@/components/hooks/useTableData";

export interface IMode {
    _id: string;
    name: string;
    active: boolean;
}

export const ModeIcon = ({ name }: { name: string }) => {
    switch (name.toLowerCase()) {
        case "cash":
            return <Banknote className="w-6 h-6" />;
        case "upi":
            return <Smartphone className="w-6 h-6" />;
        default:
            return <CreditCard className="w-6 h-6" />;
    }
};

const MemoNormalSettle = ({
    closeNormalSettle,
    data: billData,
    alertData,
}: {
    data?: IBillData;
    closeNormalSettle: () => void;
    alertData?: Alert;
}) => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const setClickViewMore = useLiteStore((s) => s.setClickViewMore);

    const {
        selectedTable,
        setOpenOrderModal,
        isSplit,
        setIsSplit,
        settleModes,
        setSettleModes,
        openDues,
        setOpenDues,
        setSaveDueUser,
        saveDueUser
    } = useOrderStore();

    const { removeOnlineAlert, removeOnlineCount } = useLiteStore(
        (s) => ({
            removeOnlineAlert: s.removeOnlineAlert,
            removeOnlineCount: s.removeOnlineCount,
        }),
    );

    const captainData = useHiClientZ((s) => s.captainData);

    const { isLoading, paymentMode } = useGetAllModes(businessId, captainData?.name)

    const { mutateAsync: settleTable, isPending: isSettling } = useMutation({
        mutationFn: async (payload: {
            tableId: string;
            billRequestId: string;
            captainId: string;
            settleModes: {
                _id: string;
                name: string;
                amount: number;
            }[];
            split?: boolean;
            duesUserId?: string;
        }) => {
            const response = await apiRpc.table.normal_settle.$post({
                json: payload,
            });
            const res = await response.json();
            if (res?.err) {
                throw new Error(res.message || "Error settling the table");
            }
            return res;
        },
        onSuccess: () => {
            toast.success("Table settled successfully!");
            setSettleModes([]);
            closeNormalSettle();
            setOpenOrderModal(false);
            setIsSplit(false);
            setOpenDues(false);
            setSettleModes([]);
            setSaveDueUser(null)
            navigate(`/${businessId}/alerts`);
        },
        onError: (error: any) => {
            toast.error(error?.message || "Something went wrong.");
        },
    });

    const { mutateAsync: confirmAlert, isPending: isAlertLoading } = useMutation({
        mutationFn: async (payload: {
            id: string;
            comment: string;
            waiterName: string;
            settleModes: { _id: string; name: string; amount: number }[];
            duesUserId?: string;
        }) => {
            const res = await apiRpc.payments[":pid"].order[":alertId"].$put({
                param: { alertId: payload.id },
                json: payload,
            });
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            if (res.status === 200) {
                removeOnlineAlert(payload.id)
                removeOnlineCount()
                return res.json();
            }
            throw new Error("Something went wrong.");
        },
        onSuccess: () => {
            toast.success("Order confirmed successfully!");
            setSettleModes([]);
            setIsSplit(false);
            closeNormalSettle();
            setOpenOrderModal(false);
            setClickViewMore(false);
            setOpenDues(false);
            setSettleModes([]);
            setSaveDueUser(null)
            navigate(`/${businessId}/alerts`);
            return
        },
        onError: (error: any) => {
            toast.error(error?.message || "Something went wrong.");
        },
    });

    const handleConfirm = async () => {
        try {
            if (settleModes.length === 0) {
                toast.error("Please select at least one payment mode.");
                return;
            }

            // Validate total
            const sum = settleModes.reduce((acc, item) => acc + item.amount, 0);
            if (sum !== (alertData?.order_id?.total
                ? alertData.order_id.total
                : billData?.total ?? 0)) {
                toast.error("Selected amounts must match the total bill.");
                return;
            }

            const isMultiple = settleModes.length > 1;

            const hasDuesMode = settleModes.some(
                (mode) => mode.name.toLowerCase() === "dues"
            );

            if (alertData) {
                const payload = {
                    id: alertData._id,
                    waiterName: captainData?.name,
                    comment: isMultiple
                        ? "Confirmed by waiter (split)."
                        : "Confirmed by waiter (single).",
                    settleModes,
                }

                if (hasDuesMode && saveDueUser?._id) {
                    payload["duesUserId"] = saveDueUser._id;
                }
                await confirmAlert(payload);
            } else {
                const payload = {
                    tableId: selectedTable?._id || "",
                    billRequestId: billData?.billRequestId || "",
                    captainId: captainData?._id || "",
                    settleModes,
                    split: isMultiple,
                };

                // If there's a "dues" mode selected, append the duesUserId
                if (hasDuesMode && saveDueUser?._id) {
                    payload["duesUserId"] = saveDueUser._id;
                }

                // Call the API
                await settleTable(payload);
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <SpinnerMemo />
            </div>
        );
    }

    return (
        <section className="mx-auto">
            <h2 className="flex items-center justify-between p-4 mb-2 text-2xl font-bold text-center">
                <span>{isSplit ? "Split Payment" : "Select Payment Mode"}</span>
                <span>₹{
                    alertData?.order_id?.total
                        ? alertData.order_id.total
                        : billData?.total
                }</span>
            </h2>

            {/* =======================
          SINGLE MODE UI
      ======================== */}
            {!isSplit && (
                <SingleMode
                    paymentModes={paymentMode || []}
                    billData={
                        alertData?.order_id?.total
                            ? { total: Number(alertData.order_id.total) }
                            : billData
                    }
                />)}

            {/* =======================
          SPLIT MODE UI
      ======================== */}
            {isSplit && (
                <MultipleModes paymentModes={paymentMode || []}
                    billData={
                        alertData?.order_id?.total
                            ? { total: Number(alertData.order_id.total) }
                            : billData
                    }
                />
            )}

            {/* =======================
          BOTTOM BUTTONS
      ======================== */}
            {
                !openDues ? (
                    <CommonBottomButton
                        fixed={true}
                        maxWidth="30rem"
                        buttons={[
                            {
                                text: "Back",
                                onClick: () => {
                                    if (isSplit) {
                                        setIsSplit(false);
                                    } else {
                                        closeNormalSettle();
                                    }
                                },
                                className: "w-full rounded-md pl-3",
                                isBackButton: true,
                            },
                            {
                                text: isSplit ? "Normal" : "Split",
                                onClick: () => {
                                    setIsSplit(!isSplit);
                                },
                                className: "w-full rounded-md pl-3",
                            },
                            {
                                text: "Confirm",
                                onClick: async () => await handleConfirm(),
                                className: "w-full rounded-md",
                                disable: settleModes.length === 0,
                                isLoading: isSettling || isAlertLoading,
                            },
                        ]}
                    />
                )
                    : <CommonBottomButton
                        fixed={true}
                        maxWidth="30rem"
                        buttons={[
                            {
                                text: "Back",
                                onClick: () => {
                                    setOpenDues(false);
                                    setSettleModes([]);
                                    setSaveDueUser(null)
                                },
                                className: "w-full rounded-md pl-3",
                                isBackButton: true,
                            },
                            {
                                text: "Confirm",
                                onClick: async () => await handleConfirm(),
                                className: "w-full rounded-md",
                                disable: settleModes.length === 0,
                                isLoading: isSettling || isAlertLoading,
                            },
                        ]}
                    />}

        </section>
    );
};

const NormalSettle = memo(MemoNormalSettle);
export default NormalSettle;
