import { memo } from "react"
import { Separator } from "@/components/ui/separator"

interface TotalAmountProps {
  total: number
}

const TotalAmountComponent = ({ total }: TotalAmountProps) => {
  const safeTotal = typeof total === "number" && !isNaN(total) ? total : 0

  return (
    <div className="space-y-4 mt-4">
      <Separator className="border-dashed" />
      <div className="flex justify-between items-center py-2">
        <p className="text-xl font-bold text-foreground">Total Amount</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹ {safeTotal.toFixed(2)}</p>
      </div>
    </div>
  )
}

export const TotalAmount = memo(TotalAmountComponent)
