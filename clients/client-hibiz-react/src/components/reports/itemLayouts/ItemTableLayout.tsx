"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BusinessItemReport, ItemReport } from "@/hooks/useReportHook";
import { Package2, Printer } from "lucide-react";
import { memo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  formatCurrency,
  formatNumber,
  calculateNetRevenue,
} from "./itemHelper";

interface ItemTableLayoutProps {
  business: BusinessItemReport;
}

const MemoItemTableLayout = ({ business }: ItemTableLayoutProps) => {
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

      {/* Printable Content */}
      <div ref={contentRef} className="rounded-md border">
        {/* Print Header - Only visible when printing */}
        <div className="print:block hidden p-6 border-b">
          <h1 className="text-2xl font-bold text-center">Item Report</h1>
          <p className="text-center text-muted-foreground mt-2">
            Business: {business.businessName || "N/A"}
          </p>
          <p className="text-center text-muted-foreground">
            Generated on: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Item Name</TableHead>
              <TableHead className="text-center font-semibold">
                Quantity
              </TableHead>
              <TableHead className="text-right font-semibold">Amount</TableHead>
              <TableHead className="text-right font-semibold">
                Discount
              </TableHead>
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
                className="hover:bg-muted/50 print:hover:bg-transparent"
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
                  <Badge variant="outline" className="print:border-gray-400">
                    {formatNumber(item.itemCount)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600 print:text-black">
                  {formatCurrency(item.amount)}
                </TableCell>
                <TableCell className="text-right font-semibold text-orange-600 print:text-black">
                  {formatCurrency(item.discount)}
                </TableCell>
                <TableCell className="text-right font-semibold text-blue-600 print:text-black">
                  {formatCurrency(item.tax)}
                </TableCell>
                <TableCell className="text-right font-bold text-lg print:text-black">
                  {formatCurrency(
                    calculateNetRevenue(item.amount, item.discount, item.tax),
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Print Footer - Only visible when printing */}
        <div className="print:block hidden p-6 border-t">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total Items: {business.items.length}</span>
            <span>
              Total Revenue:{" "}
              {formatCurrency(
                business.items.reduce(
                  (sum, item) =>
                    sum +
                    calculateNetRevenue(item.amount, item.discount, item.tax),
                  0,
                ),
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ItemTableLayout = memo(MemoItemTableLayout);
export default ItemTableLayout;
