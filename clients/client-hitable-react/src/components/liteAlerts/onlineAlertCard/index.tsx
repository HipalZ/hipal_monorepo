import { handleRemoveAlert } from "@/components/hooks/commonApi";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import type { Alert } from "@/components/types/hiClientzData";
import { cn, timestampToDateTime } from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import { memo } from "react";
import { CiGlobe } from "react-icons/ci";
import { IoCloseCircleSharp } from "react-icons/io5";
import { PiCoinsFill } from "react-icons/pi";

interface IOnlineProp {
  onlineAlertData: Alert[];
}

const OnlineAlertCard = (props: IOnlineProp) => {
  const { onlineAlertData } = props;
  const { removeOnlineAlert, setViewData, removeOnlineCount } = useLiteStore(
    (s) => ({
      removeOnlineAlert: s.removeOnlineAlert,
      setViewData: s.setViewData,
      removeOnlineCount: s.removeOnlineCount,
    }),
  );
  const captainData = useHiClientZ((s) => s.captainData);
  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);

  const handleViewMore = (alert: Alert) => {
    setViewData(alert);
    setClickViewMore(!clickViewMore);
  };

  const removeAlert = async (id: string) => {
    try {
      const res = await handleRemoveAlert(apiRpc, id, captainData?.name);
      if (res.status === 200) {
        removeOnlineAlert(id);
        removeOnlineCount();
      } else {
        console.error("Failed to remove alert");
      }
    } catch (error) {
      console.error("Error removing alert:", error);
    }
  };

  return (
    <main className="pb-[5rem] lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.isArray(onlineAlertData) && onlineAlertData.length > 0 ? (
        onlineAlertData.map((alert: Alert) => {
          return (
            <section
              key={alert?._id}
              className={cn(
                "relative mx-4 my-4 h-full rounded-xl bg-white p-4",
                alert?.status === "FAIL" ? "bg-red-100" : "bg-green-100",
              )}
            >
              <section className="flex items-center justify-between mb-2">
                <article
                  className={cn("flex w-[8rem] items-center rounded-full px-2")}
                >
                  <span>
                    <CiGlobe />
                  </span>
                  &nbsp;
                  <h1 className="text-xs font-semibold">
                    {alert?.status === "FAIL"
                      ? `Failed ${alert?.alertType.toLowerCase()}`
                      : `Received ${alert?.alertType.toLowerCase()}`}
                  </h1>
                </article>
                <article>
                  <h1 className="text-xs text-gray-500">
                    {timestampToDateTime(alert?.date)}
                  </h1>
                </article>
                <IoCloseCircleSharp
                  onClick={() => removeAlert(alert?._id)}
                  size={28}
                  className="absolute inline text-red-400 -right-2 -top-2"
                />
              </section>
              <div className="flex justify-between">
                <section>
                  <article className="ml-2 space-y-1">
                    <h1 className="text-base">
                      Bill value : ₹ {alert?.order_id?.billValue}
                    </h1>
                    <h1 className="text-base">
                      Discount : ₹ {alert?.order_id?.claimedCoins}
                    </h1>
                    <h6 className="text-sm">
                      Tips : ₹ {alert?.order_id?.tips}
                    </h6>
                  </article>
                  {alert?.coinsApplied ? (
                    <article className="flex items-center justify-start px-3 my-2 bg-gray-200 rounded-full w-fit">
                      <span>
                        <PiCoinsFill size={20} />
                      </span>
                      &nbsp;
                      <h1 className="text-xs">
                        {alert?.order_id?.claimedCoins} Used
                      </h1>
                    </article>
                  ) : null}
                </section>
                <section className="text-right">
                  <p>
                    User :{" "}
                    {alert?.userId?.name?.length > 10
                      ? `${alert?.userId?.name.substring(0, 10)}...`
                      : alert?.userId?.name || "customer"}
                  </p>
                  <article className="space-y-1">
                    <h1 className="text-base text-gray-700">
                      Table : {alert?.tableName}
                    </h1>
                    <h6 className="text-2xl font-semibold">
                      ₹ {alert?.order_id?.total}
                    </h6>
                  </article>
                  <button
                    type="button"
                    onClick={() => handleViewMore(alert)}
                    className="px-6 py-2 mt-2 text-white bg-black rounded-full"
                  >
                    <h1 className="text-xs">More</h1>
                  </button>
                </section>
              </div>
            </section>
          );
        })
      ) : (
        <div className="absolute text-2xl text-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          No Data Found
        </div>
      )}
    </main>
  );
};

const OnlineAlertCardMemo = memo(OnlineAlertCard);
export default OnlineAlertCardMemo;
