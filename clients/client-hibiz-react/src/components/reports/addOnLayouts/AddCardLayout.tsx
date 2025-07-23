import type {
  BusinessAddonReport,
  AddonReport,
} from "@/hooks/useReportHook.ts";
import { memo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { IndianRupee, Hash, Package2 } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import {
  formatCurrency,
  formatNumber
} from "./addOnHelper.ts";

interface AddonCardLayoutProps {
  business: BusinessAddonReport;
}

const MemoAddonCardLayout = ({ business }: AddonCardLayoutProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {business.addOns.map((addon: AddonReport, index: number) => (
        <Card
          key={`${addon.addOnName}-${index}`}
          className="border-l-4 border-l-primary"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="truncate">{addon.addOnName}</span>
              <Badge variant="secondary" className="ml-2 shrink-0">
                {formatNumber(addon.addOnCount)} qty
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="w-4 h-4" />
                Addon Count
              </div>
              <span className="font-semibold">
                {formatNumber(addon.addOnCount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package2 className="w-4 h-4" />
                Price
              </div>
              <span className="font-semibold">
                {formatNumber(addon.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IndianRupee className="w-4 h-4" />
                Total Amount
              </div>
              <span className="font-semibold text-green-600">
                {formatCurrency(addon.totalSales)}
              </span>
            </div>
           
            {addon.amount === 0 && (
              <div className="pt-2 border-t">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    Free addon
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AddonCardLayout = memo(MemoAddonCardLayout);
export default AddonCardLayout;
