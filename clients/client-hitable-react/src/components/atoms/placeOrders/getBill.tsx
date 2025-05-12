import { memo, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRpc } from "@hi/common";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Phone, ChevronDown, ChevronUp } from "lucide-react";
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import { MdTableBar } from "react-icons/md";
import CommonBottomButton from "../bottomButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useScreenSize } from "@/hooks/useScreenSize";
import ForceSettle from "./forceSettle";
import BottomPopUp from "../universalPopup";
import type { IBillData } from "@/components/types/hiClientzData";
import QrCodePreview from "./qrCode";
import Normalsettle from "./normalsettle";
import { useError } from "@/components/store/useError";
import AddCoinz from "./addCoinz";
import { IoClose } from "react-icons/io5";
import { useUpdateBill } from "@/components/hooks/useTableData";

const MemoGetBill = () => {
  const { businessId } = useParams();
  const queryClient = useQueryClient();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const { openAddCoinz, setOpenAddCoinz, setOpenOrderModal } = useOrderStore();
  const screenSize = useScreenSize();
  const { setError, setOpenErrorModal } = useError();
  const { captainData: userData } = useHiClientZ();
  const [qrBillId, setQrBillId] = useState<string | null>(null);
  const [showqr, setShowqr] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [forceSettle, setForceSettle] = useState<boolean>(false);
  const [normalSettle, setNormalSettle] = useState<boolean>(false);
  const { updateBill } = useUpdateBill();

  const closeOrderModalHandler = useCallback(() => {
    setOpenOrderModal(false);
  }, [setOpenOrderModal]);

  const getTableBill = async () => {
    const response = await apiRpc.pos.get_bill.$get({
      query: {
        businessId: businessId || "",
        tableName: selectedTable?.name || "",
        generatedBy: userData?.name || "",
      },
    });

    if (response.status === 400) {
      return Promise.reject({
        status: 400,
        message: "Server timeout occurred",
      });
    }
    if (response.status === 403 || response.status === 401) {
      setOpenErrorModal(true);
      setError("You are not authorized to perform this action");
      return;
    }

    const res = await response.json();
    const payment = res?.data as IBillData;
    return payment;
  };

  const { isLoading, data } = useQuery({
    queryKey: ["getTableBill", businessId, selectedTable?.name, userData?.name],
    queryFn: getTableBill,
    enabled: !!businessId && !!selectedTable && !!userData,
    staleTime: 1000 * 60,
    initialData: () => {
      return queryClient.getQueryData([
        "getTableBill",
        businessId,
        selectedTable?.name,
        userData?.name,
      ]);
    },
  });

  const toggleQr = () => {
    setShowqr(!showqr);
  };

  const closeForceSettle = () => {
    setForceSettle(false);
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
    updateBill({
      tableName: data?.tableName,
      coinz: 0,
      total: data?.total,
      couponId: null,
      businessId,
    });
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
        <Card className="max-w-md py-[5rem] md:py-[8rem] h-[90dvh] mx-auto mb-8 border border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bill Summary</span>
              <Button variant="outline" onClick={() => setForceSettle(true)}>
                Force Settle
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
            <CardTitle className="flex items-center justify-between">
              <span>Add customer coinz</span>
              <Button
                variant="default"
                className="flex justify-end ml-auto"
                onClick={triggerAddCoinz}
              >
                Add Coinz
              </Button>
            </CardTitle>
            <Separator className="my-4" />
            <div className="mb-4 space-y-3">
              {[
                ["subTotal", data.subTotal],
                ["serviceCharge", data.serviceCharge],
                ["tips", data.tips],
                ["discount", data.discount],
                ["tax", data.tax],
                ["initialTotal", data.initialTotal],
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
                        {key.replace(/([A-Z])/g, " $1")}
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

      {forceSettle && (
        <BottomPopUp
          width="w-[30rem]"
          hide
          show={forceSettle}
          onClose={() => setForceSettle(false)}
        >
          <ForceSettle closeForceSettle={closeForceSettle} data={data} />
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
          height="h-[100dvh] lg:h-[80dvh]"
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
          height="h-[90dvh] lg:h-[90dvh]"
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
