import { lazy, memo, useCallback, useMemo, useState } from "react";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useErrorHandling } from "@/components/utils/helpers";
import toast from "react-hot-toast";
import { NavItemTypesEnum } from "@/components/types/hiClientzData";
import CommonBottomButton from "../bottomButton";
import BillPopupData from "./billPopupData";
import { useReprintBill } from "@/components/hooks/usePrint";
import useBusinessData from "../../store/useBusinessData";
import NormalSettle from "../placeOrders/normalsettle";
import JewelleryBillPopupData from "./JewelleryPopupData";
import BottomActionBar from "./BillButtons";
import { updateTheAlertStatus } from "../../../api/alert";
import { useOnlineAlertsQuery } from "../../../hooks/useHiClients";

const BottomPopUp = lazy(() => import("../universalPopup"));

const BillPopUpMemo = () => {
  const { errorText } = useErrorHandling();

  const selectedNavItem = useLiteStore((s) => s.selectedNavItem);
  const viewData = useLiteStore((s) => s.viewData);
  const setOfflineAlertData = useLiteStore((s) => s.setOfflineAlertData);
  const setOnlineCount = useLiteStore((s) => s.setOnlineCount);
  const onlineCount = useLiteStore((s) => s.onlineCount);
  const { reprintBill } = useReprintBill();
  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);
  const captainData = useHiClientZ((s) => s.captainData);
  const [normalSettle, setNormalSettle] = useState(false);
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const { refetch } = useOnlineAlertsQuery(viewData?.businessId);

  const handleCloseAlert = async (id?: string) => {
    if (!id) return;
    const res = await updateTheAlertStatus({
      alertId: id,
      staffId: captainData?._id || "",
      outletType: outletInfo?.outLetType,
      waiterName: captainData?.name,
    });

    console.log("res", res);

    if (res.status === 401) {
      return errorText();
    }
    if (res.status === 200 || res.status === 201) {
      toast.success("Order rejected successfully");
      setClickViewMore(false);
      setOfflineAlertData(id);
      setOnlineCount(onlineCount - 1);
      refetch?.();
    }
  };

  const handleCloseOnline = useCallback(() => {
    setClickViewMore(false);
  }, [setClickViewMore]);

  const handleAccept = () => setNormalSettle(true);

  const closeNormalSettle = () => setNormalSettle(false);

  const reprintBillHandler = (orderId?: string) => {
    if (!orderId) return;
    reprintBill({ orderId });
  };

  const orderData = useMemo(() => {
    const outletType = outletInfo?.outLetType || "OTHER";
    switch (outletType) {
      case "RESTAURANT":
      case "MENU":
      case "OTHER":
        return viewData?.order_id;
      case "JEWELLERY":
      case "GROCERY":
        return viewData?.orderId;
      default:
        return viewData?.order_id;
    }
  }, [viewData, outletInfo?.outLetType]);

  return (
    <BottomPopUp
      height="h-[100dvh] lg:h-[80vh]"
      show={clickViewMore}
      width="w-[30rem]"
      onClose={handleCloseOnline}
      rightTopBack
      hide
    >
      {normalSettle ? (
        <NormalSettle
          closeNormalSettle={closeNormalSettle}
          data={{ total: Number(orderData?.total || 0) }}
          alertData={viewData}
        />
      ) : (
        <section
          className="hide-scrollbar"
          style={{ maxHeight: "90%", overflowY: "auto" }}
        >
          {/* <BillPopupData viewData={viewData} /> */}
          {(outletInfo?.outLetType === "RESTAURANT" ||
            outletInfo?.outLetType === "MENU" ||
            outletInfo?.outLetType === "OTHER") && (
            <BillPopupData viewData={viewData} />
          )}
          {outletInfo?.outLetType === "JEWELLERY" && (
            <JewelleryBillPopupData viewData={viewData} />
          )}

          {/* Action Buttons */}
          {viewData?.alertType !== "OFFLINE" ||
          selectedNavItem === NavItemTypesEnum.HISTORY ? (
            <CommonBottomButton
              fixed={true}
              maxWidth="30rem"
              position="mid"
              buttons={[
                {
                  text: "Print Bill",
                  onClick: () => reprintBillHandler(viewData?.order_id?._id),
                  className: "rounded-md w-full !bg-purple-500",
                },
                {
                  text: "Close Alert",
                  onClick: handleCloseOnline,
                  className: "rounded-md w-full",
                },
              ]}
            />
          ) : (
            <BottomActionBar
              onReject={() => handleCloseAlert(viewData?._id)}
              onConfirm={handleAccept}
              rejectText="Decline"
              confirmText="Approve"
              maxWidth="30rem"
            />
          )}
        </section>
      )}
    </BottomPopUp>
  );
};

const BillPopUp = memo(BillPopUpMemo);
export default BillPopUp;
