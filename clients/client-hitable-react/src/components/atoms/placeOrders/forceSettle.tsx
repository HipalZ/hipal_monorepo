import { memo, useState } from "react";
import { AlertTriangle, Coins, UserCircle, X } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomPopUp from "../universalPopup";
import CommonBottomButton from "../bottomButton";
import { useOrderStore } from "@/components/store/useOrderData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";

const MemoForceSettle = ({ closeForceSettle }: { closeForceSettle: () => void }) => {
    const [forceSettle, setForceSettle] = useState<boolean>(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState<string>("");

    const predefinedReasons = [
        "Trial",
        "Duplication",
        "Waiter Problem",
        "Customer Led Problem",
    ];

    const selectedTable = useOrderStore((s) => s.selectedTable);
    const captainData = useHiClientZ((s) => s.captainData);

    const handleForceSettle = () => {
        setForceSettle(true);
    };



    const { mutateAsync, isPending } = useMutation({
        mutationKey: ["forceSettle", selectedTable?._id, customReason, captainData?._id],
        mutationFn: async (payload) => {
            const response = await apiRpc.table.force_settle.$post({
                json: {
                    tableId: payload.tableId || "",
                    reasonForForceSettle: payload?.reason || "",
                    captainId: payload.captainId || "",
                    billRequestId: payload.billId || "",
                    settleAmount: payload.settleAmount || 0
                },
            });
            const res = await response.json();
            return res;
        }
    })

    const handleConfirmForceSettle = () => {
        if (customReason?.trim() === "" || selectedReason?.trim() === "") {
            return toast.error("Please enter a reason");
        }
    }

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
                    offset="8rem"
                    maxWidth="31.5rem"
                    buttons={[
                        {
                            text: "Settle this table",
                            onClick: closeForceSettle,
                            className: "rounded-md",
                            highlight: true,
                        },
                        {
                            text: "Force Settle",
                            onClick: handleForceSettle,
                            className: "rounded-md bg-red-600 hover:bg-red-700 text-white",
                        },
                    ]}
                />
            </CardContent>

            <BottomPopUp width="30rem" hide show={forceSettle} onClose={() => setForceSettle(false)}>
                <ScrollArea className="h-[80vh] py-6">
                    <div className="px-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-gray-800">Force Settle Summary</h4>
                            <button type="button" onClick={() => setForceSettle(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <h3 className="flex justify-between text-lg font-semibold text-gray-800">
                            <span>Table:  - {selectedTable?.name}</span>
                            Code : -{selectedTable?.hiCode}
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
                                                    setSelectedReason(reason)
                                                    setCustomReason(reason)
                                                }}
                                            >
                                                {reason}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        <Separator />

                        <div className="relative">
                            <h5 className="mb-2 text-sm font-medium text-gray-700">Or enter a custom reason:</h5>
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

                <CommonBottomButton
                    position="mid"
                    fixed
                    maxWidth="31.55rem"
                    buttons={[
                        {
                            text: "Cancel",
                            onClick: () => setForceSettle(false),
                            className: "rounded-md pl-3",
                            isBackButton: true,
                        },
                        {
                            text: "Confirm Force Settle",
                            onClick: handleConfirmForceSettle,
                            className: "rounded-md bg-red-600 hover:bg-red-700 text-white",
                            disable: !selectedReason && !customReason && isPending,
                        },
                    ]}
                />
            </BottomPopUp>
        </Card>
    );
};

const ForceSettle = memo(MemoForceSettle);
export default ForceSettle;

