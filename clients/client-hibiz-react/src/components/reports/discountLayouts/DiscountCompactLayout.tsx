import type { BusinessDiscountReport, DiscountReport } from "@/hooks/useReportHook.ts"
import { Card } from "@/components/ui/card.tsx"
import { Percent } from "lucide-react"
import { formatCurrency, formatNumber, formatDiscountName } from "./discountHelper.ts"
import { memo } from "react"
import { Badge } from "@/components/ui/badge.tsx"

interface DiscountCompactLayoutProps {
  business: BusinessDiscountReport
}

const MemoDiscountCompactLayout = ({ business }: DiscountCompactLayoutProps) => {
  return (
    <div className="space-y-2">
      {business.discounts.map((discount: DiscountReport, index: number) => (
        <Card key={`${discount.discountName}-${index}`} className="px-2 py-6 overflow-x-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-3 w-[12rem]">
              <Percent className="w-5 h-5 text-muted-foreground" />
              <div>
                <h4 className="font-semibold truncate">{formatDiscountName(discount.discountName)}</h4>
                <p className="text-sm text-muted-foreground">{formatNumber(discount.discountCount)} uses</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center w-[4rem]">
                <p className="text-muted-foreground">Count</p>
                <p className="font-semibold">{formatNumber(discount.discountCount)}</p>
              </div>
              <div className="text-center w-[5rem]">
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold text-orange-600">{formatCurrency(discount.amount)}</p>
              </div>
              <div className="text-center w-[5rem]">
                <p className="text-muted-foreground">Avg/Use</p>
                <p className="font-semibold text-blue-600">
                  {discount.discountCount > 0
                    ? formatCurrency(discount.amount / discount.discountCount)
                    : formatCurrency(0)}
                </p>
              </div>
              <div className="text-center w-[4rem]">
                <p className="text-muted-foreground">Status</p>
                {discount.discountCount > 0 ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                    Unused
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

const DiscountCompactLayout = memo(MemoDiscountCompactLayout)
export default DiscountCompactLayout
