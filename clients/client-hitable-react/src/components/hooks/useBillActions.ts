import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import type { IBillData } from "@/components/types/hiClientzData.ts";
import { useRemoveCoinz } from "@/components/hooks/api/useCoinz.ts";
import { useRemoveCoupon } from "@/components/hooks/api/useCoupon.ts";

export const useBillActions = (currentBill: IBillData | null) => {
  const { businessId } = useParams();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const { captainData: userData } = useHiClientZ();
  const { removingCoinz } = useRemoveCoinz();
  const { removingCoupon } = useRemoveCoupon();
  const setActiveModal = useOrderStore((s) => s.setActiveModal);
  const setShowMoreOption = useOrderStore((s) => s.setShowMoreOption);

  const [qrBillId, setQrBillId] = useState<string | null>(null);
  const showqr = useOrderStore((s) => s.showqr);
  const setShowqr = useOrderStore((s) => s.setShowqr);

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      const payload = {
        tableId: selectedTable?._id || "",
        captainId: userData?._id,
        billId: currentBill?.billId ?? "",
      };
      if (currentBill?.variantId) {
        payload.variantId = currentBill.variantId;
      }

      const response = await apiRpc.table.hi_settle.$post({
        json: payload,
      });

      if (response.status === 200) {
        const result = await response.json();
        setQrBillId(result?.data?.path);
        setShowqr(true);
      }
      return response.json();
    },
  });

  const removeClaimedCoins = useCallback(() => {
    const confirmReplace = window.confirm(
      "Applying this will remove your Coinz/Coupon. Continue?",
    );
    if (!confirmReplace) return;
    removingCoinz({
      businessId: businessId || "",
      tableName: currentBill?.tableName,
      coinzRemovedBy: userData?.name || "",
    });
  }, [removingCoinz, businessId, currentBill?.tableName, userData?.name]);

  const removeCouponHandler = useCallback(() => {
    const confirmReplace = window.confirm(
      "Applying this will remove your Coupon. Continue?",
    );
    if (!confirmReplace) return;
    removingCoupon({
      businessId: businessId || "",
      tableName: currentBill?.tableName,
    });
  }, [removingCoupon, businessId, currentBill?.tableName]);

  const openServiceChargeModal = useCallback(() => {
    setShowMoreOption(true);
    setActiveModal("serviceCharge");
  }, [setShowMoreOption, setActiveModal]);

  const clickOnKey = useCallback(
    (key: string) => {
      if (key === "discount" || key === "serviceCharge") {
        setShowMoreOption(true);
      }
    },
    [setShowMoreOption],
  );

  const toggleQr = useCallback(() => {
    setShowqr(!showqr);
  }, [showqr]);

  return {
    qrBillId,
    showqr,
    isPending,
    mutate,
    removeClaimedCoins,
    removeCouponHandler,
    openServiceChargeModal,
    clickOnKey,
    toggleQr,
  };
};
