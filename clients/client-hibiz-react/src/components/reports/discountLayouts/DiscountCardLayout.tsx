import type { BusinessDiscountReport, DiscountReport } from "@/hooks/useReportHook.ts"
import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { IndianRupee, Hash, Percent } from "lucide-react"
import { Badge } from "@/components/ui/badge.tsx"
import { formatCurrency, formatNumber, formatDiscountName } from "./discountHelper.ts"

interface DiscountCardLayoutProps {
  business: BusinessDiscountReport
}

const MemoDiscountCardLayout = ({ business }: DiscountCardLayoutProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {business.discounts.map((discount: DiscountReport, index: number) => (
        <Card key={`${discount.discountName}-${index}`} className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="truncate">{formatDiscountName(discount.discountName)}</span>
              <Badge variant="secondary" className="ml-2 shrink-0">
                {formatNumber(discount.discountCount)} uses
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="w-4 h-4" />
                Usage Count
              </div>
              <span className="font-semibold">{formatNumber(discount.discountCount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IndianRupee className="w-4 h-4" />
                Total Amount
              </div>
              <span className="font-semibold text-orange-600">{formatCurrency(discount.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Percent className="w-4 h-4" />
                Avg per Use
              </div>
              <span className="font-semibold text-blue-600">
                {discount.discountCount > 0
                  ? formatCurrency(discount.amount / discount.discountCount)
                  : formatCurrency(0)}
              </span>
            </div>
            {discount.discountCount === 0 && (
              <div className="pt-2 border-t">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">No usage in selected period</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const DiscountCardLayout = memo(MemoDiscountCardLayout)
export default DiscountCardLayout
