import { useState, useMemo } from "react";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import type { IDuesPersonsData } from "@/components/types/businessData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { useParams } from "react-router-dom";
import {
  useGetAllModes,
  settleDues,
  useUserDuesHistory,
} from "@/hooks/useDuesApi";
import { useDues } from "@/components/store/useDues";
import MultipleModes from "./selectPaymentMode";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { History, CreditCard } from "lucide-react";
import { useReprintBill } from "@/hooks/useBill.ts";

interface ClearDuesProps {
  selectedUser: IDuesPersonsData;
  closeSettleDues: () => void;
}

interface HistoryItem {
  id: string;
  date: number;
  amount: number;
  type: "payment" | "dues";
  description: string;
  orderId?: string;
  runningBalance: number;
  show: boolean;
}

const MemoClearDues = ({ selectedUser, closeSettleDues }: ClearDuesProps) => {
  const { businessId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pay" | "history">("pay");
  const [selectMode, setSelectMode] = useState(false);
  const [amountToPay, setAmountToPay] = useState(
    selectedUser?.totalDuesAmount || 0,
  );
  const { settleModes, setSettleModes } = useDues();
  const { isLoading: payLoading, paymentMode } = useGetAllModes(
    businessId,
    selectMode && activeTab === "pay",
  );

  const { userDuesHistory, isLoading: historyLoading } = useUserDuesHistory(
    selectedUser?._id,
  );

  const { reprintBill } = useReprintBill()

  // Merge and sort history data chronologically
  const mergedHistory = useMemo(() => {
    if (!userDuesHistory?.data) return [];

    const historyItems: HistoryItem[] = [];

    // Add dues history (positive amounts)
    userDuesHistory.data.duesHistory.forEach((item) => {
      if (item.date) {
        historyItems.push({
          id: item._id,
          date: item.date,
          amount: item.settleAmount,
          type: "dues",
          description: `Dues Settlement - Invoice #${item.billInvoiceNumber}`,
          orderId: item.orderId || undefined,
          runningBalance: 0, // Will be calculated below
          show: false,
        });
      }
    });

    // Add payment history (negative amounts)
    userDuesHistory.data.payments.forEach((item) => {
      historyItems.push({
        id: item._id,
        date: item.date,
        amount: -item.total, // Negative for payments
        type: "payment",
        description: `Payment - ${item.tableName} (${item.paymentMode})`,
        orderId: item.order_id,
        runningBalance: 0, // Will be calculated below
        show: true,
      });
    });

    // Sort by date (newest first)
    historyItems.sort((a, b) => b.date - a.date);

    // Calculate running balance (from oldest to newest, then reverse)
    const reversedItems = [...historyItems].reverse();
    let runningBalance = 0;

    reversedItems.forEach((item) => {
      runningBalance += item.amount;
      item.runningBalance = runningBalance;
    });

    return historyItems;
  }, [userDuesHistory]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredAmount = Number(e.target.value) || 0;
    setAmountToPay(Math.min(enteredAmount, selectedUser?.totalDuesAmount));
  };

  const handlePaymentClick = (orderId?: string) => {
    reprintBill({
        orderId: orderId,
    })
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const amountInSettleModes = settleModes.reduce(
    (sum, mode) => sum + mode.amount,
    0,
  );

  const { isPending, mutateAsync } = useMutation({
    mutationFn: () =>
      settleDues(businessId, selectedUser?._id, settleModes, amountToPay),
    onSuccess: (data) => {
      if (!data.err) {
        closeSettleDues();
        setSelectMode(false);
        setSettleModes([]);
        queryClient.invalidateQueries({
          queryKey: ["allDueUsers", businessId],
        });
        return toast.success("Dues settled successfully");
      }
      toast.error(data.message);
    },
  });

  if (isPending) return <LoadingSpinner />;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="pt-4 text-center">
          <h1 className="text-2xl font-bold">{selectedUser?.userId?.name}</h1>
          <h2 className="text-xl text-muted-foreground">
            Total Dues: ₹{selectedUser?.totalDuesAmount}
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-4">
          <Button
            variant={activeTab === "pay" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("pay");
              setSelectMode(false);
            }}
            className="flex-1 flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Pay
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            className="flex-1 flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "pay" && !selectMode && (
          <div className="space-y-4">
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
          </div>
        )}

        {activeTab === "pay" && selectMode && (
          <div className="space-y-4">
            <section className="flex items-center justify-between px-4">
              <h2 className="text-lg text-muted-foreground">
                Amount Enter: ₹{amountToPay}
              </h2>
              <h2 className="text-lg text-muted-foreground">
                Remain: ₹{selectedUser.totalDuesAmount - amountToPay}
              </h2>
            </section>

            {payLoading ? (
              <LoadingSpinner />
            ) : (
              <MultipleModes
                paymentModes={paymentMode}
                totalAmount={Number(amountToPay)}
              />
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="px-4 space-y-4 max-h-96 overflow-y-auto">
            {historyLoading ? (
              <LoadingSpinner />
            ) : mergedHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No history found
              </div>
            ) : (
              mergedHistory.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer relative hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <p className="font-medium text-sm mt-1">
                          {item.description}
                        </p>
                        {item.orderId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Order ID: {item.orderId}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold ${
                            item.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.amount > 0 ? "+" : ""}₹{Math.abs(item.amount)}
                        </div>
                      </div>
                    </div>
                    {item.show && (
                      <Button
                        onClick={() => handlePaymentClick(item.orderId)}
                        variant="outline"
                        className="absolute bottom-2 right-2 p-2 text-xs px-4"
                      >
                        Print
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Bottom Buttons */}
        <AdvancedBottomButton
          maxWidth="30rem"
          shadow
          buttons={
            activeTab === "pay" && !selectMode
              ? [
                  {
                    text: "Close",
                    onClick: closeSettleDues,
                    isBackButton: true,
                    className: "rounded-md pl-3",
                  },
                  {
                    text: `Settle ₹${amountToPay}`,
                    onClick: () => {
                      if (amountToPay === 0) return;
                      setSelectMode(true);
                    },
                    swipe: true,
                    disable: amountToPay === 0,
                    className: "rounded-md w-full",
                  },
                ]
              : activeTab === "pay" && selectMode
                ? [
                    {
                      text: "Back",
                      onClick: () => setSelectMode(false),
                      isBackButton: true,
                      className: "rounded-md pl-3",
                    },
                    {
                      text: `Confirm ₹${amountToPay}`,
                      onClick: async () => {
                        if (
                          amountToPay === 0 ||
                          amountInSettleModes !== amountToPay
                        ) {
                          return toast.error(
                            "Entered amount and settled amount must match",
                          );
                        }
                        await mutateAsync();
                      },
                      className: "rounded-md w-full",
                      swipe: true,
                      disable:
                        settleModes.length === 0 ||
                        amountInSettleModes !== amountToPay,
                      isLoading: isPending,
                    },
                  ]
                : [
                    {
                      text: "Close",
                      onClick: closeSettleDues,
                      className: "rounded-md w-full",
                    },
                  ]
          }
        />
      </div>
    </>
  );
};

const ClearDues = memo(MemoClearDues);
export default ClearDues;
