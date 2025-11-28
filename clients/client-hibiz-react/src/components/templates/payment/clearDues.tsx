import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import { useDues } from '@/components/store/useDues';
import type { IDuesPersonsData } from '@/components/types/businessData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReprintBill } from '@/hooks/useBill.ts';
import { settleDues, useGetAllModes, useUserDuesHistory } from '@/hooks/useDuesApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, History } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import MultipleModes from './selectPaymentMode';

interface ClearDuesProps {
  selectedUser: IDuesPersonsData;
  closeSettleDues: () => void;
}

interface HistoryItem {
  id: string;
  date: number;
  amount: number;
  type: 'payment' | 'dues';
  description: string;
  orderId?: string;
  runningBalance: number;
  show: boolean;
}

const MemoClearDues = ({ selectedUser, closeSettleDues }: ClearDuesProps) => {
  const { businessId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pay' | 'history'>('pay');
  const [selectMode, setSelectMode] = useState(false);
  const [amountToPay, setAmountToPay] = useState(selectedUser?.totalDuesAmount || 0);
  const { settleModes, setSettleModes } = useDues();
  const { isLoading: payLoading, paymentMode } = useGetAllModes(businessId, selectMode && activeTab === 'pay');

  const { userDuesHistory, isLoading: historyLoading } = useUserDuesHistory(selectedUser?._id);

  const { reprintBill } = useReprintBill();

  const toTs = (d: number | string | Date | undefined): number => (typeof d === 'number' ? d : d ? new Date(d).getTime() : 0);

  const mergedHistory = useMemo<HistoryItem[]>(() => {
    if (!userDuesHistory) return [];

    const items: HistoryItem[] = [];

    for (const item of userDuesHistory.duesHistory ?? []) {
      const ts = toTs(item?.date);
      if (!ts) continue;
      items.push({
        id: item._id,
        date: ts,
        amount: item.settleAmount ?? 0,
        type: 'dues',
        description: `Dues Settlement - Invoice #${item.billInvoiceNumber ?? '—'}`,
        orderId: item.orderId || undefined,
        runningBalance: 0,
        show: false,
      });
    }

    for (const p of userDuesHistory.payments ?? []) {
      const ts = toTs(p?.date);
      if (!ts) continue;
      items.push({
        id: p._id,
        date: ts,
        amount: -(p.total ?? 0),
        type: 'payment',
        description: `Payment - ${p.tableName ?? 'Order'}${p.paymentMode ? ` (${p.paymentMode})` : ''}`,
        orderId: p.order_id || undefined,
        runningBalance: 0,
        show: true,
      });
    }

    items.sort((a, b) => a.date - b.date);
    let running = 0;
    for (const it of items) {
      running += it.amount;
      it.runningBalance = running;
    }

    items.sort((a, b) => b.date - a.date);
    return items;
  }, [userDuesHistory]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredAmount = Number(e.target.value) || 0;
    setAmountToPay(Math.min(enteredAmount, selectedUser?.totalDuesAmount));
  };

  const handlePaymentClick = async (orderId?: string) => {
    await reprintBill({
      orderId: orderId,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const amountInSettleModes = settleModes.reduce((sum, mode) => sum + mode.amount, 0);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: () => settleDues(businessId, selectedUser?._id, settleModes),
    onSuccess: (data) => {
      if (!data.err) {
        closeSettleDues();
        setSelectMode(false);
        setSettleModes([]);
        queryClient.invalidateQueries({
          queryKey: ['allDueUsers', businessId],
        });
        return toast.success('Dues settled successfully');
      }
      toast.error(data.message);
    },
  });

  const filteredPaymentModes = useMemo(() => {
    return paymentMode?.filter((pm) => pm?.name?.toLowerCase() !== 'complementary');
  }, [paymentMode]);
  if (isPending) return <LoadingSpinner />;
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="pt-4 text-center">
          <h1 className="text-2xl font-bold">{selectedUser?.userId?.name}</h1>
          <h2 className="text-muted-foreground text-xl">Total Dues: ₹{selectedUser?.totalDuesAmount}</h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-4">
          <Button
            variant={activeTab === 'pay' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('pay');
              setSelectMode(false);
            }}
            className="flex flex-1 items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Pay
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
            className="flex flex-1 items-center gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'pay' && !selectMode && (
          <div className="space-y-4">
            {/* Input Field for Custom Amount */}
            <div className="space-y-2 px-4">
              <Label htmlFor="amount">Enter Amount to Pay</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                max={selectedUser?.totalDuesAmount}
                value={amountToPay}
                onChange={handleAmountChange}
                className="w-full rounded-lg border p-2 text-lg"
              />
            </div>
          </div>
        )}

        {activeTab === 'pay' && selectMode && (
          <div className="space-y-4">
            <section className="flex items-center justify-between px-4">
              <h2 className="text-muted-foreground text-lg">Amount Enter: ₹{amountToPay}</h2>
              <h2 className="text-muted-foreground text-lg">Remain: ₹{selectedUser.totalDuesAmount - amountToPay}</h2>
            </section>

            {payLoading ? <LoadingSpinner /> : <MultipleModes paymentModes={filteredPaymentModes} totalAmount={Number(amountToPay)} />}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-h-[60dvh] space-y-4 overflow-y-auto px-4 pb-[10rem]">
            {historyLoading ? (
              <LoadingSpinner />
            ) : mergedHistory.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">No history found</div>
            ) : (
              mergedHistory.map((item) => (
                <Card key={item.id} className="relative cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">{formatDate(item.date)}</span>
                        </div>
                        <p className="mt-1 text-sm font-medium">{item.description}</p>
                        {item.orderId && <p className="text-muted-foreground mt-1 text-xs">Order ID: {item.orderId}</p>}
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount)}
                        </div>
                      </div>
                    </div>
                    {item.show && (
                      <Button
                        onClick={() => handlePaymentClick(item.orderId)}
                        variant="outline"
                        className="absolute bottom-2 right-2 p-2 px-4 text-xs"
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
            activeTab === 'pay' && !selectMode
              ? [
                  {
                    text: 'Close',
                    onClick: closeSettleDues,
                    isBackButton: true,
                    className: 'rounded-md pl-3',
                  },
                  {
                    text: `Settle ₹${amountToPay}`,
                    onClick: () => {
                      if (amountToPay === 0) return;
                      setSelectMode(true);
                    },
                    swipe: true,
                    disable: amountToPay === 0,
                    className: 'rounded-md w-full',
                  },
                ]
              : activeTab === 'pay' && selectMode
                ? [
                    {
                      text: 'Back',
                      onClick: () => setSelectMode(false),
                      isBackButton: true,
                      className: 'rounded-md pl-3',
                    },
                    {
                      text: `Confirm ₹${amountToPay}`,
                      onClick: async () => {
                        if (amountToPay === 0 || amountInSettleModes !== amountToPay) {
                          return toast.error('Entered amount and settled amount must match');
                        }
                        await mutateAsync();
                      },
                      className: 'rounded-md w-full',
                      swipe: true,
                      disable: settleModes.length === 0 || amountInSettleModes !== amountToPay,
                      isLoading: isPending,
                    },
                  ]
                : [
                    {
                      text: 'Close',
                      onClick: closeSettleDues,
                      className: 'rounded-md w-full',
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
