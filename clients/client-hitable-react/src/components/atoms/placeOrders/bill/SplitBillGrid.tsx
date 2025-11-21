import { useReprintBill } from '@/components/hooks/api/useSettle.ts';
import { useClubBill } from '@/components/hooks/useBill.ts';
import { useHomeNavigation } from '@/components/hooks/useNavigateHome.ts';
import { useOrderStore } from '@/components/store/useOrderData.ts';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { calculateBillItems, calculateTotalAmount, calculateTotalItems, cn, formatCurrency } from '@/lib/utils.ts';
import { ArrowLeft, CreditCard, HomeIcon, PersonStandingIcon, Phone, ReceiptText } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { MdTableBar } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import CommonBottomButton from '../../bottomButton';
import type { SplitBillGridProps } from './bill.types.ts';

const SplitBillGrid = memo<SplitBillGridProps>(({ billData, onSelectBill, onBack, screenSize }) => {
  const { goHome } = useHomeNavigation();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const { isPrinting, reprintBill } = useReprintBill();
  const { isClubbing, clubBill } = useClubBill();
  const businessId = useParams().businessId as string;

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canPrintBill = hasPermission('print_bill');

  const handleEnterSelect = () => {
    setSelectedVariants([]);
    setIsSelecting(true);
  };
  const handleExitSelect = () => setIsSelecting(false);

  const handleCheckboxChange = useCallback((variantId: string, checked: boolean) => {
    setSelectedVariants((prev) => (checked ? [...prev, variantId] : prev.filter((id) => id !== variantId)));
  }, []);

  const handlePrintSelected = useCallback(() => {
    for (const variantId of selectedVariants) {
      reprintBill({
        businessId,
        tableName: selectedTable?.name || '',
        variantId,
      });
    }
    setIsSelecting(false);
  }, [selectedVariants, reprintBill, businessId, selectedTable?.name]);

  const handlePrintAll = useCallback(() => {
    for (const bill of billData) {
      reprintBill({
        businessId,
        tableName: selectedTable?.name || '',
        variantId: bill.variantId || '',
      });
    }
    setIsSelecting(false);
  }, [billData, reprintBill, businessId, selectedTable?.name]);

  const handleClub = useCallback(async () => {
    if (!businessId) return;
    try {
      await clubBill({ businessId, tableName: selectedTable?.name || '' });
    } catch (err) {
      console.error('Failed to club bill:', err);
    }
  }, [businessId, selectedTable?.name, clubBill]);

  const totalAmount = useMemo(() => calculateTotalAmount(billData), [billData]);
  const totalItems = useMemo(() => calculateTotalItems(billData), [billData]);

  // Hide Merge Bill if any variant is already paid
  const hasPaid = useMemo(() => billData.some((bill) => bill.isPaid), [billData]);

  const bottomButtons =
    isSelecting && canPrintBill
      ? [
          {
            text: '',
            isBackButton: true,
            onClick: handleExitSelect,
            className: 'rounded-md !w-[4rem] px-3',
          },
          {
            text: 'Print Selected',
            onClick: handlePrintSelected,
            isLoading: isPrinting,
            disable: isPrinting || selectedVariants.length === 0,
            className: 'rounded-md ml-4',
          },
          {
            text: 'Print All',
            onClick: handlePrintAll,
            isLoading: isPrinting,
            disable: isPrinting,
            className: 'rounded-md ml-4',
          },
        ]
      : [
          {
            text: '',
            onClick: goHome,
            icon: <HomeIcon />,
            className: 'rounded-md !w-[8rem] pl-2',
          },
          {
            text: 'Back',
            isBackButton: true,
            onClick: onBack,
            className: 'rounded-md !w-[8rem] pl-3 ml-4',
          },
          !hasPaid && {
            text: 'Merge Bill',
            onClick: handleClub,
            isLoading: isClubbing,
            disable: isClubbing,
            className: 'rounded-md w-full ml-4 !bg-purple-600',
          },
          canPrintBill && {
            text: 'Print Bills',
            onClick: handleEnterSelect,
            isLoading: isPrinting,
            disable: isPrinting,
            className: 'rounded-md ml-4',
          },
          // Conditionally include Merge Bill
        ].filter(Boolean as any);

  return (
    <>
      <Card className="mx-auto mb-8 min-h-[90dvh] max-w-lg border border-none pb-[7rem] pt-[5rem] shadow-none md:pb-[8rem] md:pt-16 lg:pt-0">
        <CardHeader className="p-2 md:p-6">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={isSelecting ? handleExitSelect : onBack} className="p-1 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span>{isSelecting ? `Select & Print (${billData.length})` : `Split Bills (${billData.length})`}</span>
            </div>
            <Badge variant="secondary">Total: {formatCurrency(totalAmount)}</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-[5rem]">
          {/* Customer & Table Info */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <PersonStandingIcon className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-700">{billData[0]?.customerName}</p>
            </div>
            <div className="flex items-center gap-2">
              <MdTableBar className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-700">Table: {billData[0]?.tableName}</p>
            </div>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-700">Total Items: {totalItems}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Bill Variants List */}
          <div className="space-y-3 lg:pb-20">
            <h3 className="font-medium text-gray-900">{isSelecting ? 'Tick which to print:' : 'Select Bill to View:'}</h3>

            {billData.map((bill, index) => {
              const id = bill.variantId || String(index);
              const billItemsCount = calculateBillItems(bill.billItems);

              return (
                <Card
                  key={id}
                  className={cn(
                    'relative flex cursor-pointer transition-shadow hover:shadow-md',
                    bill.isPaid ? 'border-l-[0.5rem] border-[#c8e6c9] !bg-[#c8e6c950] pt-4' : 'bg-transparent',
                  )}
                  onClick={() => {
                    if (!isSelecting) {
                      onSelectBill(bill);
                    }
                  }}
                >
                  <CardContent className="flex-1 p-4">
                    {bill.isPaid && (
                      <div className="absolute -top-1 left-0 right-0 flex items-center justify-center rounded-xl">
                        <Badge className="bg-green-800 px-8 text-base text-white">Paid</Badge>
                      </div>
                    )}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isSelecting && (
                          <Checkbox
                            checked={selectedVariants.includes(id)}
                            onCheckedChange={(checked) => handleCheckboxChange(id, Boolean(checked))}
                            className="mr-2"
                          />
                        )}
                        <CreditCard className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Bill #{bill.variantName || index + 1}</span>
                      </div>
                      <Badge variant="outline">{billItemsCount.toFixed(2)} items</Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>{formatCurrency(bill.subTotal)}</span>
                      </div>
                      {bill.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="text-red-600">-{formatCurrency(bill.discount)}</span>
                        </div>
                      )}
                      {bill.serviceCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Charge:</span>
                          <span>{formatCurrency(bill.serviceCharge)}</span>
                        </div>
                      )}
                      {bill.gst > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax (GST):</span>
                          <span>{formatCurrency(bill.gst)}</span>
                        </div>
                      )}
                      {bill.claimedCoins > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loyalty Coins:</span>
                          <span className="text-red-600">-{formatCurrency(bill.claimedCoins)}</span>
                        </div>
                      )}
                      {bill.couponDiscount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coupon:</span>
                          <span className="text-red-600">-{formatCurrency(bill.couponDiscount)}</span>
                        </div>
                      )}

                      <Separator className="my-2" />

                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(bill.total)}</span>
                      </div>
                    </div>

                    <div className="mt-3 border-t pt-2">
                      <p className="mb-1 text-xs text-gray-500">Items:</p>
                      <div className="text-xs text-gray-600">
                        {bill.billItems
                          .flatMap((group) => group.items)
                          .slice(0, 2)
                          .map((item, idx) => (
                            <span key={idx}>
                              {item.dish.name} ({item.quantity}){idx === 0 && bill.billItems.flatMap((g) => g.items).length > 2 ? ', ' : ''}
                            </span>
                          ))}
                        {bill.billItems.flatMap((g) => g.items).length > 2 && (
                          <span className="text-gray-400">... + {bill.billItems.flatMap((g) => g.items).length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottom action buttons */}
      <CommonBottomButton maxWidth="30rem" backgroundColor={screenSize === 'xs' ? '' : 'white'} fixed={true} buttons={bottomButtons} />
    </>
  );
});

SplitBillGrid.displayName = 'SplitBillGrid';
export default SplitBillGrid;
