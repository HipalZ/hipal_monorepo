import { memo, useState } from "react";
import { MdOutlineCall } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { IExistingPayments } from "@/components/types/businessData";
import { timestampToDateTime } from "@/components/utils/helper";
import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import {
  Download,
  EditIcon,
  User,
  CreditCard,
  Receipt,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import toast from "react-hot-toast";
import { useAllModes } from "@/hooks/useMode";
import { useReprintBill } from "@/hooks/useBill.ts";

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
  onClose?: () => void;
  allSalesData: IExistingPayments[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
}

const InfoRow = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number | undefined;
  highlight?: boolean;
}) => {
  if (typeof value === "string" && value === "0") {
    return null;
  }
  if (value === 0) return null;

  return (
    <div
      className={`flex items-center justify-between py-2 ${
        highlight ? "bg-blue-50 px-3 rounded-lg" : ""
      }`}
    >
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`font-medium ${
          highlight ? "text-blue-700 font-semibold" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
};
const hideMiddleNumbers = (phone: string) => {
  if (phone?.length <= 4) return phone;
  const firstPart = phone?.slice(0, 3);
  const lastPart = phone?.slice(-3);
  return `${firstPart}****${lastPart}`;
};

const PaymentModal = ({
  salesData,
  onClose,
  allSalesData,
  currentIndex,
  onNavigate,
}: PaymentModalProps) => {
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState(salesData?.mode || "");
  const queryClient = useQueryClient();
  const { data: modes } = useAllModes();
  const controls = useAnimation();
  const [dragDirection, setDragDirection] = useState<number>(0);
  const { reprintBill } = useReprintBill();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (billId: string) => {
      const response = await apiRpc.download.download_bill_pdf[
        ":paymentId"
      ].$get({
        param: {
          paymentId: billId,
        },
      });
      return response;
    },
    onSuccess: async (data) => {
      const result = await data.json();
      const downloadUrl = result.data.url;
      window.open(downloadUrl, "_blank");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { mutateAsync: updateMode, isPending: isUpdatingMode } = useMutation({
    mutationFn: async (newMode: string) => {
      const res = await apiRpc.payments.update_mode.$put({
        json: {
          paymentId: salesData?._id,
          mode: newMode,
          updatedBy: salesData?.userId?._id,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Payment mode updated!");
      queryClient.invalidateQueries({ queryKey: ["allSalesDataByGet"] });
      setIsEditingMode(false);
    },
    onError: () => {
      toast.error("Failed to update mode.");
    },
  });

  const goToNext = () => {
    if (currentIndex < allSalesData.length - 1) {
      onNavigate(currentIndex + 1);
      controls.start({
        x: [-300, 0],
        opacity: [0, 1],
        transition: { duration: 0.3 },
      });
    } else {
      toast.error("No more bills");
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
      controls.start({
        x: [300, 0],
        opacity: [0, 1],
        transition: { duration: 0.3 },
      });
    } else {
      toast.error("No previous bills");
    }
  };

  const handleDragEnd = () => {
    if (dragDirection > 100) {
      goToPrevious();
    } else if (dragDirection < -100) {
      goToNext();
    }
    setDragDirection(0);
  };

  const getPaymentModeColor = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case "cash":
        return "bg-green-100 text-green-800 border-green-200";
      case "upi":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "card":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "npc":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "complementary":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSettleTypeColor = (settleType: string) => {
    switch (settleType?.toLowerCase()) {
      case "normal_settle":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "force_settle":
        return "bg-red-100 text-red-800 border-red-200";
      case "hi_settle":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const printBill = (orderId: string) => {
    reprintBill({
      orderId: orderId,
    });
  };

  const totalItemsCount =
    salesData?.billItems?.reduce(
      (total, item) => total + item.dish.quantity,
      0,
    ) || 0;

  return (
    <Card className="relative w-full overflow-hidden border-none shadow-none">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={(_, info) => setDragDirection(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ opacity: 1 }}
      >
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Payment Details
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {timestampToDateTime(salesData?.date || 0)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                className={`px-3 py-1 font-medium border ${getPaymentModeColor(
                  salesData?.mode || "",
                )}`}
              >
                {salesData?.mode?.toUpperCase()}
              </Badge>
              <span className="text-xs text-gray-500">
                Bill {currentIndex + 1} of {allSalesData.length}
              </span>
            </div>
          </div>

          {/* Navigation indicators */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="h-8 w-8 p-0 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              {allSalesData.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex === allSalesData.length - 1}
              className="h-8 w-8 p-0 bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[75vh] hide-scrollbar space-y-6 pb-[8rem]">
          {/* Payment Summary Card */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Total Paid</p>
                  <p className="text-2xl font-bold text-green-800">
                    ₹{salesData?.order_id?.total}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-700">Order ID</p>
                  <p className="text-lg font-semibold text-green-800">
                    {salesData?._id.slice(-8)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" />
                Payment Information
                <Button
                  onClick={() => printBill(salesData?.order_id?._id)}
                  variant="outline"
                  className="px-6"
                >
                  Print
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow
                label="Bill Value Entered"
                value={`₹${salesData?.order_id?.billValue}`}
              />
              <InfoRow label="Including Tips" value={`₹${salesData?.tips}`} />
              <InfoRow
                label="Discount"
                value={`${salesData?.order_id?.claimedCoins} Coins used`}
              />
              <InfoRow
                label="couponDiscount"
                value={salesData?.order_id?.couponDiscount}
              />
              <InfoRow label="Gst" value={salesData?.order_id?.gst} />
              <InfoRow
                label="Service Charge"
                value={salesData?.serviceCharge}
              />

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Payment Mode</span>
                {isEditingMode ? (
                  <div className="flex items-center gap-2">
                    <select
                      className="border px-2 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedMode}
                      onChange={(e) => setSelectedMode(e.target.value)}
                    >
                      {Array.isArray(modes) && modes.length > 0 ? (
                        modes.map((mode) => (
                          <option
                            disabled={[
                              "npc",
                              "complementary",
                              "dues",
                              "split",
                            ].includes(mode?.name?.toLowerCase())}
                            key={mode?._id}
                            value={mode?.name}
                          >
                            {mode?.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading...</option>
                      )}
                    </select>
                    <Button
                      size="sm"
                      className="text-xs"
                      onClick={() => updateMode(selectedMode)}
                      disabled={isUpdatingMode}
                    >
                      {isUpdatingMode ? "Updating..." : "Update"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() => setIsEditingMode(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${getPaymentModeColor(
                        salesData?.mode || "",
                      )} border`}
                    >
                      {salesData?.mode}
                    </Badge>
                    {!["npc", "complementary", "dues", "split"].includes(
                      salesData?.mode?.toLowerCase() || "",
                    ) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsEditingMode(true)}
                      >
                        <EditIcon className="h-3 w-3 text-gray-500" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Settle Type</span>
                <Badge
                  className={`${getSettleTypeColor(
                    salesData?.settleType || "",
                  )} border`}
                >
                  {salesData?.settleType?.replace("_", " ")}
                </Badge>
              </div>

              {salesData?.settleType === "FORCE_SETTLE" && (
                <InfoRow
                  label="Force Settle Reason"
                  value={salesData?.comment || "No reason provided"}
                  highlight={true}
                />
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label="Customer Name" value={salesData?.userId?.name} />
              <InfoRow label="Table" value={salesData?.order_id?.tableName} />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Phone Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {salesData?.userId?.phone
                      ? hideMiddleNumbers(salesData?.userId?.phone)
                      : "N/A"}
                  </span>
                  {salesData?.userId?.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs bg-transparent"
                      asChild
                    >
                      <a href={`tel:+91${salesData?.userId?.phone}`}>
                        <MdOutlineCall className="h-3 w-3 mr-1" />
                        Call
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Items Accordion */}
          {salesData?.billItems && salesData?.billItems?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="w-4 h-4" />
                  Bill Items
                  <Badge variant="secondary" className="ml-2">
                    {totalItemsCount} items
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Total Value: ₹{salesData.order_id.total}
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="bill-items" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <span className="text-sm font-medium">
                        View {salesData?.billItems.length} item
                        {salesData?.billItems.length > 1 ? "s" : ""} details
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="">
                        {salesData?.billItems.map((item, index) => (
                          <Card
                            key={index}
                            className=" shadow-none border-none"
                          >
                            <CardContent className="p-1 border-b pb-2">
                              <div className="space-y-3">
                                {/* Main dish */}
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {item.dish.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Quantity: {item.quantity} × ₹
                                      {item.dish.price}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                      ₹{item.dish.price * item.quantity}
                                    </p>
                                  </div>
                                </div>

                                {/* Extras */}
                                {item.extras.length > 0 && (
                                  <div className="border-t pt-3">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                                      Add-ons:
                                    </h5>
                                    <div className="space-y-2">
                                      {item.extras.map((extra, extraIndex) => (
                                        <div
                                          key={extraIndex}
                                          className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                                        >
                                          <span className="text-gray-700">
                                            {extra.name}
                                          </span>
                                          <span className="font-medium">
                                            {extra.quantity} × ₹
                                            {extra.price.toFixed(2)} = ₹
                                            {(
                                              extra.quantity * extra.price
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                      <span className="text-sm font-medium">
                                        Item Total:
                                      </span>
                                      <span className="font-semibold">
                                        ₹
                                        {(
                                          item.dish.price * item.quantity +
                                          item.extras.reduce(
                                            (sum, extra) =>
                                              sum +
                                              extra.price * extra.quantity,
                                            0,
                                          )
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          {salesData?.comment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="w-4 h-4" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {salesData.comment}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timestamp */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Transaction completed on{" "}
                  {timestampToDateTime(salesData?.date || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </motion.div>

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "",
            onClick: onClose,
            className: "rounded-md pl-3",
            isBackButton: true,
          },
          {
            text: "Prev",
            onClick: goToPrevious,
            className: "rounded-md !flex-none w-[4rem]",
            disable: currentIndex === 0,
          },
          {
            text: "Next",
            onClick: goToNext,
            className: "rounded-md !flex-none w-[4rem]",
            disable: currentIndex === allSalesData.length - 1,
          },
          {
            text: "Invoice",
            onClick: () => mutateAsync(salesData?._id),
            icon: <Download />,
            className: "rounded-md px-2",
            disable: isPending,
            isLoading: isPending,
          },
        ]}
      />
    </Card>
  );
};

const MemoizedPaymentModal = memo(PaymentModal);
export default MemoizedPaymentModal;
