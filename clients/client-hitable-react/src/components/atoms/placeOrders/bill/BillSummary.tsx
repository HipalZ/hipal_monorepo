import type { FC } from "react"
import { memo } from "react"
import { IoClose } from "react-icons/io5"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { BillSummaryProps } from "./bill.types.ts"
import { formatCurrency } from "@/lib/utils.ts"

const BillSummary: FC<BillSummaryProps> = memo(
  ({
    currentBill,
    existingLoyalty,
    onTriggerAddCoinz,
    onClickKey,
    onRemoveClaimedCoins,
    onRemoveCoupon,
    onOpenServiceChargeModal,
    onSetActiveModal,
  }) => {
    const billItems = [
      ["subTotal", currentBill.subTotal],
      ["serviceCharge", currentBill.serviceCharge],
      ["tips", currentBill.tips],
      ["discount", currentBill.discount],
      ["tax (GST)", currentBill.gst],
      ["otherTax", currentBill.otherTax],
      ["claimedCoins", currentBill.claimedCoins],
      ["couponDiscount", currentBill.couponDiscount],
    ].filter(([_, value]) => typeof value === "number" && value > 0)

    return (
      <>
        {existingLoyalty?.loyaltyId && (
          <>
            <CardTitle className="flex items-center justify-between">
              <span>Use customer Loyalty</span>
              <Button variant="default" className="flex justify-end ml-auto" onClick={onTriggerAddCoinz}>
                Use Coinz
              </Button>
            </CardTitle>
            <Separator className="my-4" />
          </>
        )}

        <div className="mb-4 space-y-3">
          {billItems.map(([key, value]) => {
            const isDeduction = key === "claimedCoins" || key === "discount" || key === "couponDiscount"
            return (
              <div
                key={key}
                onClick={() => onClickKey(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onClickKey(key)
                  }
                }}
                className="flex justify-between items-center text-sm cursor-pointer"
              >
                <p className="text-gray-700 capitalize flex gap-2 items-center">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </p>
                <div className="flex items-center space-x-2">
                  <p className={`font-medium ${isDeduction ? "text-red-600" : "text-gray-900"}`}>
                    {isDeduction ? `-${formatCurrency(Number(value))}` : formatCurrency(Number(value))}
                  </p>
                  {key === "claimedCoins" && (
                    <button
                      type="button"
                      onClick={onRemoveClaimedCoins}
                      className="text-red-600 text-2xl hover:underline"
                    >
                      <IoClose />
                    </button>
                  )}
                  {key === "couponDiscount" && (
                    <button type="button" onClick={onRemoveCoupon} className="text-red-600 text-2xl hover:underline">
                      <IoClose />
                    </button>
                  )}
                  {key === "serviceCharge" && (
                    <button
                      type="button"
                      onClick={onOpenServiceChargeModal}
                      className="text-red-600 text-2xl hover:underline"
                    >
                      <IoClose />
                    </button>
                  )}
                  {key === "discount" && (
                    <button
                      type="button"
                      onClick={() => onSetActiveModal("discount")}
                      className="text-red-600 text-2xl hover:underline"
                    >
                      <IoClose />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <p className="text-black">Total</p>
            <p className="text-black">{formatCurrency(currentBill.total)}</p>
          </div>
        </div>
      </>
    )
  },
)

BillSummary.displayName = "BillSummary"
export default BillSummary
