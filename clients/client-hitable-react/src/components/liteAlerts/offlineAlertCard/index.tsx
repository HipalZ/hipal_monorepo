import callwaiter from "@/assets/img/callwaiter.png";
import { handleRemoveAlert } from "@/components/hooks/commonApi";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import type { Alert } from "@/components/types/hiClientzData";
import {
  cn,
  timestampToDateTime,
  useErrorHandling,
} from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import { FiCopy } from "react-icons/fi";
import { memo, useCallback, useState } from "react";
import { CiGlobe } from "react-icons/ci";
import { IoCloseCircleSharp } from "react-icons/io5";
import { PiCoinsFill } from "react-icons/pi";
import { MdOutlineCall } from "react-icons/md";

interface IOfflineProp {
  offlineAlertData: Alert[];
}

const OfflineAlertCard = (props: IOfflineProp) => {
  const { errorText } = useErrorHandling();
  const [numberTick, setNumberTick] = useState(false);
  const { offlineAlertData } = props;
  const {
    removeOfflineAlert,
    setViewData,
    clickViewMore,
    setClickViewMore,
    removeOfflineCount,
  } = useLiteStore((s) => ({
    removeOfflineAlert: s.removeOfflineAlert,
    setViewData: s.setViewData,
    clickViewMore: s.clickViewMore,
    setClickViewMore: s.setClickViewMore,
    removeOfflineCount: s.removeOfflineCount,
  }));
  const { captainData } = useHiClientZ((s) => ({
    captainData: s.captainData,
  }));

  const handleViewMore = (alert: Alert) => {
    setViewData(alert);
    setClickViewMore(!clickViewMore);
  };

  const removeAlert = async (id: string) => {
    try {
      const res = await handleRemoveAlert(apiRpc, id, captainData?.name);
      if (res.status === 401) {
        return errorText();
      }
      if (res.status === 200) {
        removeOfflineAlert(id);
        removeOfflineCount();
      } else {
        console.error("Failed to remove alert");
      }
    } catch (error) {
      console.error("Error removing alert:", error);
    }
  };

  const copyText = useCallback((id: string, value?: string) => {
    let text: string;
    if (value) {
      text = value;
    } else {
      text = document.querySelector(id)?.textContent || "";
    }

    const sanitizedText = text.replace(/[₹]/g, "");
    navigator.clipboard
      .writeText(sanitizedText)
      .then(() => {
        setNumberTick(true);
        setTimeout(() => {
          setNumberTick(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }, []);

  return (
    <main className="pb-[5rem] lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from(offlineAlertData) && offlineAlertData?.length > 0 ? (
        offlineAlertData.map((alert: Alert) => {
          return (
            <section key={alert?._id}>
              {alert?.alertType === "WAITER" ? (
                <div className="mx-4 my-4 min-h-[9rem] rounded-xl bg-white p-3">
                  <section className="relative flex justify-between mb-2">
                    <article className="flex w-[8rem] items-center rounded-full bg-[#ffe9cf] px-2">
                      <img src={callwaiter} alt="callwaiter" loading="lazy" />
                      &nbsp;&nbsp;
                      <h1 className="text-xs">Call the waiter</h1>
                    </article>
                    <article>
                      <h1 className="text-xs text-gray-500">
                        {timestampToDateTime(alert?.date)}
                      </h1>
                    </article>
                    <IoCloseCircleSharp
                      onClick={() => removeAlert(alert?._id)}
                      size={24}
                      className="absolute inline text-red-400 -right-6 -top-6"
                    />
                  </section>
                  <div className="flex justify-between">
                    <section className="ml-2 space-y-1">
                      <h1 className="text-base">
                        User: {alert?.userId?.name || "Customer"}
                      </h1>
                      <article className="flex items-center space-x-4">
                        <h1>Phone: {alert?.userId?.phone || "NA"}</h1>
                        <span
                          className={cn(
                            "rounded-2xl",
                            numberTick
                              ? "bg-green-500/20 text-green-500"
                              : "bg-[#f3eeff] text-[#7f46ff]",
                          )}
                          onClick={() =>
                            copyText("#phone", alert?.userId?.phone)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <FiCopy size={16} />
                        </span>
                        <a
                          href={`tel:+91${alert?.userId?.phone}`}
                          className="flex items-center rounded-full text-[#6f2eff]"
                        >
                          <MdOutlineCall size={16} />
                        </a>
                      </article>
                      <p>{alert?.message}</p>
                    </section>
                    <section className="text-right">
                      <h1>Table: {alert?.tableName}</h1>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="p-3 mx-4 my-4 bg-white rounded-xl">
                  <section className="flex items-center justify-between mb-2">
                    <article className="flex w-[8.5rem] items-center rounded-full bg-[#ffe9cf] px-2">
                      <span>
                        <CiGlobe />
                      </span>
                      &nbsp;
                      <h1 className="text-xs">Confirm On floor</h1>
                    </article>
                    <article>
                      <h1 className="text-xs text-gray-500">
                        {timestampToDateTime(alert?.date)}
                      </h1>
                    </article>
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
                        <h6 className="text-xs">
                          Tips : ₹ {alert?.order_id?.tips}
                        </h6>
                      </article>
                      {alert?.coinsApplied ? (
                        <article className="flex items-center justify-start px-3 my-2 bg-gray-200 rounded-full py- w-fit">
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
                          ? `${alert.userId.name.substring(0, 10)}...`
                          : alert?.userId?.name}
                      </p>
                      <article className="space-y-1">
                        <h1 className="text-base text-gray-700">
                          Table: {alert?.order_id?.tableName}
                        </h1>
                        <h6 className="text-2xl font-semibold">
                          ₹ {alert?.order_id?.total}
                        </h6>
                      </article>
                      <button
                        type="button"
                        onClick={() => handleViewMore(alert)}
                        className="px-6 py-1 mt-6 text-white bg-black rounded-full"
                      >
                        <h1 className="text-xs">View</h1>
                      </button>
                    </section>
                  </div>
                </div>
              )}
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

const OfflineAlertCardMemo = memo(OfflineAlertCard);

export default OfflineAlertCardMemo;
