import { memo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRpc } from '@hi/common';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone } from 'lucide-react';
import CommonBottomButton from '../bottomButton';
import SpinnerMemo from '@/components/atoms/loadingSpinner';
import toast from 'react-hot-toast';
import type { IBillData } from '@/components/types/hiClientzData';
import { useOrderStore } from '@/components/store/useOrderData';
import { useHiClientZ } from '@/components/store/useHiClientzData';

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

const MemoNormalsettle = ({ closeNormalSettle, data: billData }: { data: IBillData; closeNormalSettle: () => void }) => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const { selectedTable, setOpenOrderModal } = useOrderStore();
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const captainData = useHiClientZ((s) => s.captainData);

    const getAllModes = async () => {
        const response = await apiRpc.upi_mode.all[':businessId'].$get({
            param: {
                businessId: businessId || "",
            },
        });
        const res = await response.json();
        return res?.data as IMode[] || [];
    };

    const { isLoading, data } = useQuery({
        queryKey: ["getAllModes", businessId],
        queryFn: getAllModes,
        enabled: !!businessId,
        staleTime: 1000 * 60,
    });

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: any) => {
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
            closeNormalSettle();
            setOpenOrderModal(false);
            return navigate(`/${businessId}/alerts`);
        },
        onError: (error: any) => {
            toast.error(error?.message || "Something went wrong.");
        },
    });

    const handleConfirm = async () => {
        if (!selectedMode) {
            return toast.error("Please select a payment mode.");
        }

        const payload = {
            tableId: selectedTable?._id,
            billRequestId: billData?.billRequestId,
            captainId: captainData?._id,
            paymentModeId: selectedMode,
        };

        try {
            await mutateAsync(payload);
        } catch (error) {
            console.error(error);
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
            <h2 className="pt-4 mb-6 text-2xl font-bold text-center">Select Payment Mode</h2>
            <RadioGroup value={selectedMode || ""} onValueChange={setSelectedMode}>
                <div className="flex flex-col px-4 gap-4 min-h-[80vh] overflow-auto hide-scrollbar">
                    {data?.map((mode) => (
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
                                        className="flex items-center space-x-4 cursor-pointer"
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

            <div className="mt-8">
                <CommonBottomButton
                    fixed={true}
                    maxWidth="30rem"
                    buttons={[
                        {
                            text: "Cancel",
                            onClick: closeNormalSettle,
                            className: "w-full rounded-md pl-3",
                            isBackButton: true,
                        },
                        {
                            text: "Confirm",
                            onClick: handleConfirm,
                            className: `w-full rounded-md ${!selectedMode ? 'opacity-50 cursor-not-allowed' : ''}`,
                            disable: !selectedMode,
                            isLoading: isPending,
                        },
                    ]}
                />
            </div>
        </section>
    );
};

const Normalsettle = memo(MemoNormalsettle);
export default Normalsettle;
