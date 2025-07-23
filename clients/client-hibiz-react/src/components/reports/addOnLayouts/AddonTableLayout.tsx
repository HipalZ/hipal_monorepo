import { Badge } from "@/components/ui/badge.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import type {
  BusinessAddonReport,
  AddonReport,
} from "@/hooks/useReportHook.ts";
import { Plus } from "lucide-react";
import { memo } from "react";
import {
  formatCurrency,
  formatNumber
} from "./addOnHelper.ts";

interface AddonTableLayoutProps {
  business: BusinessAddonReport;
}

const MemoAddonTableLayout = ({ business }: AddonTableLayoutProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Addon Name</TableHead>
            <TableHead className="text-center font-semibold">
              Quantity
            </TableHead>
            <TableHead className="text-right font-semibold">Amount</TableHead>
            <TableHead className="text-right font-semibold">
              Total Sales
            </TableHead>
            <TableHead className="text-center font-semibold">Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {business.addOns.map((addon: AddonReport, index: number) => (
            <TableRow
              key={`${addon.addOnName}-${index}`}
              className="hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate max-w-[200px]">
                    {addon.addOnName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">
                  {formatNumber(addon.addOnCount)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                {formatCurrency(addon.amount)}
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                {formatCurrency(addon.totalSales)}
              </TableCell>

              <TableCell className="text-center">
                {addon.amount === 0 ? (
                  <Badge
                    variant="default"
                    className="bg-blue-100 text-blue-800"
                  >
                    Free
                  </Badge>
                ) : (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Paid
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const AddonTableLayout = memo(MemoAddonTableLayout);
export default AddonTableLayout;
