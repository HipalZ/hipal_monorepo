import { useDues } from '@/components/store/useDues';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/utils/helper';
import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

export interface IMode {
  _id: string;
  name: string;
  active: boolean;
}

export const ModeIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case 'cash':
      return <Banknote className="h-6 w-6" />;
    case 'upi':
      return <Smartphone className="h-6 w-6" />;
    default:
      return <CreditCard className="h-6 w-6" />;
  }
};

const MemoMultipleModes = ({ paymentModes, totalAmount }: { paymentModes: IMode[]; totalAmount: number }) => {
  const { settleModes, addSettleMode, updateSettleMode, removeSettleMode } = useDues();

  const [error, setError] = useState<string | null>(null);

  const validateAmounts = useCallback(() => {
    const total = settleModes.reduce((sum, mode) => sum + mode.amount, 0);
    const remainCost = totalAmount - total;
    if (total > totalAmount) {
      setError(`Total amount cannot exceed ₹${totalAmount}.`);
    } else if (total !== totalAmount) {
      setError(
        <>
          Total amount must equal ₹{totalAmount}. Remain <strong>₹{remainCost}</strong>.
        </>,
      );
    } else {
      setError(null);
    }
  }, [settleModes, totalAmount]);

  useEffect(() => {
    validateAmounts();
  }, [validateAmounts]);

  const toggleModeSelection = useCallback(
    (mode: IMode) => {
      const existing = settleModes.find((m) => m._id === mode._id);
      if (existing) {
        removeSettleMode(mode._id);
      } else {
        addSettleMode({ _id: mode._id, name: mode.name, amount: 0 });
      }
    },
    [addSettleMode, removeSettleMode, settleModes],
  );

  const handleAmountChange = useCallback(
    (modeId: string, amount: number) => {
      const totalSettled = settleModes.reduce((sum, mode) => (mode._id === modeId ? sum : sum + mode.amount), 0);

      if (totalSettled + amount > totalAmount) {
        setError(`Total amount cannot exceed ₹${totalAmount}.`);
        return;
      }

      setError(null);
      updateSettleMode({ _id: modeId, name: '', amount });
    },
    [settleModes, totalAmount, updateSettleMode],
  );

  const modeItems = useMemo(
    () =>
      paymentModes?.map((mode) => {
        const existing = settleModes.find((m) => m._id === mode._id);
        const isChecked = !!existing;
        if (mode?.name?.toLowerCase() === 'dues') {
          return null;
        }
        return (
          <motion.div
            key={mode._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={cn('mt-4 cursor-pointer transition-all', {
                'border-primary': isChecked,
              })}
              onClick={() => mode.active && toggleModeSelection(mode)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div
                    className={cn('flex items-center space-x-4', {
                      'cursor-not-allowed opacity-50': !mode.active,
                    })}
                  >
                    <div className="flex-shrink-0">
                      <ModeIcon name={mode.name} />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{mode.name}</p>
                      {!mode.active && <p className="text-muted-foreground text-sm">Currently unavailable</p>}
                    </div>
                  </div>

                  {isChecked && mode.active && (
                    <Input
                      type="number"
                      className="ml-auto w-20 p-2"
                      placeholder="₹0"
                      value={existing.amount || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleAmountChange(mode._id, Number.parseFloat(e.target.value) || 0);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Amount for ${mode.name}`}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      }),
    [paymentModes, settleModes, toggleModeSelection, handleAmountChange],
  );

  return (
    <div className="hide-scrollbar relative h-[80dvh] gap-4 overflow-auto px-4 pb-[15rem]">
      {error && (
        <Alert className="sticky top-0 mb-4 rounded-none bg-white" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <AnimatePresence>{modeItems}</AnimatePresence>
    </div>
  );
};

const MultipleModes = memo(MemoMultipleModes);
export default MultipleModes;
