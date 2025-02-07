import { memo, useCallback, useState } from "react";
import { Coins, UserCircle, X } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrderStore } from "@/components/store/useOrderData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import MultipleModes from "../atoms/placeOrders/multipleModes";
import SingleMode from "../atoms/placeOrders/singleMode";
import CommonBottomButton from "../atoms/bottomButton";
import { useUnsettle } from "@/components/store/useUnsettle";
import toast from "react-hot-toast";
import SpinnerMemo from "../atoms/loadingSpinner";
import { useGetAllModes } from "../hooks/useTableData";
import { useError } from "../store/useError";

const MemoSettleTable = () => {
    const queryClient = useQueryClient();
    const { businessId } = useParams();
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState<string>("");
    const [settleAmount, setSettleAmount] = useState<number | "">(0);
    const [orderId, setOrderId] = useState<string>("");
    const [showPaymentMode, setShowPaymentMode] = useState<boolean>(false);
    const [showSplit, setShowSplit] = useState<boolean>(false);

    const { selectedUnsettleData, setOpenUnsettle, setSelectedUnsettleData } = useUnsettle()
    const {
        settleModes,
        setSettleModes,
        saveDueUser,
        setSaveDueUser,
    } = useOrderStore();

    const { setError, setOpenErrorModal } = useError();

    const showModeOfPayments = useCallback(() => {
        setShowPaymentMode(true);
    }, [])

    const closeModeOfPayments = useCallback(() => {
        setShowPaymentMode(false);
        setShowSplit(false);
        setSettleModes([]);
        setCustomReason("");
        setSelectedReason(null);
    }, [])

    const closeSplit = useCallback(() => {
        setShowSplit(false);
        setSettleModes([]);
    }, [])

    const predefinedReasons = [
        "Trial",
        "Duplication",
        "Waiter Problem",
        "Customer Led Problem",
    ];

    const captainData = useHiClientZ((s) => s.captainData);

    const { paymentMode } = useGetAllModes(businessId, showPaymentMode)

    const { isPending, mutateAsync } = useMutation({
        mutationFn: async () => {

            const hasDuesMode = settleModes.some(
                (mode) => mode.name.toLowerCase() === "dues"
            );
            const hasNpcMode = settleModes.some(
                (mode) => mode.name.toLowerCase() === "npc"
            );

            let payload = {
                unSettleTableId: selectedUnsettleData?._id || "",
                captainId: captainData?._id || "",
                businessId: businessId || "",
                settleAmount: Number(settleAmount) || 0,
                orderId: orderId,
                reasonForSettle: selectedReason || customReason,
                settleModes: settleModes,
            }

            if (hasDuesMode && saveDueUser?._id) {
                payload["duesUserId"] = saveDueUser._id;
            }
            if (hasNpcMode && saveDueUser?._id) {
                payload["npcUserId"] = saveDueUser?._id;
            }

            const response = await apiRpc.table.resolve_table.$post({
                json: payload
            })

            if (response.status === 401 || response.status === 403) {
                setOpenErrorModal(true);
                setError("You are not authorized to perform this action");
                return { err: true, message: "You are not authorized to perform this action" };
            }

            const res = await response.json();
            return res
        },
        onSuccess: (data) => {
            if(data.err) {
                toast.error(data.message);
                return;
            }
            if (!data.err) {
                setOpenUnsettle(false);
                setSelectedUnsettleData(null);
                closeModeOfPayments()
                setSaveDueUser(null)
                toast.success("Table settled successfully");
                queryClient.invalidateQueries({ queryKey: ["getUnsettledTables"] });
                return;
            }
        }
    })

    if (isPending) {
        return <SpinnerMemo />
    }


    return (
        <>{
            showPaymentMode ?
                <div className="pt-[2rem]">
                    <h3 className="flex items-center justify-between px-4 py-2 text-lg font-semibold text-gray-800">
                        <span>Payment Modes</span>
                        <span>₹{settleAmount}</span>
                    </h3>

                    {
                        showSplit ?
                            <MultipleModes paymentModes={paymentMode || []} billData={{ total: Number(settleAmount) || 0 }} />
                            :
                            <SingleMode paymentModes={paymentMode || []} billData={{ total: Number(settleAmount) || 0 }} />
                    }

                </div>
                :
                <ScrollArea className="h-[100vh] pt-4 ">
                    <div className="px-4 space-y-6 pb-[12rem]">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-gray-800">Settle Summary</h4>
                            <button type="button" onClick={() => setOpenUnsettle(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <h3 className="flex justify-between text-lg font-semibold text-gray-800">
                            <span>Table: {selectedUnsettleData?.tableId?.name}</span>
                        </h3>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <UserCircle className="w-5 h-5" />
                                        Captain: {captainData?.name || "Unknown"}
                                    </span>
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <Coins className="w-5 h-5" />
                                        Amount: ₹{selectedUnsettleData?.currentTableAmount || 0}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Settle Amount Input */}
                        <div className="mt-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Settle Amount (₹)</label>
                            <Input
                                type="number"
                                className="w-full px-3 py-2 text-sm border rounded-md"
                                placeholder="Enter amount received..."
                                value={settleAmount}
                                onChange={(e) => setSettleAmount(Number(e.target.value))}
                            />
                        </div>

                        {/* Settle Amount Input */}
                        <div className="mt-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Order Id*</label>
                            <Input
                                type="tel"
                                className="w-full px-3 py-2 text-sm border rounded-md"
                                placeholder="Enter Pos Order Id..."
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>

                        {/* Reason Selection */}
                        <div>
                            <h5 className="mb-3 text-sm font-medium text-gray-700">Choose a reason:</h5>
                            <motion.div className="flex flex-wrap gap-2">
                                <AnimatePresence>
                                    {predefinedReasons.map((reason) => (
                                        <motion.div
                                            key={reason}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Badge
                                                variant={selectedReason === reason ? "" : "outline"}
                                                className="px-3 py-1 text-sm transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setSelectedReason(reason);
                                                    setCustomReason(reason);
                                                }}
                                            >
                                                {reason}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Custom Reason Input */}
                        <div className="relative">
                            <Textarea
                                placeholder="Enter custom reason..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="w-full min-h-[100px] p-3 text-sm"
                                minLength={2}
                                maxLength={200}
                            />
                            <h3 className="absolute text-sm right-2 -bottom-6">{customReason?.length}/200</h3>
                        </div>
                    </div>
                </ScrollArea>
        }

            {
                showPaymentMode ?
                    <CommonBottomButton
                        position="mid"
                        fixed
                        maxWidth="30rem"
                        buttons={[
                            {
                                text: "Cancel",
                                onClick: closeModeOfPayments,
                                className: "rounded-md pl-3",
                                isBackButton: true,
                            },
                            {
                                text: "Split",
                                onClick: showSplit ? closeSplit : () => setShowSplit(!showSplit),
                                className: "rounded-md",
                            },
                            {
                                text: "Confirm",
                                onClick: () => { mutateAsync(); },
                                className: "rounded-md w-full",
                                disable: settleModes?.length === 0,
                                isLoading: isPending,
                            },
                        ]}
                    />
                    :
                    <CommonBottomButton
                        fixed={true}
                        maxWidth="30rem"
                        buttons={[
                            {
                                text: "Cancel",
                                onClick: () => setOpenUnsettle(false),
                                className: "w-full rounded-md pl-3",
                                isBackButton: true,
                            },
                            {
                                text: "Confirm",
                                onClick: () => { showModeOfPayments(); },
                                className: `w-full rounded-md ${(selectedReason === null && customReason.trim() === "") || orderId.trim() === ""
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                    }`,
                                disable: (selectedReason === null && customReason.trim() === "") || orderId.trim() === "",
                            },
                        ]}
                    />
            }</>
    )
}

const SettleTable = memo(MemoSettleTable)
export default SettleTable