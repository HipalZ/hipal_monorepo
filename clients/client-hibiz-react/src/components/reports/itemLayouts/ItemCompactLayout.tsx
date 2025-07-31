import type { BusinessItemReport, ItemReport } from "@/hooks/useReportHook.ts";
import { Card } from "@/components/ui/card.tsx";
import { Package2 } from "lucide-react";
import { formatCurrency, formatNumber } from "./itemHelper.ts";
import { memo } from "react";

interface ItemCompactLayoutProps {
  business: BusinessItemReport;
}

const MemoItemCompactLayout = ({ business }: ItemCompactLayoutProps) => {
  return (
    <div className="space-y-2">
      {business.items.map((item: ItemReport, index: number) => (
        <Card
          key={`${item.categoryId}-${item.itemName}-${index}`}
          className="px-2 py-6 overflow-x-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-3 w-[12rem]">
              <Package2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <h4 className="font-semibold truncate">{item.itemName}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(item.quantity)} qty •{" "}
                  {formatNumber(item.itemCount)} count
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center w-[4rem]">
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(item.amount)}
                </p>
              </div>
              <div className="text-center w-[3rem]">
                <p className="text-muted-foreground">Discount</p>
                <p className="font-semibold text-orange-600">
                  {formatCurrency(item.discount)}
                </p>
              </div>
              <div className="text-center w-[3rem]">
                <p className="text-muted-foreground">Tax</p>
                <p className="font-semibold text-blue-600">
                  {formatCurrency(item.tax)}
                </p>
              </div>
              <div className="text-center w-[7rem]">
                <p className="text-muted-foreground">Net Revenue</p>
                <p className="font-bold text-lg">
                  {formatCurrency(item.amount - item.discount + item.tax)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const ItemCompactLayout = memo(MemoItemCompactLayout);
export default ItemCompactLayout;
