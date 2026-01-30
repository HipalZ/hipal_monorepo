import type {
  BusinessCategoryReport,
  CategoryReport,
} from "@/hooks/useReportHook.ts";
import { memo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { IndianRupee, Percent, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";

interface CategoryCardLayoutProps {
  business: BusinessCategoryReport;
}

const MemoCategoryCardLayout = ({ business }: CategoryCardLayoutProps) => {

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {business.categories.map((category: CategoryReport) => (
        <Card key={category.categoryId} className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              {category.categoryName}
              <Badge variant="secondary" className="ml-2">
                {formatNumber(category.categoryCount)} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IndianRupee className="w-4 h-4" />
                Gross Amount
              </div>
              <span className="font-semibold text-green-600">
                {formatCurrency(category.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Percent className="w-4 h-4" />
                Total Discount
              </div>
              <span className="font-semibold text-orange-600">
                {formatCurrency(category.totalDiscount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Receipt className="w-4 h-4" />
                Total Tax
              </div>
              <span className="font-semibold text-blue-600">
                {formatCurrency(category.totalTax)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Revenue</span>
                <span className="font-bold text-lg">
                  {formatCurrency(
                    category.totalSales ??
                      category.totalAmount -
                        category.totalDiscount +
                        category.totalTax,
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const CategoryCardLayout = memo(MemoCategoryCardLayout);
export default CategoryCardLayout;
