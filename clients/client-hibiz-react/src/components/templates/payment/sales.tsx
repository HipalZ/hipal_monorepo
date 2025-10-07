import PopUp from "@/components/atom/popUp";
import useTimings from "@/components/store/useTimings";
import { memo, useCallback, useMemo, useState } from "react";
import PaymentModal from "./paymentModal";
import { CiFilter } from "react-icons/ci";
import { RxCrossCircled } from "react-icons/rx";
import type { IExistingPayments } from "@/components/types/businessData";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import Pagination from "@/components/atom/pagination";
import usePaginationStore from "@/components/store/usePaginationStore";
import NoData from "@/assets/nodata.jpg";
import { Button } from "@/components/ui/button";
import { TableView } from "./TableView";
import { Download, LayoutGrid, Table } from "lucide-react";
import { useSalesStore } from "@/components/store/useSalesStore";
import SalesFilters from "./SalesFiltes";
import SalesCards from "./SalesCards";
import ConvertIntoCsv from "./ConvertIntoCsv";
import useBusinessData from "@/components/store/useBusinessData.ts";
import { useGetallSalesByGet } from "@/hooks/useSales.ts";

const MemoPaymentSales = () => {
  const { timeStampStart, timeStampEnd, selectedRange } = useTimings();
  const open = useSalesStore((s) => s.open);
  const setOpen = useSalesStore((s) => s.setOpen);
  const totalSales = useSalesStore((s) => s.totalSales);
  const historyData = useSalesStore((s) => s.historyData);
  const viewMode = useSalesStore((s) => s.viewMode);
  const setViewMode = useSalesStore((s) => s.setViewMode);
  const salesData = useSalesStore((s) => s.salesData);
  const setSalesData = useSalesStore((s) => s.setSalesData);
  const openFilterModal = useSalesStore((s) => s.openFilterModal);
  const setOpenFilterModal = useSalesStore((s) => s.setOpenFilterModal);
  const selectedFilters = useSalesStore((s) => s.selectedFilters);
  const setSelectedFilters = useSalesStore((s) => s.setSelectedFilters);
  const downloadCsv = useSalesStore((s) => s.downloadCsv);
  const setDownloadCsv = useSalesStore((s) => s.setDownloadCsv);
  const [currentSalesIndex, setCurrentSalesIndex] = useState(0);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  const pageNumber = usePaginationStore((s) => s.pageNumber);
  const setHistoryData = useSalesStore((s) => s.setHistoryData);
  const setTotalSales = useSalesStore((s) => s.setTotalSales);
  console.log("selectedFilters", selectedFilters);

  const { isLoading, data } = useGetallSalesByGet({
    businessId: businessId || "",
    pageNumber: pageNumber.toString(),
    from: timeStampStart.toString(),
    to: timeStampEnd.toString(),
    appliedFilters: selectedFilters,
    outletType: outletType || "",
  });

  useMemo(() => {
    if (!data) return;
    setHistoryData(data.existingPayments);
    setTotalSales(data.totalSale);
  }, [data, setHistoryData, setTotalSales]);

  const closeModel = useCallback(() => {
    setOpen(false);
  }, []);

  const openModel = useCallback(
    (data: IExistingPayments) => {
      setOpen(true);
      setSalesData(data);
      const index = historyData.findIndex((item) => item._id === data._id);
      setCurrentSalesIndex(index >= 0 ? index : 0);
    },
    [historyData],
  );

  const handleNavigate = useCallback(
    (newIndex: number) => {
      setCurrentSalesIndex(newIndex);
      setSalesData(historyData[newIndex]);
    },
    [historyData],
  );

  const removeSingleFilter = useCallback(
    (key: string, value: string) => {
      setSelectedFilters(
        selectedFilters
          .map((filter) => {
            if (filter.key === key) {
              return {
                ...filter,
                value: filter.value.filter((v) => v !== value),
              };
            }
            return filter;
          })
          .filter((filter) => filter.value.length > 0),
      );
    },
    [selectedFilters],
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
              <span className="opacity-50">
                Last {historyData?.length} transactions
              </span>{" "}
              recently
            </p>
          </article>
          <section className="flex gap-2 w-full max-w-[30rem] px-4 md:max-w-full overflow-x-auto">
            <Button
              variant={viewMode === "grid" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="shrink-0"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              className="shrink-0"
            >
              <Table className="w-4 h-4 " />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={() => setDownloadCsv(true)}
              className="px-4 shrink-2 w-[5rem] bg-blue-500"
            >
              <Download />
              Sales
            </Button>
            <Button variant="outline" onClick={() => setOpenFilterModal(true)}>
              <CiFilter className="mr-2" /> Filters
            </Button>
            {selectedFilters && selectedFilters.length > 0 && (
              <>
                {selectedFilters.map((filter) => (
                  <div
                    key={filter.key}
                    className="flex items-center space-x-2 flex-nowrap"
                  >
                    {filter?.value?.map((value) => (
                      <Button
                        onClick={() => removeSingleFilter(filter.key, value)}
                        key={value}
                        className="capitalize whitespace-nowrap"
                      >
                        {value}
                        <RxCrossCircled className="ml-2" />
                      </Button>
                    ))}
                  </div>
                ))}
              </>
            )}
          </section>
          <section className="pb-[5rem] mx-4 mt-4">
            {historyData.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {historyData.map((data) => (
                    <SalesCards
                      key={data?._id}
                      data={data}
                      openModel={openModel}
                    />
                  ))}
                </div>
              ) : (
                <TableView data={historyData} onRowClick={openModel} />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] mt-8">
                <img
                  src={NoData || "/placeholder.svg"}
                  alt="No Data Found"
                  className="w-1/2 h-auto max-w-xs"
                />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  No Data Found
                </p>
              </div>
            )}
          </section>
        </>
      )}
      <Pagination dataLength={historyData?.length || 1} />
      {open && (
        <PopUp
          height="h-[100dvh] lg:h-[80dvh]"
          hide
          width="w-[30rem]"
          onClose={closeModel}
          show={open}
        >
          <PaymentModal
            salesData={salesData}
            onClose={closeModel}
            allSalesData={historyData}
            currentIndex={currentSalesIndex}
            onNavigate={handleNavigate}
          />
        </PopUp>
      )}
      {openFilterModal && (
        <PopUp
          height="h-[100dvh] md:h-[75dvh]"
          width="w-[42rem]"
          onClose={() => setOpenFilterModal(false)}
          show={openFilterModal}
          rightTopBack
          hide
        >
          <SalesFilters />
        </PopUp>
      )}
      {downloadCsv && (
        <PopUp
          height="h-[40rem] lg:h-[35rem]"
          width="w-[30rem] lg:w-[40rem]"
          onClose={() => setDownloadCsv(false)}
          show={downloadCsv}
          rightTopBack
          hide
        >
          <ConvertIntoCsv />
        </PopUp>
      )}
    </main>
  );
};

const PaymentSales = memo(MemoPaymentSales);
export default PaymentSales;
