import { memo } from "react";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { BiSync } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import type { IBillData } from "@/components/types/hiClientzData.ts";

interface BillHeaderProps {
  isSplitBill: boolean;
  selectedBill: IBillData | null;
  onBackToGrid: () => void;
  onReprintBill: () => void;
  onShowEBill: () => void;
}

const BillHeader = memo(
  ({
    isSplitBill,
    selectedBill,
    onBackToGrid,
    onReprintBill,
    onShowEBill,
  }: BillHeaderProps) => {
    return (
      <CardHeader className="p-2 md:p-6">
        <CardTitle className="flex items-center justify-between flex-nowrap">
          <div className="flex items-center gap-2">
            {isSplitBill && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToGrid}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <span>Bill Summary</span>
            {isSplitBill && selectedBill && (
              <Badge variant="secondary">#{selectedBill.variantName}</Badge>
            )}
          </div>
          <section className=" flex flex-col -mb-14 space-y-4 md:-mr-4">
            <Button size="sm" variant="outline" onClick={onShowEBill}>
              <ReceiptText />
              E-Bill
            </Button>
            <Button variant="outline" onClick={onReprintBill} size="sm">
              <BiSync />
              Print Bill
            </Button>
          </section>
        </CardTitle>
      </CardHeader>
    );
  },
);

BillHeader.displayName = "BillHeader";
export default BillHeader;
