import Online from "@/assets/online.png";
import PopUp from "@/components/atom/popUp";
import useTimings from "@/components/store/useTimings";
import { cn, hideMiddleNumbers } from "@/components/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PaymentModal from "./paymentModal";
import { CiFilter } from "react-icons/ci";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { RxCrossCircled } from "react-icons/rx";
import { apiRpc } from "@hi/common";
import type {
  HistoryData,
  IExistingPayments,
} from "@/components/types/businessData";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import Pagination from "@/components/atom/pagination";
import usePaginationStore from "@/components/store/usePaginationStore";
import NoData from "@/assets/nodata.jpg";

const MemoPaymentSales = () => {
  const [open, setOpen] = useState(false);
  const [salesData, setSalesData] = useState<IExistingPayments>();
  const [totalSales, setTotalSales] = useState(0);
  const [historyData, setHistoryData] = useState<IExistingPayments[]>([]);
  const { timeStampStart, timeStampEnd, selectedRange } = useTimings();
  const params = useParams();
  const businessId = params?.businessId;
  const [filterMode, setFilterMode] = useState<"all" | "online" | "offline">(
    "all",
  );
  const { pageNumber } = usePaginationStore((s) => ({
    pageNumber: s.pageNumber,
  }));

  const handleMode = useCallback((mode: "all" | "online" | "offline") => {
    setFilterMode(mode);
  }, []);

  const filteredHistoryData = useMemo(() => {
    if (filterMode === "all") {
      return historyData;
    }
    return historyData.filter((data) => data.paymentMode === filterMode);
  }, [historyData, filterMode]);

  const closeModel = useCallback(() => {
    setOpen(false);
  }, [open]);

  const openModel = useCallback((data: IExistingPayments) => {
    setOpen(true);
    setSalesData(data);
  }, []);

  const handleBillsData = async () => {
    try {
      const response = await apiRpc.payments[":id"].bills.$get({
        query: {
          businessId: businessId,
          pageNumber: pageNumber.toString(),
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
        },
        param: { id: businessId || "" },
      });
      const data = (await response.json()).data as HistoryData;
      if (response.status === 200) {
        setHistoryData(data.existingPayments);
        setTotalSales(data.totalSale);
      }
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  const { isLoading } = useQuery({
    queryKey: [
      "historyAlerts",
      businessId,
      timeStampStart,
      timeStampEnd,
      pageNumber,
    ],
    queryFn: handleBillsData,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd && !!pageNumber,
  });

  return (
    <main className="relative h-[100dvh]">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <article className="card_payment">
            <div className="sales_payment_background_effect1" />
            <div className="sales_payment_background_effect2" />
            <div className="sales_payment_background_effect3" />
            <div className="absolute capitalize opacity-50 left-6 top-6">
              {selectedRange} Sales
            </div>
            <h1 className="absolute text-3xl left-6 top-12">
              ₹ {totalSales?.toLocaleString("en-IN")}
            </h1>
            <p className="absolute bottom-6 left-6">
              <span className="opacity-50">Last Synced</span> recently
            </p>
          </article>
          <section className="flex items-center justify-end pr-4">
            {filterMode !== "all" && (
              <div className="flex">
                <span
                  className={cn(
                    "text-white bg-indigo-500",
                    "px-4 py-2 my-2 rounded-md",
                  )}
                >
                  {filterMode}
                </span>
                <RxCrossCircled onClick={() => handleMode("all")} />
              </div>
            )}
            <Menu as="div" className="relative">
              <MenuButton
                className={cn(
                  filterMode !== "all"
                    ? "bg-black text-white"
                    : "text-black bg-white",
                  "z-1 space-x-2 flex items-center py-2 px-4 rounded-full shadow-lg on_active_bounce",
                )}
              >
                <span>Filters</span>
                <CiFilter className="ml-2" />
              </MenuButton>
              <MenuItems className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        className={`${focus ? "bg-gray-100 text-gray-900" : "text-black"
                          } group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                        onClick={() => handleMode("all")}
                      >
                        All
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        className={`${focus ? "bg-gray-100 text-gray-900" : "text-black"
                          } group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                        onClick={() => handleMode("offline")}
                      >
                        Offline
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        className={`${focus ? "bg-gray-100 text-gray-900" : "text-black"
                          } group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                        onClick={() => handleMode("online")}
                      >
                        Online
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </section>
          <section className="pb-[5rem] mx-4 mt-4">
            {filteredHistoryData && filteredHistoryData.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredHistoryData.map((data) => (
                  <section
                    key={data?._id}
                    className="payment_card_ui w-[100%]"
                    onClick={() => openModel(data)}
                    onKeyDown={() => openModel(data)}
                  >
                    <section className="flex justify-between">
                      <section>
                        <figure className="flex items-center space-x-2">
                          <img src={Online} alt="online" />
                          <figcaption className="font-semibold opacity-50">
                            <h6>order id : {data?._id?.slice(-6)}</h6>
                          </figcaption>
                        </figure>
                      </section>
                      <section>
                        <h3 className="text-2xl text-[#23B371]">
                          ₹ {data?.order_id?.total}
                        </h3>
                      </section>
                    </section>
                    <section className="py-4">
                      <section className='flex items-center justify-between'>

                        <b>{data?.userId?.name || "Customer"}</b>{" "}
                        <h3 className="opacity-50">
                          {hideMiddleNumbers(data?.userId?.phone || "")}
                        </h3>
                      </section>
                      <b className="flex items-center justify-between">
                        <h3>
                          ₹ {data?.order_id?.billValue}
                        </h3>
                        <h3 className="text-sm">
                          {data?.settleType}
                        </h3>
                      </b>
                    </section>
                    <section className="flex gap-4">
                      <button
                        type="button"
                        className={cn(
                          "flex items-center justify-center space-x-2 rounded-2xl px-2 py-1",
                          data?.mode === "online"
                            ? "bg-green-200 text-green-700"
                            : "bg-orange-200 text-orange-500",
                        )}
                      >
                        <small>{data?.mode} Payment</small>
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center space-x-2 rounded-2xl bg-[#e7fedc] px-2 py-1 text-[#23B371]"
                      >
                        <small>
                          {data?.order_id?.claimedCoins} Coinz used{" "}
                        </small>
                      </button>
                    </section>
                  </section>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[70dvh]">
                <img
                  src={NoData}
                  alt="No Data Found"
                  className="w-1/2 h-auto"
                />
                <h3 className="text-[#6F649B] mt-4">No Data Found</h3>
              </div>
            )}
          </section>
        </>
      )}
      <Pagination />
      {open && (
        <PopUp height="h-[80dvh]" width="w-[30rem]" onClose={closeModel} show={true}>
          <section className="h-[100dvh] max-w-[30rem] overflow-y-auto hide-scrollbar">
            <PaymentModal salesData={salesData} />
          </section>
        </PopUp>
      )}
    </main>
  );
};

const PaymentSales = memo(MemoPaymentSales);
export default PaymentSales;
