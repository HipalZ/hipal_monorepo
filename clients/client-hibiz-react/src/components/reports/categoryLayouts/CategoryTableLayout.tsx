import { Badge } from "@/components/ui/badge.tsx";
import { Table,TableBody,TableCell,TableHead,TableHeader,TableRow } from "@/components/ui/table.tsx"
import type{ BusinessCategoryReport, CategoryReport } from "@/hooks/useReportHook.ts";
import { Package } from "lucide-react";
import { memo } from "react"
import { formatCurrency, formatNumber } from "./categoryHelper.ts";


interface CategoryCardLayoutProps {
  business: BusinessCategoryReport;
}

const MemoCategoryTableLayout = ({ business }: CategoryCardLayoutProps) => {
  return (
       <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Category Name</TableHead>
                <TableHead className="text-center font-semibold">
                  Items Count
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Total Amount
                </TableHead>
                <TableHead className="text-right font-semibold">Discount</TableHead>
                <TableHead className="text-right font-semibold">Tax</TableHead>
                <TableHead className="text-right font-semibold">
                  Net Revenue
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {business.categories.map((category: CategoryReport) => (
                <TableRow key={category.categoryId} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      {category.categoryName}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {formatNumber(category.categoryCount)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(category.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-orange-600">
                    {formatCurrency(category.totalDiscount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-blue-600">
                    {formatCurrency(category.totalTax)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {formatCurrency(
                      category.totalAmount -
                        category.totalDiscount +
                        category.totalTax,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
  )
}

const CategoryTableLayout = memo(MemoCategoryTableLayout)
export default CategoryTableLayout
