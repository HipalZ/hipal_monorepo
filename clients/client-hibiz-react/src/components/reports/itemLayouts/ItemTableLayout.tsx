import { Badge } from "@/components/ui/badge.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import type { BusinessItemReport, ItemReport } from "@/hooks/useReportHook.ts";
import { Package2 } from "lucide-react";
import { memo } from "react";
import {
  formatCurrency,
  formatNumber,
  calculateNetRevenue,
} from "./itemHelper.ts";

interface ItemTableLayoutProps {
  business: BusinessItemReport;
}

const MemoItemTableLayout = ({ business }: ItemTableLayoutProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Item Name</TableHead>
            <TableHead className="text-center font-semibold">
              Quantity
            </TableHead>
            <TableHead className="text-center font-semibold">Count</TableHead>
            <TableHead className="text-right font-semibold">Amount</TableHead>
            <TableHead className="text-right font-semibold">Discount</TableHead>
            <TableHead className="text-right font-semibold">Tax</TableHead>
            <TableHead className="text-right font-semibold">
              Net Revenue
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {business.items.map((item: ItemReport, index: number) => (
            <TableRow
              key={`${item.categoryId}-${item.itemName}-${index}`}
              className="hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Package2 className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate max-w-[200px]">
                    {item.itemName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{formatNumber(item.quantity)}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">
                  {formatNumber(item.itemCount)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                {formatCurrency(item.amount)}
              </TableCell>
              <TableCell className="text-right font-semibold text-orange-600">
                {formatCurrency(item.discount)}
              </TableCell>
              <TableCell className="text-right font-semibold text-blue-600">
                {formatCurrency(item.tax)}
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(
                  calculateNetRevenue(item.amount, item.discount, item.tax),
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ItemTableLayout = memo(MemoItemTableLayout);
export default ItemTableLayout;
