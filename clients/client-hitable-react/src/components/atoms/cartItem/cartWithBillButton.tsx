import { useState } from "react";
import { motion } from "framer-motion";
import { FaShareAlt, FaTimes } from "react-icons/fa";
import QRCode from "react-qr-code";
import useBusinessData from "@/components/store/useBusinessData";
import { QrCodeIcon } from "lucide-react";

type CreateBillButtonProps = {
  className?: string;
};

const CreateBillButton = ({ className = "" }: CreateBillButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [generatedQR, setGeneratedQR] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const handleCreateBill = () => {
    setIsOpen(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };

  const generateQRCode = () => {
    if (!amount || Number.parseFloat(amount) <= 0) return;

    // Generate a payment link (this would be your actual payment link in production)
    const link = `https://hipal-test.hipalz.com/${businessId}/payment?amount=${amount}`;
    setPaymentLink(link);
    setGeneratedQR(true);
  };

  const shareToWhatsApp = () => {
    const message = `Please pay ₹${amount} using this link: ${paymentLink}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  };

  const closeDialog = () => {
    setIsOpen(false);
    setAmount("");
    setGeneratedQR(false);
    setPaymentLink("");
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <motion.button
        onClick={handleCreateBill}
        className={`flex items-center gap-2 px-4 py-2 text-white bg-purple-500 rounded-lg shadow-md ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <QrCodeIcon size={14} />
        Create Bill
      </motion.button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl"
          >
            <button
              type="button"
              onClick={closeDialog}
              className="absolute p-2 text-gray-500 rounded-full top-2 right-2 hover:bg-gray-100"
            >
              <FaTimes />
            </button>

            <h2 className="mb-4 text-xl font-bold text-gray-800">
              {generatedQR ? "Payment QR Code" : "Create Bill"}
            </h2>

            {!generatedQR ? (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="amount"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Enter Amount (₹)
                  </label>
                  <input
                    id="amount"
                    type="text"
                    value={amount}
                    maxLength={6}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <motion.button
                  onClick={generateQRCode}
                  disabled={!amount || Number.parseFloat(amount) <= 0}
                  className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Generate QR
                </motion.button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="p-4 mb-4 bg-white border rounded-lg">
                  <QRCode value={paymentLink} size={200} />
                </div>

                <div className="flex items-center w-full gap-2 mb-4">
                  <input
                    value={paymentLink}
                    readOnly
                    className="w-full px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg"
                  />
                  <motion.button
                    onClick={shareToWhatsApp}
                    className="p-2 text-white bg-green-500 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Share to WhatsApp"
                  >
                    <FaShareAlt />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CreateBillButton;
