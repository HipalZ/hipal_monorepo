import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Scan } from "lucide-react";
import QRCode from "react-qr-code";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";

const MemoQrCode = ({ data, qrBillId }) => {
    const selectedTable = useOrderStore((s) => s.selectedTable);
    const selectedBiz = useHiClientZ((s) => s.selectedBiz);

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
                    className="flex justify-center mb-4"
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

                {/* QR Code */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="p-4 mx-auto bg-white rounded-lg shadow-md w-max"
                >
                    <QRCode value={qrBillId || ""} size={180} />
                </motion.div>

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
        </Card>
    );
};

const QrCodePreview = memo(MemoQrCode);
export default QrCodePreview;
