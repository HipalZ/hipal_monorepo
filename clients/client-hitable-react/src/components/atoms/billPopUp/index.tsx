import { type ChangeEvent, lazy, memo, useCallback, useState } from "react";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import {
  cn,
  timestampToDateTime,
  useErrorHandling,
} from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import { FiCopy } from "react-icons/fi";
import { MdOutlineCall } from "react-icons/md";
import LoadingSpinner from "../loadingSpinner";
import toast from "react-hot-toast";
import NormalSettle from "../placeOrders/normalsettle";
const BottomPopUp = lazy(() => import("../universalPopup"));

const BillPopUpMemo = () => {
  const { errorText } = useErrorHandling();
  const { selectedNavItem, viewData, removeOfflineAlert } = useLiteStore(
    (s) => ({
      selectedNavItem: s.selectedNavItem,
      viewData: s.viewData,
      removeOfflineAlert: s.removeOfflineAlert,
    }),
  );



  const [textTick, setTextTick] = useState(false);
  const [numberTick, setNumberTick] = useState(false);
  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const captainData = useHiClientZ((s) => s.captainData);
  const [normalSettle, setNormalSettle] = useState<boolean>(false);

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
        if (value) {
          setNumberTick(true);
          setTimeout(() => {
            setNumberTick(false);
          }, 3000);
        } else {
          setTextTick(true);
          setTimeout(() => {
            setTextTick(false);
          }, 3000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }, []);

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

  const handleConfirmAlert = async (id: string, comment: string) => {
    setIsLoading(true);
    const res = await apiRpc.payments[":pid"].order[":alertId"].$put({
      param: { alertId: id },
      json: {
        comment: comment,
        waiterName: captainData?.name,
        settleModes: [],
        split: false,
      },
    });
    if (res.status === 401) {
      return errorText();
    }
    if (res.status === 200) {
      toast.success("order confirm successfully");
      setIsLoading(false);
    }
  };

  const hideMiddleNumbers = useCallback((phone: string) => {
    if (phone.length <= 2) return phone;
    const firstPart = phone.slice(0, 2);
    const lastPart = phone.slice(-1);
    return `${firstPart}****${lastPart}`;
  }, []);

  const handleAddComment = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setComment(e.target.value);
    },
    [],
  );

  const handleAccept = () => {
    setNormalSettle(true);
  };

  const closeNormalSettle = () => {
    setNormalSettle(false);
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  console.log(viewData);

  return (
    <BottomPopUp height="h-[85dvh]" status={viewData?.alertType} show={clickViewMore} onClose={handleCloseOnline}>
      {
        normalSettle ? (
          <NormalSettle closeNormalSettle={closeNormalSettle} data={{ total: Number(viewData?.order_id?.total) }} alertData={viewData} />
        ) :
          <section className='hide-scrollbar' style={{ maxHeight: "90%", overflowY: "auto" }}>
            <div className="flex justify-between mx-6 mt-10">
              <h1 className="text-gray-500">
                {timestampToDateTime(viewData?.date)}
              </h1>
              <p>{viewData?._id?.slice(-6)}</p>
            </div>
            <div className="mx-4 my-4 rounded-2xl bg-[#334C38] py-3 text-white">
              <center className="text-sm">Bill value entered</center>
              <center>₹ {viewData?.order_id?.billValue} </center>
            </div>
            {viewData?.alertType === "OFFLINE" ? (
              <div className="grid grid-cols-2 mx-6 mb-2 font-semibold">
                <h1>Staff</h1>
                <p>: {captainData?.name || "Captain"}</p>
              </div>
            ) : null}
            <div className="grid grid-cols-2 mx-6 mb-2">
              <h1>Discount Coinz used</h1>
              <p>: {viewData?.order_id?.claimedCoins}</p>
            </div>
            {/* <div className="grid grid-cols-2 mx-6 mb-2">
              <h1>Bill after discount</h1>
              <p>
                : ₹{" "}
                {viewData?.order_id?.billValue -
                  viewData?.order_id?.claimedCoins}{" "}
              </p>
            </div> */}
            <div className="grid grid-cols-2 mx-6 mb-2">
              <h1>Tips</h1>
              <p>: ₹ {viewData?.order_id?.tips} </p>
            </div>
            <div className="grid grid-cols-2 p-2 mx-4 mb-2 bg-green-100 rounded-2xl">
              <h1>Money to collect</h1>
              <p>: ₹ {viewData?.order_id?.total} </p>
            </div>
            <hr className="m-6 h-[0.1rem] bg-[#CACACA] text-black" />
            <div className="grid grid-cols-2 mx-6 mb-2">
              <h1>User</h1>
              <p>: {viewData?.userId?.name} </p>
            </div>
            <div className="grid grid-cols-2 mx-6 mb-2">
              <h1>Table</h1>
              <p>: {viewData?.order_id?.tableName} </p>
            </div>
            <div className="grid grid-cols-2 mx-6 mb-2">
              <h1>Number</h1>
              <div className="flex" id="phone">
                <span>
                  :{" "}
                  {viewData?.userId?.phone
                    ? hideMiddleNumbers(viewData.userId.phone)
                    : ""}
                </span>
                &nbsp;&nbsp;
                <div className="flex self-end mr-1">
                  <span
                    className={cn(
                      "rounded-2xl px-4 py-2",
                      numberTick
                        ? "bg-green-500/20 text-green-500"
                        : "bg-[#f3eeff] text-[#7f46ff]",
                    )}
                    onClick={() => copyText("#phone", viewData?.userId?.phone)}
                    style={{ cursor: "pointer" }}
                  >
                    <FiCopy />
                  </span>
                </div>
                <a
                  href={`tel:+91${viewData?.userId?.phone}`}
                  className="flex items-center rounded-full bg-[#f3eeff] px-2 py-1 text-[#6f2eff]"
                >
                  <MdOutlineCall size={16} />
                </a>
              </div>
            </div>
            <div className="flex flex-col p-4 m-6 bg-gray-300 rounded-2xl">
              <div id="discount-reason" className="space-y-2">
                <p className="text-sm text-gray-600">
                  User: &nbsp;
                  <span className="font-semibold">{viewData?.userId?.name} </span>
                </p>
                <p className="text-sm text-gray-600">
                  Transaction ID: {viewData?._id}{" "}
                </p>
                <p className="text-sm text-gray-600">
                  Total Bill:&nbsp;
                  <span className="font-semibold">
                    ₹ {viewData?.order_id?.billValue}{" "}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Applied Coinz:&nbsp;
                  <span className="font-semibold">
                    {viewData?.order_id?.claimedCoins}{" "}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Paid Money: &nbsp;
                  <span className="font-semibold">
                    ₹ {viewData?.order_id?.total}{" "}
                  </span>
                </p>
                <p className="mt-4 !text-base font-bold text-black">
                  Final Discount to Apply in POS:
                  <span> ₹ {viewData?.posDiscount} </span>
                </p>
              </div>
              <div className="flex self-end">
                <span
                  className={cn(
                    "rounded-2xl px-4 py-2",
                    textTick
                      ? "bg-green-500/20 text-green-500"
                      : "bg-[#f3eeff] text-[#7f46ff]",
                  )}
                  onClick={() => copyText("#discount-reason")}
                  style={{ cursor: "pointer" }}
                >
                  {textTick ? "Copied" : "Copy"}
                </span>
              </div>
            </div>
            {viewData?.alertType === "OFFLINE" ? (
              <label className="mx-6">Add Comment (optional)</label>
            ) : null}
            {viewData?.alertType === "OFFLINE" ? (
              <div className="mx-6 mt-4 mb-20">
                <textarea
                  onChange={handleAddComment}
                  id="floating_outlined3"
                  className="block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-black focus:border-primary peer rounded-xl focus:outline-none dark:border-gray-600 dark:text-white"
                  placeholder="Enter Comment here..."
                  required
                  style={{
                    resize: "none",
                  }}
                />
              </div>
            ) : null}
            {viewData?.alertType !== "OFFLINE" || selectedNavItem === "history" ? (
              <div className="flex justify-center mb-5">
                <button
                  type="button"
                  onClick={handleCloseOnline}
                  className="on_active_bounce fixed bottom-4 z-50 w-[20.5rem] rounded-full bg-black py-[0.75rem] text-[18px] leading-[1.15rem] text-white"
                >
                  Close alert
                </button>
              </div>
            ) : (
              <div className="bg-white shadow-base-100 fixed bottom-0 z-20 w-[100%] max-w-[48rem] rotate-180 py-2 shadow-lg">
                <div className="flex justify-between gap-4 rotate-180">
                  <button
                    type="button"
                    onClick={() => handleCloseAlert(viewData?._id)}
                    className={
                      "btn btn-outline btn-black btn-md my-auto ml-4 min-h-[3rem] w-[100%] max-w-[10rem] rounded-full bg-black !py-1 text-[1rem] font-semibold capitalize text-white shadow-lg"
                    }
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleAccept}
                    className={
                      "btn btn-black btn-md my-auto mr-4 min-h-[3rem] w-[100%] max-w-[10rem] rounded-full bg-black !py-1 text-[1rem] capitalize text-white shadow-lg"
                    }
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </section>
      }
    </BottomPopUp>
  );
};

const BillPopUp = memo(BillPopUpMemo);
export default BillPopUp;
