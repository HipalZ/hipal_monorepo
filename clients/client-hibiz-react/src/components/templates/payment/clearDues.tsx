import { useState } from "react";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import type { IDuesPersonsData } from "@/components/types/businessData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { useParams } from "react-router-dom";
import { useGetAllModes, settleDues } from "@/hooks/useDuesApi";
import { useDues } from "@/components/store/useDues";
import MultipleModes from "./selectPaymentMode";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const MemoClearDues = ({ selectedUser, closeSettleDues }: {
    selectedUser: IDuesPersonsData;
    closeSettleDues: () => void;
}) => {
    const { businessId } = useParams();
    const queryClient = useQueryClient();
    const [selectMode, setSelectMode] = useState(false);
    const [amountToPay, setAmountToPay] = useState(selectedUser?.totalDuesAmount || 0);
    const { settleModes, setSettleModes } = useDues();
    const { isLoading: payLoading, paymentMode } = useGetAllModes(businessId, selectMode);

    const handleAmountChange = (e) => {
        const enteredAmount = Number(e.target.value) || 0;
        setAmountToPay(Math.min(enteredAmount, selectedUser?.totalDuesAmount));
    };

    const amountInSettleModes = settleModes.reduce((sum, mode) => sum + mode.amount, 0);

    const { isPending, mutateAsync } = useMutation({
        mutationFn: () => settleDues(businessId, selectedUser?._id, settleModes, amountToPay),
        onSuccess: (data) => {
            if (!data.err) {
                closeSettleDues();
                setSelectMode(false);
                setSettleModes([]);
                queryClient.invalidateQueries({ queryKey: ["allDueUsers", businessId] });
                return toast.success("Dues settled successfully");
            }
            toast.error(data.message);
        },
    });

    if (isPending) return <LoadingSpinner />;

    return (
        <>
            {!selectMode ? (
                <div className="space-y-6">
                    <div className="pt-4 text-center">
                        <h1 className="text-2xl font-bold">{selectedUser?.userId?.name}</h1>
                        <h2 className="text-xl text-muted-foreground">Total Dues: {amountToPay}</h2>
                    </div>

                    {/* Input Field for Custom Amount */}
                    <div className="px-4 space-y-2">
                        <Label htmlFor="amount">Enter Amount to Pay</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            max={selectedUser?.totalDuesAmount}
                            value={amountToPay}
                            onChange={handleAmountChange}
                            className="w-full p-2 text-lg border rounded-lg"
                        />
                    </div>

                    <AdvancedBottomButton
                        maxWidth="30rem"
                        shadow
                        buttons={[
                            {
                                text: "Close",
                                onClick: closeSettleDues,
                                isBackButton: true,
                                className: "rounded-md pl-3",
                            },
                            {
                                text: `Settle ${amountToPay}`,
                                onClick: () => {
                                    if (amountToPay === 0) return;
                                    setSelectMode(true);
                                },
                                swipe: true,
                                disable: amountToPay === 0,
                            },
                        ]}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="pt-4 text-center">
                        <h1 className="text-2xl font-bold">{selectedUser?.userId?.name}</h1>
                        <h2 className="text-xl text-muted-foreground">Total Dues: {selectedUser.totalDuesAmount}</h2>
                        <section className="flex items-center justify-between px-4">
                            <h2 className="text-xl text-muted-foreground">Amount Enter: {amountToPay}</h2>
                            <h2 className="text-xl text-muted-foreground">Remain: {selectedUser.totalDuesAmount - amountToPay}</h2>
                        </section>
                    </div>

                    {payLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <MultipleModes paymentModes={paymentMode} totalAmount={Number(amountToPay)} />
                    )}

                    <AdvancedBottomButton
                        maxWidth="30rem"
                        shadow
                        buttons={[
                            {
                                text: "Close",
                                onClick: () => setSelectMode(false),
                                isBackButton: true,
                                className: "rounded-md pl-3",
                            },
                            {
                                text: `Confirm ${amountToPay}`,
                                onClick: async () => {
                                    if (amountToPay === 0 || amountInSettleModes !== amountToPay) {
                                        return toast.error("Entered amount and settled amount must match");
                                    }
                                    await mutateAsync();
                                },
                                swipe: true,
                                disable: settleModes.length === 0 || amountInSettleModes !== amountToPay,
                                isLoading: isPending,
                            },
                        ]}
                    />
                </div>
            )}
        </>
    );
};

const ClearDues = memo(MemoClearDues);
export default ClearDues;
