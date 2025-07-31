import type { BusinessCategoryReport, CategoryReport } from "@/hooks/useReportHook.ts";
import { Card } from "@/components/ui/card.tsx";
import { Package } from "lucide-react";
import { formatCurrency, formatNumber } from "./categoryHelper.ts";
import { memo } from "react";
interface CategoryCompactLayoutProps {
    business: BusinessCategoryReport;
}

const MemoCategoryCompactLayout = ({ business }: CategoryCompactLayoutProps) => {
  return (
    <div className="space-y-2">
        {business.categories.map((category: CategoryReport) => (
          <Card key={category.categoryId} className="px-2 py-6 overflow-x-auto">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center gap-3 w-[10rem]">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">{category.categoryName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(category.categoryCount)} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center w-[4rem]">
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(category.totalAmount)}
                  </p>
                </div>
                <div className="text-center w-[3rem]">
                  <p className="text-muted-foreground">Discount</p>
                  <p className="font-semibold text-orange-600">
                    {formatCurrency(category.totalDiscount)}
                  </p>
                </div>
                <div className="text-center w-[3rem]">
                  <p className="text-muted-foreground">Tax</p>
                  <p className="font-semibold text-blue-600">
                    {formatCurrency(category.totalTax)}
                  </p>
                </div>
                <div className="text-center w-[7rem]">
                  <p className="text-muted-foreground">Net Revenue</p>
                  <p className="font-bold text-lg">
                    {formatCurrency(
                      category.totalAmount -
                        category.totalDiscount +
                        category.totalTax,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
  )
}

const CategoryCompactLayout = memo(MemoCategoryCompactLayout)
export default CategoryCompactLayout
