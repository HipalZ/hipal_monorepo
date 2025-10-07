import { memo, useCallback } from "react";
import { useLiteStore } from "@/components/store/useLiteStore";
import type { Alert } from "@/components/types/hiClientzData";
import { cn, timestampToDateTime } from "@/components/utils/helpers";
import { PiCoinsFill } from "react-icons/pi";
import { FaUser, FaUserTie } from "react-icons/fa";
import { MdTableBar } from "react-icons/md";
import useBusinessData from "@/components/store/useBusinessData";

interface IOnlineProp {
  onlineAlertData: Alert[];
}

const HistoryCard = (props: IOnlineProp) => {
  const { onlineAlertData } = props;
  const { setViewData } = useLiteStore((s) => ({
    setViewData: s.setViewData,
  }));
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);

  const handleViewMore = (alert: Alert) => {
    setViewData(alert);
    setClickViewMore(true);
  };

  const orderData = useCallback(
    (alert: Alert) => {
      console.log("onlineAlertData", onlineAlertData);
      if (outLetType === "JEWELLERY") {
        return alert.orderId;
      }
      return alert.order_id;
    },
    [onlineAlertData, outLetType],
  );

  return (
    <main className="grid gap-6 p-6 pb-20 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.isArray(onlineAlertData) && onlineAlertData.length > 0 ? (
        onlineAlertData.map((alert: Alert) => {
          if (alert?.alertType === "WAITER") {
            return null;
          }
          const order = orderData(alert);
          return (
            <section
              key={alert?._id}
              className={cn(
                "rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl",
                alert?.status === "FAIL" ? "bg-red-50" : "bg-white",
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "flex items-center rounded-full px-3 py-1 text-xs font-medium",
                    alert?.status === "FAIL"
                      ? "bg-red-100 text-red-800"
                      : alert?.alertType === "OFFLINE"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-green-100 text-green-800",
                  )}
                >
                  <PiCoinsFill className="mr-1" />
                  {alert?.status === "FAIL"
                    ? "Payment Failed"
                    : `${alert?.alertType.toLowerCase()}`}
                </div>
                <span className="text-xs text-gray-500">
                  {timestampToDateTime(alert?.date)}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm">
                    Bill value:{" "}
                    <span className="font-semibold">₹{order?.billValue}</span>
                  </p>
                  <p className="text-sm">
                    Discount:{" "}
                    <span className="font-semibold">
                      ₹{order?.claimedCoins}
                    </span>
                  </p>
                  <p className="text-sm">
                    Tips: <span className="font-semibold">₹{order?.tips}</span>
                  </p>
                  {alert?.coinsApplied && (
                    <div className="flex items-center px-3 py-1 mt-2 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                      <PiCoinsFill className="mr-1" />
                      {order?.claimedCoins} Used
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-right">
                  <p className="flex items-center justify-end text-sm">
                    <FaUser className="mr-1" />
                    {alert?.userId?.name?.length > 10
                      ? `${alert?.userId?.name.substring(0, 10)}...`
                      : alert?.userId?.name}
                  </p>
                  {alert?.alertType !== "ONLINE" && (
                    <p className="flex items-center justify-end text-sm">
                      <FaUserTie className="mr-1" />
                      {alert?.waiterName || "Staff"}
                    </p>
                  )}
                  <p className="flex items-center justify-end text-sm">
                    <MdTableBar className="mr-1" />
                    {alert?.tableName}
                  </p>
                  <p className="text-2xl font-bold">₹{order?.total}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleViewMore(alert)}
                className="w-full px-4 py-2 mt-4 text-sm font-medium text-white transition-colors duration-300 bg-black rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                View Details
              </button>
            </section>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-64 text-2xl text-gray-500 col-span-full">
          No Data Found
        </div>
      )}
    </main>
  );
};

const HistoryCardMemo = memo(HistoryCard);
export default HistoryCardMemo;
