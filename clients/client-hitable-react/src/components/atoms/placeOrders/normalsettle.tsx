import { memo, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { CreditCard, Banknote, Smartphone } from "lucide-react";
import CommonBottomButton from "../bottomButton";
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import toast from "react-hot-toast";
import type { Alert, IBillData } from "@/components/types/hiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import MultipleModes from "./multipleModes";
import SingleMode from "./singleMode";
import { useGetAllModes } from "@/components/hooks/useTableData";
import { useError } from "@/components/store/useError";
import { SettleConfirmationDialog } from "./SettleConfirmation.tsx";
import { useConfirmSettle } from "@/components/hooks/api/useSettle.ts";
import { useGetBill } from "@/components/hooks/useBill.ts";
import { useFinalPopcornSettle } from "@/components/hooks/payments/useFinalSettle.ts";
import useBusinessData from "@/components/store/useBusinessData.ts";

export interface IMode {
  _id: string;
  name: string;
  active: boolean;
}

export const ModeIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case "cash":
      return <Banknote className="w-6 h-6" />;
    case "upi":
      return <Smartphone className="w-6 h-6" />;
    default:
      return <CreditCard className="w-6 h-6" />;
  }
};

const MemoNormalSettle = ({
  closeNormalSettle,
  data: billData,
  alertData,
}: {
  data?: IBillData;
  closeNormalSettle: () => void;
  alertData?: Alert;
}) => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { confirmAlert, isAlertLoading } = useFinalPopcornSettle();
  const { setError, setOpenErrorModal } = useError();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);
  const isSplit = useOrderStore((s) => s.isSplit);
  const setIsSplit = useOrderStore((s) => s.setIsSplit);
  const settleModes = useOrderStore((s) => s.settleModes);
  const setSettleModes = useOrderStore((s) => s.setSettleModes);
  const openDues = useOrderStore((s) => s.openDues);
  const setOpenDues = useOrderStore((s) => s.setOpenDues);
  const setSaveDueUser = useOrderStore((s) => s.setSaveDueUser);
  const saveDueUser = useOrderStore((s) => s.saveDueUser);
  const isBillSplit = useOrderStore((s) => s.isBillSplit);
  const { isConfirming, confirmSettle } = useConfirmSettle();
  const { getBillCall } = useGetBill();
  const setSelectedBill = useOrderStore((s) => s.setSelectedBill);
  const outletInfo = useBusinessData((s) => s.outletInfo);

  const orderData = useMemo(() => {
    const outletType = outletInfo?.outLetType || "OTHER";
    switch (outletType) {
      case "RESTAURANT":
      case "MENU":
      case "OTHER":
        return alertData?.order_id;
      case "JEWELLERY":
      case "GROCERY":
        return alertData?.orderId;
      default:
        return alertData?.order_id;
    }
  }, [alertData, outletInfo?.outLetType]);

  const captainData = useHiClientZ((s) => s.captainData);

  const { isLoading, paymentMode } = useGetAllModes(
    businessId,
    captainData?.name,
  );

  const { mutateAsync: settleTable, isPending: isSettling } = useMutation({
    mutationFn: async (payload: {
      tableId: string;
      billId: string;
      captainId: string;
      settleModes: {
        _id: string;
        name: string;
        amount: number;
      }[];
      split?: boolean;
      duesUserId?: string;
      variantId?: string;
    }) => {
      const response = await apiRpc.table.normal_settle.$post({
        json: payload,
      });
      if (response.status === 401 || response.status === 403) {
        setOpenErrorModal(true);
        setError("You are not authorized to perform this action");
        return {
          err: true,
          message: "You are not authorized to perform this action",
        };
      }
      const res = await response.json();
      return res;
    },
    onSuccess: (data) => {
      if (data?.err) {
        toast.error(data.message);
        return;
      }
      if (!data?.err) {
        toast.success("Table settled successfully!");
        setSettleModes([]);
        closeNormalSettle();
        setIsSplit(false);
        setOpenDues(false);
        setSettleModes([]);
        setSaveDueUser(null);
        if (!isBillSplit) {
          toast.success("Split bill settled successfully!");
          setOpenOrderModal(false);
          navigate(`/${businessId}/alerts`);
        } else {
          setSelectedBill(null);
          getBillCall();
        }
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });

  const handleConfirm = async (alertData: Alert) => {
    try {
      if (settleModes.length === 0) {
        toast.error("Please select at least one payment mode.");
        return;
      }
      // Validate total
      const sum = settleModes.reduce((acc, item) => acc + item.amount, 0);
      if (sum !== (orderData?.total ? orderData.total : billData?.total ?? 0)) {
        toast.error("Selected amounts must match the total bill.");
        return;
      }

      const isMultiple = settleModes.length > 1;
      const hasDuesMode = settleModes.some(
        (mode) => mode.name.toLowerCase() === "dues",
      );
      const hasNpcMode = settleModes.some(
        (mode) => mode.name.toLowerCase() === "npc",
      );

      if (alertData?.alertType === "OFFLINE") {
        const payload = {
          alertId: alertData._id,
          waiterName: captainData?.name,
          comment: isMultiple
            ? "Confirmed by waiter (split)."
            : "Confirmed by waiter (single).",
          settleModes,
          staffId: captainData?._id || "",
        };

        if (hasDuesMode && saveDueUser?._id) {
          payload["duesUserId"] = saveDueUser._id;
        }
        if (hasNpcMode && saveDueUser?._id) {
          payload["npcUserId"] = saveDueUser?._id;
        }

        const res = await confirmAlert(payload);
        if (res.status === 200 || res.status === 201) {
          closeNormalSettle();
        }
      } else {
        const payload = {
          tableId: selectedTable?._id || "",
          billId: billData?.billId || "",
          captainId: captainData?._id || "",
          settleModes,
          split: isMultiple,
        };

        // If there's a "dues" mode selected, append the duesUserId
        if (hasDuesMode && saveDueUser?._id) {
          payload["duesUserId"] = saveDueUser._id;
        }
        if (hasNpcMode && saveDueUser?._id) {
          payload["npcUserId"] = saveDueUser?._id;
        }
        if (billData?.variantId) {
          payload["variantId"] = billData?.variantId;
        }

        // Call the API
        await settleTable(payload);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const openNormalSettle = () => {
    if (billData?.isPaid) {
      return toast.error("This bill is already settled.");
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSettle = async () => {
    setShowConfirmDialog(false);

    if (alertData?.alertType === "OFFLINE") {
      await handleConfirm(alertData);
      return;
    }
    const response = await confirmSettle({
      businessId: businessId || "",
      tableName: selectedTable?.name || "",
    });

    if (response.status === 200 || response.status === 201) {
      await handleConfirm(alertData);
    }
  };

  if (isLoading) {
    return <SpinnerMemo />;
  }

  return (
    <section className="mx-auto">
      <h2 className="flex items-center justify-between p-4 mb-2 text-2xl font-bold text-center">
        <span>{isSplit ? "Split Payment" : "Select Payment Mode"}</span>
        <span>₹{orderData?.total ? orderData.total : billData?.total}</span>
      </h2>

      {/* =======================
          SINGLE MODE UI
      ======================== */}
      {!isSplit && (
        <SingleMode
          paymentModes={paymentMode || []}
          billData={
            orderData?.total ? { total: Number(orderData.total) } : billData
          }
        />
      )}

      {/* =======================
          SPLIT MODE UI
      ======================== */}
      {isSplit && (
        <MultipleModes
          paymentModes={paymentMode || []}
          billData={
            orderData?.total ? { total: Number(orderData.total) } : billData
          }
        />
      )}

      {/* =======================
          BOTTOM BUTTONS
      ======================== */}
      {!openDues ? (
        <CommonBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            {
              text: "Back",
              onClick: () => {
                if (isSplit) {
                  setIsSplit(false);
                } else {
                  closeNormalSettle();
                }
              },
              className: " rounded-md pl-3 !w-[8rem]",
              isBackButton: true,
            },
            {
              text: isSplit ? "Normal" : "Split",
              onClick: () => {
                setIsSplit(!isSplit);
              },
              className: "w-full rounded-md pl-3",
            },
            {
              text: "Confirm",
              onClick: openNormalSettle,
              className: "w-full rounded-md",
              disable: settleModes.length === 0,
              isLoading: isSettling || isAlertLoading || isConfirming,
            },
          ]}
        />
      ) : (
        <CommonBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            {
              text: "Back",
              onClick: () => {
                setOpenDues(false);
                setSettleModes([]);
                setSaveDueUser(null);
              },
              className: "w-full rounded-md pl-3 ",
              isBackButton: true,
            },
            {
              text: "Confirm",
              onClick: openNormalSettle,
              className: "w-full rounded-md",
              disable: settleModes.length === 0,
              isLoading: isSettling || isAlertLoading || isConfirming,
            },
          ]}
        />
      )}

      {/* Confirmation Dialog */}
      <SettleConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmSettle}
        isLoading={isConfirming || isSettling || isAlertLoading}
        showSettlingLoader={isSettling}
      />
    </section>
  );
};

const NormalSettle = memo(MemoNormalSettle);
export default NormalSettle;
