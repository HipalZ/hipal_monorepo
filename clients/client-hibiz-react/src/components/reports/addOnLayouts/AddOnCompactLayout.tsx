import type {
  BusinessAddonReport,
  AddonReport,
} from "@/hooks/useReportHook.ts";
import { Card } from "@/components/ui/card.tsx";
import { Plus } from "lucide-react";
import {
  formatCurrency,
  formatNumber
} from "./addOnHelper.ts";
import { memo } from "react";
import { Badge } from "@/components/ui/badge.tsx";

interface AddonCompactLayoutProps {
  business: BusinessAddonReport;
}

const MemoAddonCompactLayout = ({ business }: AddonCompactLayoutProps) => {
  return (
    <div className="space-y-2">
      {business.addOns.map((addon: AddonReport, index: number) => (
        <Card
          key={`${addon.addOnName}-${index}`}
          className="px-2 py-6 overflow-x-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-3 w-[12rem]">
              <Plus className="w-5 h-5 text-muted-foreground" />
              <div>
                <h4 className="font-semibold truncate">{addon.addOnName}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(addon.addOnCount)} count 
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
           
              <div className="text-center w-[4rem]">
                <p className="text-muted-foreground">Quantity</p>
                <p className="font-semibold">{formatNumber(addon.addOnCount)}</p>
              </div>
              <div className="text-center w-[5rem]">
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(addon.amount)}
                </p>
              </div>
              <div className="text-center w-[5rem]">
                <p className="text-muted-foreground">Total Sales</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(addon.totalSales)}
                </p>
              </div>
              <div className="text-center w-[4rem]">
                <p className="text-muted-foreground">Type</p>
                {addon.amount === 0 ? (
                  <Badge
                    variant="default"
                    className="bg-blue-100 text-blue-800 text-xs"
                  >
                    Free
                  </Badge>
                ) : (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 text-xs"
                  >
                    Paid
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const AddonCompactLayout = memo(MemoAddonCompactLayout);
export default AddonCompactLayout;
