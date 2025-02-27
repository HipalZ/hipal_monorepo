import { memo } from "react";
import { MdOutlineCall } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { IExistingPayments } from "@/components/types/businessData";
import { timestampToDateTime } from "@/components/utils/helper";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atom/loadingSpinner";

export interface Extra {
  name: string;
  price: number;
  quantity: number;
}

export interface DishItem {
  name: string;
  price: number;
  quantity: number;
}

export interface BillItem {
  dish: DishItem;
  extras: Extra[];
}
interface PaymentModalProps {
  salesData: IExistingPayments | undefined;
}

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  const hideMiddleNumbers = (phone: string) => {
    if (phone?.length <= 4) return phone;
    const firstPart = phone?.slice(0, 3);
    const lastPart = phone?.slice(-3);
    return `${firstPart}****${lastPart}`;
  };
  
const PaymentModal = ({ salesData }: PaymentModalProps) => {

  const getBillItems = async (): Promise<BillItem[]> => {
    const response = await apiRpc.kot.get_pos_bill[":billRequestId"].$get({
      param: {
        billRequestId: salesData?.posBillRequestId,
      },
    });

    const res = await response.json();
    return res.data as  BillItem[];
  };

  const { isLoading, data: itemsData } = useQuery<BillItem[]>({
    queryKey: ["getBillItems", salesData?.posBillRequestId],
    queryFn: getBillItems,
    enabled: !!salesData?.posBillRequestId,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="relative w-full max-w-[30rem] border-none shadow-none">
      <section className="flex items-center justify-between px-4 py-2">
        <h3 className="pt-2 text-lg font-semibold text-center">Payment Details</h3>
        <Badge className="text-xl font-semibold text-white bg-black">
          {salesData?.mode}
        </Badge>
      </section>
      <CardContent>
        <ScrollArea className="h-[70vh]">
          <div className="space-y-4">
            {/* Sales Data Information */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {timestampToDateTime(salesData?.date || 0)}
              </span>
              <span className="text-sm font-medium">Order ID: {salesData?._id.slice(-5)}</span>
            </div>

            <div className="">
              <InfoRow label="Paid Amount" value={`₹ ${salesData?.order_id?.total}`} />
              <InfoRow label="Bill Value Entered" value={`₹ ${salesData?.order_id?.billValue}`} />
              <InfoRow label="Including Tips" value={`₹ ${salesData?.order_id?.tips}`} />
              <InfoRow label="Discount" value={`${salesData?.order_id?.claimedCoins} Coins used`} />
              <InfoRow label="Payment Mode" value={salesData?.mode} />
              <InfoRow label="Mode of Settle" value={salesData?.settleType} />
              {
                salesData?.settleType === "FORCE_SETTLE" && (
                  <InfoRow label="Force Settle Reason" value={salesData?.comment} />
                )
              }
            </div>

            <Separator />

            {/* User and Table Information */}
            <div className="">
              <InfoRow label="User" value={salesData?.userId?.name} />
              <InfoRow label="Table" value={salesData?.order_id?.tableName} />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Number</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {salesData?.userId?.phone ? hideMiddleNumbers(salesData?.userId?.phone) : ""}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    asChild
                  >
                    <a href={`tel:+91${salesData?.userId?.phone}`}>
                      <MdOutlineCall size={16} />
                      <span className="text-sm">Call</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="">
              <h2 className="font-semibold">Bill Items</h2>
              <Card>
                <CardContent className="p-4 space-y-2">
                    {itemsData?.slice(0, -2).map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.dish.name}</p>
                        <p className="text-sm text-gray-500">
                        Qty: {item.dish.quantity} × ₹{item.dish.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">
                        ₹{(item.dish.price * item.dish.quantity).toFixed(2)}
                      </p>
                      </div>
                      {item.extras.length > 0 && (
                      <div className="pl-4 space-y-1">
                        {item.extras.map((extra, extraIndex) => (
                        <div key={extraIndex} className="flex justify-between text-sm">
                          <span>{extra.name}</span>
                          <span>
                          {extra.quantity} × ₹{extra.price.toFixed(2)} = ₹
                          {(extra.quantity * extra.price).toFixed(2)}
                          </span>
                        </div>
                        ))}
                      </div>
                      )}
                    </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            {/* Optional Sections */}
            {salesData?.comment && (
              <div className="space-y-2">
                <h2 className="font-semibold">Added Comment</h2>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm">{salesData?.comment}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const MemoizedPaymentModal = memo(PaymentModal);
export default MemoizedPaymentModal;

