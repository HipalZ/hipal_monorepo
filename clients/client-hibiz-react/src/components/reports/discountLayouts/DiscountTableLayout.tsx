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
  BusinessDiscountReport,
  DiscountReport,
} from "@/hooks/useReportHook.ts";
import { Percent } from "lucide-react";
import { memo } from "react";
import {
  formatCurrency,
  formatNumber,
  formatDiscountName,
} from "./discountHelper.ts";

interface DiscountTableLayoutProps {
  business: BusinessDiscountReport;
}

const MemoDiscountTableLayout = ({ business }: DiscountTableLayoutProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Discount Type</TableHead>
            <TableHead className="text-center font-semibold">
              Usage Count
            </TableHead>
            <TableHead className="text-right font-semibold">
              Total Amount
            </TableHead>
            <TableHead className="text-right font-semibold">
              Average per Use
            </TableHead>
            <TableHead className="text-center font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {business.discounts.map((discount: DiscountReport, index: number) => (
            <TableRow
              key={`${discount.discountName}-${index}`}
              className="hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate max-w-[200px]">
                    {formatDiscountName(discount.discountName)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">
                  {formatNumber(discount.discountCount)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-orange-600">
                {formatCurrency(discount.amount)}
              </TableCell>
              <TableCell className="text-right font-semibold text-blue-600">
                {discount.discountCount > 0
                  ? formatCurrency(discount.amount / discount.discountCount)
                  : formatCurrency(0)}
              </TableCell>
              <TableCell className="text-center">
                {discount.discountCount > 0 ? (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600"
                  >
                    Unused
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

const DiscountTableLayout = memo(MemoDiscountTableLayout);
export default DiscountTableLayout;
