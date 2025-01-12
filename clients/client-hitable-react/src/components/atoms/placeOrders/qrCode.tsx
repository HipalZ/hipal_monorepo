import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Scan, Loader2 } from "lucide-react"; // Added Loader icon
import QRCode from "react-qr-code";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import type { IBillData } from "@/components/types/hiClientzData";
import CommonBottomButton from "../bottomButton";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useNavigate, useParams } from "react-router-dom";

const MemoQrCode = ({ data, qrBillId, toggleQr }: { data: IBillData; qrBillId: string; toggleQr: () => void }) => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const selectedTable = useOrderStore((s) => s.selectedTable);
    const selectedBiz = useHiClientZ((s) => s.selectedBiz);
    const [showStatus, setShowStatus] = useState<boolean>(false);
    const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);

    // API call to fetch bill status
    const webhook = async () => {
        const response = await apiRpc.table.qr_webhook[":billRequestId"].$get({
            param: { billRequestId: data?.billRequestId || "" },
        });
        const json = await response.json();
        return json.data;
    };

    // React Query with refetch interval
    const { data: billStatus, isFetching } = useQuery({
        queryKey: ["webhook", data?.billRequestId],
        queryFn: webhook,
        enabled: !!data?.billRequestId && showStatus,
        refetchInterval: 5000,
    });

    // Handle redirection on success or reset QR on failure
    useEffect(() => {
        if (billStatus?.status === "SUCCESS") {
            setTimeout(() => {
                setOpenOrderModal(false);
                navigate(`/${businessId}/alerts`);
            }, 4000);
        }
        if (billStatus?.status === "FAILED") {
            setTimeout(() => {
                setShowStatus(false);
            }, 10000);
        }
    }, [billStatus, navigate, businessId]);

    // Toggle showStatus state
    const toggleFn = () => {
        setShowStatus(!showStatus);
    };

    const renderContent = () => {
        if (isFetching) {
            return (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-12 h-12 text-gray-500 animate-spin" />
                </div>
            );
        }

        if (billStatus?.status === "SUCCESS") {
            return (
                <div className="flex items-center justify-center h-48 text-green-600">
                    <h3 className="text-xl font-bold">Payment Successful 🎉</h3>
                </div>
            );
        }

        if (billStatus?.status === "FAILED") {
            return (
                <div className="flex items-center justify-center h-48 text-red-600">
                    <h3 className="text-xl font-bold">Payment Failed ❌</h3>
                </div>
            );
        }

        if (showStatus) {
            return (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-12 h-12 text-gray-500 animate-spin" />
                </div>
            );
        }

        // Show QR Code if no status is being fetched
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-4 mx-auto bg-white rounded-lg shadow-md w-max"
            >
                <QRCode value={qrBillId || ""} size={180} />
            </motion.div>
        );
    };

    return (
        <Card className="relative max-w-lg mx-auto border-none shadow-none">
            <CardContent className="p-6">
                {/* Table Name and Count */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Table: {selectedTable?.name}
                    </h2>
                </div>

                {/* Business Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-4 -mt-8"
                >
                    <img
                        src={selectedBiz?.businessId?.logo}
                        alt="Business Logo"
                        width={80}
                        height={80}
                        className="rounded-full shadow-md"
                    />
                </motion.div>

                {/* Business Name */}
                <h3 className="mb-6 text-xl font-bold text-center text-gray-800">
                    {selectedBiz?.businessId?.name}
                </h3>

                <Separator className="w-full my-4" />

                {/* Hi Settle Heading */}
                <div className="mb-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700">Hi Settle</h3>
                    <p className="text-sm text-gray-600">
                        Scan to pay your bill with rewardz
                    </p>
                </div>

                {/* Dynamic Content (QR Code, Loader, or Status) */}
                {renderContent()}

                {/* Total Amount */}
                <div className="flex items-center justify-center mt-6 space-x-2">
                    <CreditCard className="w-6 h-6 text-green-500" />
                    <h3 className="text-2xl font-bold text-gray-800">
                        Total: ₹{data?.total.toFixed(2)}
                    </h3>
                </div>

                {/* Scan Instructions */}
                <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
                    <Scan className="w-4 h-4 mr-2" />
                    <p>Scan the QR code to complete your payment</p>
                </div>
            </CardContent>

            {/* Bottom Buttons */}
            <CommonBottomButton
                fixed
                buttons={[
                    {
                        text: "Close",
                        onClick: toggleQr,
                        type: "button",
                        className: "pl-3 rounded-md",
                        disable: showStatus,
                        isBackButton: true,
                    },
                    {
                        text: showStatus ? "Hide Status" : "Show Status",
                        onClick: toggleFn,
                        type: "button",
                        className: "rounded-md",
                    },
                ]}
            />
        </Card>
    );
};

const QrCodePreview = memo(MemoQrCode);
export default QrCodePreview;
