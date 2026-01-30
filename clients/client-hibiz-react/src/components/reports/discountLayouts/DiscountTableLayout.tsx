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
import { Percent, Printer } from "lucide-react";
import { memo, useRef } from "react";
import {
  formatCurrency,
  formatNumber,
  formatDiscountName,
} from "./discountHelper.ts";
import { Button } from "@/components/ui/button.tsx";
import { useReactToPrint } from "react-to-print";

interface DiscountTableLayoutProps {
  business: BusinessDiscountReport;
}

const MemoDiscountTableLayout = ({ business }: DiscountTableLayoutProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef,
  });

  return (
    <div className="space-y-4">
      {/* Print Button */}
      <div className="flex justify-end">
        <Button
          onClick={reactToPrintFn}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
      </div>
      <div ref={contentRef} className="rounded-md border">
        <div className="print:block hidden p-6 border-b">
          <h1 className="text-2xl font-bold text-center">Discount Report</h1>
          <p className="text-center text-muted-foreground mt-2">
            Business: {business.businessName || "N/A"}
          </p>
          <p className="text-center text-muted-foreground">
            Generated on: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
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
              <TableHead className="text-center font-semibold">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {business.discounts.map(
              (discount: DiscountReport, index: number) => (
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
              ),
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const DiscountTableLayout = memo(MemoDiscountTableLayout);
export default DiscountTableLayout;
