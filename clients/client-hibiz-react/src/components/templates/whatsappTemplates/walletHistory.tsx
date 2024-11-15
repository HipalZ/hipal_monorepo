import { memo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import useWhatsapp from "@/components/store/useWhatsapp";

const MemoWalletHistory = () => {
  const { walletHistory } = useWhatsapp((s) => ({
    walletHistory: s.walletHistory,
  }));
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="h-[400px] overflow-y-auto mx-4 overflow-hidden rounded-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Wallet History
        </h2>
      </div>
      <section className="grid gap-2 md:grid-cols-3">
        {walletHistory.map((transaction) => (
          <motion.div
            key={transaction._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setHoveredId(transaction._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="mb-2 overflow-hidden bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      transaction?.order_id?.total > 0
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-6 h-6 ${
                        transaction?.order_id?.total > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          transaction?.order_id?.total > 0
                            ? "M7 11l5-5m0 0l5 5m-5-5v12"
                            : "M17 13l-5 5m0 0l-5-5m5 5V6"
                        }
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction?.order_id?.total > 0 ? "Credit" : "Debit"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.date), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      transaction?.order_id?.total > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction?.order_id?.total > 0 ? "+" : "-"}₹
                    {Math.abs(transaction?.order_id?.total).toFixed(2)}
                  </p>
                </div>
              </div>
              {hoveredId === transaction._id && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.2 }}
                  className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ transformOrigin: "bottom" }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

const WalletHistory = memo(MemoWalletHistory);
export default WalletHistory;
