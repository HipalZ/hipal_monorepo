import { memo, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRpc } from "@hi/common";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import { useMutation } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import { MdTableBar } from "react-icons/md";
import CommonBottomButton from "../bottomButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useScreenSize } from "@/hooks/useScreenSize";
import BottomPopUp from "../universalPopup";
import QrCodePreview from "./qrCode";
import Normalsettle from "./normalsettle";
import AddCoinz from "./addCoinz";
import { IoClose } from "react-icons/io5";
import { useUpdateBill } from "@/components/hooks/useTableData";
import useBusinessData from "@/components/store/useBusinessData";
import MemoBillOptions from "./BillOptions";
import { useGetBill } from "@/components/hooks/useBill";

const MemoGetBill = () => {
  const { businessId } = useParams();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const { openAddCoinz, setOpenAddCoinz, setOpenOrderModal } = useOrderStore();
  const screenSize = useScreenSize();
  const { captainData: userData } = useHiClientZ();

  const [qrBillId, setQrBillId] = useState<string | null>(null);
  const [showqr, setShowqr] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showMoreOption, setShowMoreOption] = useState<boolean>(false);
  const [normalSettle, setNormalSettle] = useState<boolean>(false);

  const { updateBill } = useUpdateBill();
  const existingLoyalty = useBusinessData((s) => s.existingLoyalty);

  const closeOrderModalHandler = useCallback(() => {
    setOpenOrderModal(false);
  }, [setOpenOrderModal]);

  const { isLoading, data } = useGetBill();

  const toggleQr = () => {
    setShowqr(!showqr);
  };

  const closeMoreOptions = () => {
    setShowMoreOption(false);
  };

  const closeNormalSettle = () => {
    setNormalSettle(false);
  };

  const triggerAddCoinz = () => {
    setOpenAddCoinz(true);
  };

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      const response = await apiRpc.table.hi_settle.$post({
        json: {
          tableId: selectedTable?._id || "",
          captainId: userData?._id,
          billRequestId: data?.billRequestId ?? "",
        },
      });

      if (response.status === 200) {
        const result = await response.json();
        setQrBillId(result?.data?.path);
        setShowqr(true);
      }

      return response.json();
    },
  });

  const removeClaimedCoins = () => {
    const confirmReplace = window.confirm(
      "Applying this will remove your Coinz/Coupon. Continue?",
    );

    if (!confirmReplace) return;

    updateBill({
      tableName: data?.tableName,
      coinz: 0,
      total: data?.total,
      couponId: null,
      businessId,
    });
  };

  // Helper function to render action history
  const renderActionHistory = () => {
    if (!data) return null;

    const actions = [];

    if (data.discountAppliedBy) {
      actions.push({
        type: "Discount Applied",
        user: data.discountAppliedBy,
        details: `₹${data.discount} discount applied ${
          data.discountAppliedOn === "ON_DISH"
            ? "on specific items"
            : "on entire bill"
        }`,
        reason: data.reasonOfDiscount,
        color: "bg-red-50 border-red-200 text-red-800",
        badgeColor: "bg-red-100 text-red-800",
      });
    }

    if (data.discountRemovedBy) {
      actions.push({
        type: "Discount Removed",
        user: data.discountRemovedBy,
        details: "Previous discount has been removed from the bill",
        color: "bg-green-50 border-green-200 text-green-800",
        badgeColor: "bg-green-100 text-green-800",
      });
    }

    if (data.serviceChargeAppliedBy) {
      actions.push({
        type: "Service Charge Applied",
        user: data.serviceChargeAppliedBy,
        details: `₹${data.serviceCharge} service charge added to the bill`,
        color: "bg-blue-50 border-blue-200 text-blue-800",
        badgeColor: "bg-blue-100 text-blue-800",
      });
    }

    if (data.serviceChargeRemovedBy) {
      actions.push({
        type: "Service Charge Removed",
        user: data.serviceChargeRemovedBy,
        details: "Service charge has been removed from the bill",
        reason: data.reasonOfServiceCharge,
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
        badgeColor: "bg-yellow-100 text-yellow-800",
      });
    }

    if (data.claimedCoins > 0) {
      actions.push({
        type: "Loyalty Coins Applied",
        user: "Customer",
        details: `₹${data.claimedCoins} loyalty coins redeemed`,
        color: "bg-purple-50 border-purple-200 text-purple-800",
        badgeColor: "bg-purple-100 text-purple-800",
      });
    }

    if (data.couponDiscount > 0) {
      actions.push({
        type: "Coupon Applied",
        user: "System",
        details: `₹${data.couponDiscount} coupon discount applied`,
        color: "bg-indigo-50 border-indigo-200 text-indigo-800",
        badgeColor: "bg-indigo-100 text-indigo-800",
      });
    }

    return actions.length > 0 ? (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Bill Modifications History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((action, index) => (
            <Alert key={index} className={`${action.color} border-l-4`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{action.type}</span>
                      <Badge className={action.badgeColor}>
                        <User className="w-3 h-3 mr-1" />
                        {action.user}
                      </Badge>
                    </div>
                    <p className="text-sm">{action.details}</p>
                    {action.reason && (
                      <p className="text-xs mt-1 opacity-80">
                        Reason: {action.reason}
                      </p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    ) : null;
  };

  if (isLoading) {
    return <SpinnerMemo />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No bill available.</p>
        <CommonBottomButton
          fixed={true}
          maxWidth={screenSize === "xs" ? "30rem" : "48rem"}
          backgroundColor={screenSize === "xs" ? "" : "white"}
          buttons={[
            {
              text: "Back",
              onClick: closeOrderModalHandler,
              className: "rounded-md w-full",
            },
          ]}
        />
      </div>
    );
  }

  return (
    <>
      {!showqr && (
        <Card className="max-w-lg py-[5rem] md:py-[8rem] h-[90dvh] mx-auto mb-8 border border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bill Summary</span>
              <Button variant="outline" onClick={() => setShowMoreOption(true)}>
                More options
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700">
                  {data?.customerName} ({data?.customerPhone})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MdTableBar className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700">
                  Table: {data?.tableName}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Action History */}
            {renderActionHistory()}

            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="justify-between w-full">
                  <h3 className="font-semibold">
                    Items: {data?.items?.length}
                  </h3>
                  {isExpanded ? (
                    <ChevronUp strokeWidth={4} className="w-4 h-4" />
                  ) : (
                    <ChevronDown strokeWidth={4} className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 overflow-auto max-h-[40vh] hide-scrollbar py-2">
                {data?.items?.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 text-sm rounded-md bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{item?.dish?.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-600">
                          Qty: {item?.dish?.quantity}
                        </p>
                        <p>₹{item?.dish?.quantity * item?.dish?.price}</p>
                      </div>
                    </div>
                    {item?.extras?.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        <p className="font-medium">Extras:</p>
                        {item?.extras?.map((extra, idx) => (
                          <p key={idx}>
                            {extra?.name} - ₹{extra?.price} x {extra?.quantity}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4" />

            {existingLoyalty?.loyaltyId && (
              <>
                <CardTitle className="flex items-center justify-between">
                  <span>Use customer Loyalty</span>
                  <Button
                    variant="default"
                    className="flex justify-end ml-auto"
                    onClick={triggerAddCoinz}
                  >
                    Use Coinz
                  </Button>
                </CardTitle>
                <Separator className="my-4" />
              </>
            )}

            <div className="mb-4 space-y-3">
              {[
                [
                  "subTotal",
                  Math.max(
                    0,
                    Number(data?.subTotal ?? 0) -
                      Number(data?.claimedCoins ?? 0),
                  ),
                ],
                ["serviceCharge", data.serviceCharge],
                ["tips", data.tips],
                ["discount", data.discount],
                ["tax", data.gst],
                ["claimedCoins", data.claimedCoins],
              ]
                .filter(([_, value]) => typeof value === "number" && value > 0)
                .map(([key, value]) => {
                  const isDeduction =
                    key === "claimedCoins" || key === "discount";
                  return (
                    <div
                      key={key}
                      className="flex justify-between items-center text-sm"
                    >
                      <p className="text-gray-700 capitalize">
                        {key?.replace(/([A-Z])/g, " $1")}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p
                          className={`font-medium ${
                            isDeduction ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {isDeduction
                            ? `-₹${Number(value).toFixed(2)}`
                            : `₹${Number(value).toFixed(2)}`}
                        </p>
                        {key === "claimedCoins" && (
                          <button
                            type="button"
                            onClick={removeClaimedCoins}
                            className="text-red-600 text-2xl hover:underline"
                          >
                            <IoClose />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <p className="text-black">Total</p>
                <p className="text-black">₹{Number(data.total).toFixed(2)}</p>
              </div>
            </div>

            <Separator className="my-4" />
          </CardContent>
        </Card>
      )}

      {showMoreOption && (
        <BottomPopUp
          width="w-[30rem]"
          height="h-[100dvh] lg:h-[90dvh]"
          hide
          show={showMoreOption}
          onClose={closeMoreOptions}
          rightTopBack
        >
          <MemoBillOptions data={data} />
        </BottomPopUp>
      )}

      {showqr && (
        <BottomPopUp
          width="w-[30rem]"
          hide
          show={showqr}
          onClose={() => setShowqr(false)}
        >
          <QrCodePreview data={data} qrBillId={qrBillId} toggleQr={toggleQr} />
        </BottomPopUp>
      )}

      {normalSettle && (
        <BottomPopUp
          height="h-[100dvh] lg:h-[90dvh]"
          hide
          width="w-[30rem]"
          show={normalSettle}
          onClose={() => setNormalSettle(false)}
        >
          <Normalsettle closeNormalSettle={closeNormalSettle} data={data} />
        </BottomPopUp>
      )}

      {openAddCoinz && (
        <BottomPopUp
          height="h-[85dvh] lg:h-[85dvh]"
          width="w-[30rem]"
          show={openAddCoinz}
          onClose={() => setOpenAddCoinz(false)}
        >
          <AddCoinz data={data} />
        </BottomPopUp>
      )}

      <CommonBottomButton
        maxWidth={screenSize === "xs" ? "30rem" : "48rem"}
        backgroundColor={screenSize === "xs" ? "" : "white"}
        buttons={[
          {
            text: "",
            isBackButton: true,
            onClick: closeOrderModalHandler,
            className: "rounded-md pl-3",
          },
          {
            text: "Normal Settle",
            onClick: () => {
              setNormalSettle(true);
            },
            className: "rounded-md",
          },
          {
            text: "Hi Settle",
            onClick: () => {
              mutate();
            },
            disable: isPending,
            isLoading: isPending,
            highlight: true,
            className: "rounded-md",
          },
        ]}
      />
    </>
  );
};

const GetBill = memo(MemoGetBill);

export default GetBill;
