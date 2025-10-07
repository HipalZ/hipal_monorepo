import { memo } from "react";
import type { OrderData } from "./types";
import { BillHeader } from "./BillHeader";
import { BillBreakdown } from "./BillBreakdown";
import { TotalAmount } from "./TotalAmount";
import { Card, CardContent } from "@/components/ui/card";
import { ActionButtons } from "./ActionButton";

interface BillSummaryProps {
  orderData: OrderData;
}

const BillSummaryComponent = ({ orderData }: BillSummaryProps) => {
  if (!orderData) {
    return (
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground poppins-regular">
            No order data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-8 flex flex-col space-y-6">
        <BillHeader />
        <BillBreakdown orderData={orderData} />
        <ActionButtons />
        <TotalAmount total={orderData.total ?? 0} />
      </CardContent>
    </Card>
  );
};

export const BillSummary = memo(BillSummaryComponent);
