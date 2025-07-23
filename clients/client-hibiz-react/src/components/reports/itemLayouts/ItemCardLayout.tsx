import type { BusinessItemReport, ItemReport } from "@/hooks/useReportHook.ts";
import { memo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { IndianRupee, Percent, Receipt, Package2 } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { formatCurrency, formatNumber } from "./itemHelper.ts";

interface ItemCardLayoutProps {
  business: BusinessItemReport;
}

const MemoItemCardLayout = ({ business }: ItemCardLayoutProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {business.items.map((item: ItemReport, index: number) => (
        <Card
          key={`${item.categoryId}-${item.itemName}-${index}`}
          className="border-l-4 border-l-primary"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="truncate">{item.itemName}</span>
              <Badge variant="secondary" className="ml-2 shrink-0">
                {formatNumber(item.itemCount)} qty
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package2 className="w-4 h-4" />
                Item Count
              </div>
              <span className="font-semibold">
                {formatNumber(item.itemCount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IndianRupee className="w-4 h-4" />
                Amount
              </div>
              <span className="font-semibold text-green-600">
                {formatCurrency(item.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Percent className="w-4 h-4" />
                Discount
              </div>
              <span className="font-semibold text-orange-600">
                {formatCurrency(item.discount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Receipt className="w-4 h-4" />
                Tax
              </div>
              <span className="font-semibold text-blue-600">
                {formatCurrency(item.tax)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Revenue</span>
                <span className="font-bold text-lg">
                  {formatCurrency(item.amount - item.discount + item.tax)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ItemCardLayout = memo(MemoItemCardLayout);
export default ItemCardLayout;
