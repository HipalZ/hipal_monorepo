import { memo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRpc } from "@hi/common";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Phone, ChevronDown, ChevronUp } from 'lucide-react';
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import { MdTableBar } from "react-icons/md";
import CommonBottomButton from "../bottomButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useScreenSize } from "@/hooks/useScreenSize";
import ForceSettle from "./forceSettle";
import BottomPopUp from "../universalPopup";
import type { IBillData } from "@/components/types/hiClientzData";
import QrCodePreview from "./qrCode";
import Normalsettle from "./normalsettle";

const MemoGetBill = () => {
    const { businessId } = useParams();
    const queryClient = useQueryClient();
    const selectedTable = useOrderStore((s) => s.selectedTable);
    const screenSize = useScreenSize()
    const { captainData: userData } = useHiClientZ();
    const [qrBillId, setQrBillId] = useState<string | null>(null);
    const [showqr, setShowqr] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [forceSettle, setForceSettle] = useState<boolean>(false);
    const [normalSettle, setNormalSettle] = useState<boolean>(false);

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
        staleTime: 1000 * 60,
        initialData: () => {
            return queryClient.getQueryData([
                "getTableBill",
                businessId,
                selectedTable?.name,
                userData?.name,
            ]);
        }
    });

    const toggleQr = () => {
        setShowqr(!showqr);
    }

    const closeForceSettle = () => {
        setForceSettle(false);
    }

    const closeNormalSettle = () => {
        setNormalSettle(false);
    }

    const { isPending, mutate } = useMutation({
        mutationFn: async () => {
            const response = await apiRpc.table.hi_settle.$post({
                json: {
                    tableId: selectedTable?._id || "",
                    captainId: userData?._id,
                    billRequestId: data?.billRequestId ?? "",
                }
            })
            if (response.status === 200) {
                const result = await response.json();
                setQrBillId(result?.data?.path);
                setShowqr(true);
            }
            return response.json()
        }
    })

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
        <>
            {!showqr && (
                <Card className="max-w-md py-[5rem] md:py-[8rem] h-[70dvh] mx-auto mb-8 border border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Bill Summary</span>
                            <Button variant="outline" onClick={() => setForceSettle(true)}>
                                Force Settle
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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

                        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="justify-between w-full">
                                    <h3 className="font-semibold">Items: {data?.items?.length}</h3>
                                    {isExpanded ? <ChevronUp strokeWidth={4} className="w-4 h-4" /> : <ChevronDown strokeWidth={4} className="w-4 h-4" />}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 overflow-auto max-h-[40vh] hide-scrollbar py-2">
                                {data?.items?.map((item, index) => (
                                    <div key={index} className="p-2 text-sm rounded-md bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{item?.dish?.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-600">Qty: {item?.dish?.quantity}</p>
                                                <p>₹{item?.dish?.quantity * item?.dish?.price}</p>
                                            </div>
                                        </div>
                                        {item?.extras?.length > 0 && (
                                            <div className="mt-1 text-xs text-gray-600">
                                                <p className="font-medium">Extras:</p>
                                                {item?.extras?.map((extra, idx) => (
                                                    <p key={idx}>
                                                        {extra?.name} - ₹{extra?.price} x {extra?.quantity}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>

                        <Separator className="my-4" />

                        <div className="mb-4 space-y-3">
                            {Object.entries(data).map(([key, value]) => {
                                if (
                                    (typeof value === "number" && value === 0) ||
                                    ["customerName", "customerPhone", "tableName", "total", "billRequestId", "billing_user_name", "items"].includes(key)
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
                        <div className="flex justify-between text-lg font-bold">
                            <p>Total</p>
                            <p>₹{data?.total.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {
                forceSettle && (
                    <BottomPopUp width="w-[30rem]" hide show={forceSettle} onClose={() => setForceSettle(false)}>
                        <ForceSettle closeForceSettle={closeForceSettle} data={data} />
                    </BottomPopUp>
                )
            }

            {
                showqr && (
                    <BottomPopUp width="w-[30rem]" hide show={showqr} onClose={() => setShowqr(false)}>
                        <QrCodePreview data={data} qrBillId={qrBillId} toggleQr={toggleQr} />
                    </BottomPopUp>
                )
            }
            {
                normalSettle && (
                    <BottomPopUp height="h-[70dvh]" width="w-[30rem]" show={normalSettle} onClose={() => setNormalSettle(false)}>
                        <Normalsettle closeNormalSettle={closeNormalSettle} data={data} />
                    </BottomPopUp>
                )
            }

            <CommonBottomButton
                offset={screenSize === "xs" ? "4.5rem"
                    : screenSize === "md" ? "5rem" : "0"}
                maxWidth={screenSize === "xs" ? "30rem" : "48rem"}
                backgroundColor={screenSize === "xs" ? "" : "white"}
                buttons={
                    [
                        {
                            text: "Normal Settle",
                            onClick: () => { setNormalSettle(true) },
                            className: "rounded-md"
                        },
                        {
                            text: "Hi Settle",
                            onClick: () => { mutate() },
                            disable: isPending,
                            isLoading: isPending,
                            highlight: true,
                            className: "rounded-md"
                        }
                    ]
                }
            />
        </>
    );
};

const GetBill = memo(MemoGetBill);
export default GetBill;

