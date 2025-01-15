import { memo, useState } from "react";
import { AlertTriangle, Banknote, Coins, CreditCard, Smartphone, UserCircle, X } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomPopUp from "../universalPopup";
import CommonBottomButton from "../bottomButton";
import { useOrderStore } from "@/components/store/useOrderData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import type { IBillData } from "@/components/types/hiClientzData";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface IMode {
    _id: string;
    name: string;
    active: boolean;
}

const ModeIcon = ({ name }: { name: string }) => {
    switch (name.toLowerCase()) {
        case 'cash':
            return <Banknote className="w-6 h-6" />;
        case 'upi':
            return <Smartphone className="w-6 h-6" />;
        default:
            return <CreditCard className="w-6 h-6" />;
    }
};

const MemoForceSettle = ({ closeForceSettle, data }: { closeForceSettle: () => void; data?: IBillData }) => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [forceSettle, setForceSettle] = useState<boolean>(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState<string>("");
    const [settleAmount, setSettleAmount] = useState<number | "">(0);
    const [showPaymentMode, setShowPaymentMode] = useState<boolean>(false);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);

    const predefinedReasons = [
        "Trial",
        "Duplication",
        "Waiter Problem",
        "Customer Led Problem",
    ];

    const { selectedTable, setOpenOrderModal } = useOrderStore();
    const captainData = useHiClientZ((s) => s.captainData);

    const handleForceSettle = () => {
        setForceSettle(true);
    };

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ["forceSettle", selectedTable?._id, customReason, captainData?._id],
        mutationFn: async (payload: any) => {
            const response = await apiRpc.table.force_settle.$post({
                json: {
                    tableId: payload.tableId || "",
                    reasonForForceSettle: payload?.reason || "",
                    captainId: payload.captainId || "",
                    billRequestId: payload.billId || "",
                    settleAmount: payload.settleAmount || 0,
                    paymentModeId: selectedMode || "",
                },
            });
            const res = await response.json();
            return res;
        },
    });

    const showModeOfPayments = () => {
        setShowPaymentMode(true);
    }

    const closeModeOfPayments = () => {
        setShowPaymentMode(false);
    }

    const getAllModes = async () => {
        const response = await apiRpc.upi_mode.all[':businessId'].$get({
            param: {
                businessId: businessId || "",
            },
        });
        const res = await response.json();
        return res?.data as IMode[] || [];
    };

    // Query to fetch payment modes
    const { isLoading, data: paymentMode } = useQuery({
        queryKey: ["getAllModes", businessId],
        queryFn: getAllModes,
        enabled: !!businessId && !!showPaymentMode,
        staleTime: 1000 * 60,
    });

    const handleConfirmForceSettle = async () => {
        if (!selectedReason && customReason.trim() === "") {
            return toast.error("Please enter a reason");
        }

        if (settleAmount === "" || settleAmount <= 0) {
            return toast.error("Please enter a valid settle amount");
        }

        try {
            const payload = {
                tableId: selectedTable?._id,
                reason: selectedReason || customReason,
                captainId: captainData?._id,
                billId: data?.billRequestId,
                settleAmount,
            };

            const response = await mutateAsync(payload);

            if (response?.err) {
                toast.error(response?.message || "Force settle failed");
            } else {
                toast.success("Table force settled successfully");
                setForceSettle(false);
                setOpenOrderModal(false);
                navigate(`/${businessId}/alerts`);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <Card className="w-full mx-auto mt-[7rem] md:mt-[8.5rem] shadow-none border-none">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                    Force Settle
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <p className="px-6 mb-6 text-base font-semibold text-gray-600">
                    Do you want to free this table, remove table code, users & orders?
                </p>
                <CommonBottomButton
                    fixed
                    maxWidth="30rem"
                    buttons={[
                        {
                            text: "Settle this table",
                            onClick: closeForceSettle,
                            className: "rounded-md",
                            highlight: true,
                            isBackButton: true,
                        },
                        {
                            text: "Force Settle",
                            onClick: handleForceSettle,
                            className: "rounded-md",
                        },
                    ]}
                />
            </CardContent>

            <BottomPopUp width="w-[30rem]" hide show={forceSettle} onClose={() => setForceSettle(false)}>
                {
                    showPaymentMode ? <section className="w-full max-w-[30rem]">
                        <h2 className="pt-4 mb-6 text-2xl font-bold text-center">Select Payment Mode</h2>
                        <RadioGroup value={selectedMode || ""} onValueChange={setSelectedMode}>
                            <div className="flex flex-col px-4 gap-4 h-[60vh] overflow-auto hide-scrollbar pb-[7rem]">
                                {paymentMode?.map((mode) => (
                                    <motion.div
                                        key={mode._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className={`cursor-pointer transition-all ${selectedMode === mode._id ? 'border-primary' : ''}`}>
                                            <CardContent className="p-4">
                                                <RadioGroupItem
                                                    value={mode._id}
                                                    id={mode._id}
                                                    className="sr-only peer"
                                                    disabled={!mode.active}
                                                />
                                                <Label
                                                    htmlFor={mode._id}
                                                    className={`flex items-center space-x-4 cursor-pointer ${!mode.active ? 'cursor-not-allowed' : ''}`}
                                                >
                                                    <div className="flex-shrink-0">
                                                        <ModeIcon name={mode.name} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium capitalize">{mode.name}</p>
                                                        {!mode.active && (
                                                            <p className="text-sm text-muted-foreground">Currently unavailable</p>
                                                        )}
                                                    </div>
                                                </Label>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </RadioGroup>
                    </section> :
                        <ScrollArea className="h-[80vh] py-6">
                            <div className="px-4 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xl font-bold text-gray-800">Force Settle Summary</h4>
                                    <button type="button" onClick={() => setForceSettle(false)} className="text-gray-500 hover:text-gray-700">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <h3 className="flex justify-between text-lg font-semibold text-gray-800">
                                    <span>Table: {selectedTable?.name}</span>
                                    Code: {selectedTable?.hiCode}
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
                                                Amount: ₹{selectedTable?.currentTableAmount || 0}
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
                                                        variant={selectedReason === reason ? "secondary" : "outline"}
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
                                    text: "Confirm",
                                    onClick: () => { handleConfirmForceSettle(); },
                                    className: "rounded-md w-full",
                                    disable: !selectedMode,
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
                                    onClick: closeForceSettle,
                                    className: "w-full rounded-md pl-3",
                                    isBackButton: true,
                                },
                                {
                                    text: "Confirm",
                                    onClick: () => { showModeOfPayments(); },
                                    className: `w-full rounded-md ${selectedReason === null && customReason.trim() === "" ? 'opacity-50 cursor-not-allowed' : ''}`,
                                    disable: selectedReason === null && customReason.trim() === "",
                                },
                            ]}
                        />
                }

            </BottomPopUp>
        </Card>
    );
};

const ForceSettle = memo(MemoForceSettle);
export default ForceSettle;
