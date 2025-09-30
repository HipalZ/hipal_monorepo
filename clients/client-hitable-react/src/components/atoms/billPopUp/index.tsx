import { lazy, memo, useCallback, useState } from "react";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useErrorHandling } from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import NormalSettle from "../placeOrders/normalsettle";
import { NavItemTypesEnum } from "@/components/types/hiClientzData";
import CommonBottomButton from "../bottomButton/index.tsx";
import BillPopupData from "./billPopupData.tsx";
import { useReprintBill } from "@/components/hooks/usePrint.ts";

const BottomPopUp = lazy(() => import("../universalPopup"));

const BillPopUpMemo = () => {
  const { errorText } = useErrorHandling();

  const selectedNavItem = useLiteStore((s) => s.selectedNavItem);
  const viewData = useLiteStore((s) => s.viewData);
  const removeOfflineAlert = useLiteStore((s) => s.removeOfflineAlert);

  const { billPrinting, reprintBill } = useReprintBill();

  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);
  const captainData = useHiClientZ((s) => s.captainData);
  const [normalSettle, setNormalSettle] = useState<boolean>(false);

  const handleCloseAlert = async (id: string) => {
    const res = await apiRpc.payments[":pid"].rejectOrder[":alertId"].$put({
      json: {
        waiterName: captainData?.name,
      },
      param: { alertId: id },
    });
    if (res.status === 401) {
      return errorText();
    }
    toast.success("order reject successfully");
    setClickViewMore(false);
    removeOfflineAlert(id);
  };

  const handleCloseOnline = useCallback(() => {
    setClickViewMore(false);
  }, [setClickViewMore]);

  const handleAccept = () => {
    setNormalSettle(true);
  };

  const closeNormalSettle = () => {
    setNormalSettle(false);
  };

  const reprintBillHandler = (orderId: string) => {
    reprintBill({
      orderId: orderId,
    });
  };

  // Calculate totals and discounts
  const orderData = viewData?.order_id;

  return (
    <BottomPopUp
      height="h-[100dvh] lg:h-[80vh]"
      show={clickViewMore}
      onClose={handleCloseOnline}
    >
      {normalSettle ? (
        <NormalSettle
          closeNormalSettle={closeNormalSettle}
          data={{ total: Number(orderData?.total) }}
          alertData={viewData}
        />
      ) : (
        <section
          className="hide-scrollbar"
          style={{ maxHeight: "90%", overflowY: "auto" }}
        >
          <BillPopupData viewData={viewData} />
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
            <div className="fixed bottom-0 z-20 w-full max-w-[48rem] bg-white border-t border-gray-200 p-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleCloseAlert(viewData?._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </BottomPopUp>
  );
};

const BillPopUp = memo(BillPopUpMemo);
export default BillPopUp;
