import Online from "@/assets/online.png";
import PopUp from "@/components/atom/popUp";
import useTimings from "@/components/store/useTimings";
import { cn, hideMiddleNumbers } from "@/components/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PaymentModal from "./paymentModal";
import { CiFilter } from "react-icons/ci";
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
import { Button } from "@/components/ui/button";
import { TableView } from "./TableView";
import { LayoutGrid, Table } from "lucide-react";

const MemoPaymentSales = () => {
  const [open, setOpen] = useState(false);
  const [salesData, setSalesData] = useState<IExistingPayments>();
  const [totalSales, setTotalSales] = useState(0);
  const [historyData, setHistoryData] = useState<IExistingPayments[]>([]);
  const { timeStampStart, timeStampEnd, selectedRange } = useTimings();
  const params = useParams();
  const businessId = params?.businessId;

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

    // Using arrays to allow multiple selections. Empty array means "all".
    const [selectedPaymentModes, setSelectedPaymentModes] = useState<string[]>([]);
    const [selectedDiscountTypes, setSelectedDiscountTypes] = useState<string[]>([]);
    const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]);
  
  const [openFilterModal, setOpenFilterModal] = useState(false);

  const { pageNumber } = usePaginationStore((s) => ({
    pageNumber: s.pageNumber,
  }));



  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const closeModel = useCallback(() => {
    setOpen(false);
  }, []);

  const openModel = useCallback((data: IExistingPayments) => {
    setOpen(true);
    setSalesData(data);
  }, []);

  const appliedFilters = useMemo(() => {
    const filters: { key: string; value: string[] }[] = [];
    if (selectedPaymentModes.length > 0) {
      filters.push({ key: "mode", value: selectedPaymentModes });
    }
    if (selectedDiscountTypes.length > 0) {
      filters.push({ key: "type", value: selectedDiscountTypes });
    }
    if (selectedWarnings.length > 0) {
      filters.push({ key: "warnings", value: selectedWarnings });
    }
    return filters;
  }, [selectedPaymentModes, selectedDiscountTypes, selectedWarnings]);

  const handleApplyFilters = () => {
    setOpenFilterModal(false);
  };

  const handleBillsData = async () => {
    try {
      const response = await apiRpc.payments[":id"].bills.$get({
        query: {
          businessId,
          pageNumber: pageNumber.toString(),
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
          appliedFilter: JSON.stringify(appliedFilters),
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
      selectedPaymentModes,
      selectedDiscountTypes,
      selectedWarnings,
    ],
    queryFn: handleBillsData,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd && !!pageNumber,
  });

  const FilterModalContent = () => (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Payment Mode</h2>
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedPaymentModes.includes("online")}
              onChange={() =>
                toggleSelection("online", selectedPaymentModes, setSelectedPaymentModes)
              }
            />
            <span>Online</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedPaymentModes.includes("offline")}
              onChange={() =>
                toggleSelection("offline", selectedPaymentModes, setSelectedPaymentModes)
              }
            />
            <span>Offline</span>
          </label>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Discount Type</h2>
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedDiscountTypes.includes("Coinz")}
              onChange={() =>
                toggleSelection("Coinz", selectedDiscountTypes, setSelectedDiscountTypes)
              }
            />
            <span>Coinz</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedDiscountTypes.includes("Couponz")}
              onChange={() =>
                toggleSelection("Couponz", selectedDiscountTypes, setSelectedDiscountTypes)
              }
            />
            <span>Couponz</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedDiscountTypes.includes("No Rewardz")}
              onChange={() =>
                toggleSelection("No Rewardz", selectedDiscountTypes, setSelectedDiscountTypes)
              }
            />
            <span>No Rewardz</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedDiscountTypes.includes("Disscount")}
              onChange={() =>
                toggleSelection("Disscount", selectedDiscountTypes, setSelectedDiscountTypes)
              }
            />
            <span>Disscount</span>
          </label>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Warnings</h2>
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedWarnings.includes("Force Settle")}
              onChange={() =>
                toggleSelection("Force Settle", selectedWarnings, setSelectedWarnings)
              }
            />
            <span>Force Settle</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedWarnings.includes("Free Tables")}
              onChange={() =>
                toggleSelection("Free Tables", selectedWarnings, setSelectedWarnings)
              }
            />
            <span>Free Tables</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  );


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
          {/* Display current filter selections with an option to remove */}
          <section className="flex items-center justify-end pr-4 space-x-2">

            {
              appliedFilters && appliedFilters.length > 0 && (
                <div className="flex items-center space-x-2">
                  {appliedFilters.map((filter) => (
                    <div key={filter.key} className="flex items-center space-x-2">
                      <Button
                        onClick={() => {
                          if (filter.key === "mode") {
                            setSelectedPaymentModes([]);
                          } else if (filter.key === "type") {
                            setSelectedDiscountTypes([]);
                          } else if (filter.key === "warnings") {
                            setSelectedWarnings([]);
                          }
                        }}
                        >
                        <span>{filter.key}</span>
                        <RxCrossCircled />
                      </Button>
                    </div>
                  ))}
                </div>
              )
            }
{/*            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <Table className="w-4 h-4" />
              </Button>
            </div> */}
            <section className="flex items-center justify-end pr-4">
            <Button variant="outline" onClick={() => setOpenFilterModal(true)}>
              <CiFilter/> Filters
            </Button>
          </section>
          </section>
          <section className="pb-[5rem] mx-4 mt-4">
            {historyData.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {historyData.map((data) => (
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
                        <section className="flex items-center justify-between">
                          <b>{data?.userId?.name || "Customer"}</b>{" "}
                          <h3 className="opacity-50">
                            {hideMiddleNumbers(data?.userId?.phone || "")}
                          </h3>
                        </section>
                        <b className="flex items-center justify-between">
                          <h3>₹ {data?.order_id?.billValue}</h3>
                          <h3 className="text-sm">{data?.settleType}</h3>
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
                            {data?.order_id?.claimedCoins} Coinz used
                          </small>
                        </button>
                      </section>
                    </section>
                  ))}
                </div>
              ) : (
                <TableView data={historyData} onRowClick={openModel} />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] mt-8">
                <img src={NoData} alt="No Data Found" className="w-1/2 h-auto max-w-xs" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  No Data Found
                </p>
              </div>
            )}
          </section>
        </>
      )}
      <Pagination />
      {open && (
        <PopUp height="h-[80dvh]" width="w-[30rem]" onClose={closeModel} show={open}>
          <section className="h-[100dvh] max-w-[30rem] overflow-y-auto hide-scrollbar">
            <PaymentModal salesData={salesData} />
          </section>
        </PopUp>
      )}
       {openFilterModal && (
        <PopUp
          height="h-[80dvh]"
          width="w-[30rem]"
          onClose={() => setOpenFilterModal(false)}
          show={openFilterModal}
        >
          <FilterModalContent />
        </PopUp>
      )}
    </main>
  );
};

const PaymentSales = memo(MemoPaymentSales);
export default PaymentSales;
