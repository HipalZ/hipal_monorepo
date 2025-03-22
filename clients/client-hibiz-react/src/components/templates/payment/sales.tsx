import PopUp from "@/components/atom/popUp"
import useTimings from "@/components/store/useTimings"
import { memo, useCallback, useState } from "react"
import { useParams } from "react-router-dom"
import PaymentModal from "./paymentModal"
import { CiFilter } from "react-icons/ci"
import { RxCrossCircled } from "react-icons/rx"
import type { IExistingPayments } from "@/components/types/businessData"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import Pagination from "@/components/atom/pagination"
import usePaginationStore from "@/components/store/usePaginationStore"
import NoData from "@/assets/nodata.jpg"
import { Button } from "@/components/ui/button"
import { TableView } from "./TableView"
import { Download, LayoutGrid, Table } from "lucide-react"
import { useSalesStore } from "@/components/store/useSalesStore"
import SalesFilters from "./SalesFiltes"
import { useGetallSalesByGet } from "@/hooks/useSales"
import SalesCards from "./SalesCards"
import ConvertIntoCsv from "./ConvertIntoCsv"

const MemoPaymentSales = () => {
  const params = useParams()
  const { timeStampStart, timeStampEnd, selectedRange } = useTimings()
  const {
    open,
    setOpen,
    totalSales,
    historyData,
    viewMode,
    setViewMode,
    salesData,
    setSalesData,
    openFilterModal,
    setOpenFilterModal,
    selectedFilters,
    setSelectedFilters,
    downloadCsv,
    setDownloadCsv
  } = useSalesStore((s) => ({
    open: s.open,
    setOpen: s.setOpen,
    totalSales: s.totalSales,
    historyData: s.historyData,
    viewMode: s.viewMode,
    setViewMode: s.setViewMode,
    salesData: s.salesData,
    setSalesData: s.setSalesData,
    openFilterModal: s.openFilterModal,
    setOpenFilterModal: s.setOpenFilterModal,
    selectedFilters: s.selectedFilters,
    setSelectedFilters: s.setSelectedFilters,
    downloadCsv: s.downloadCsv,
    setDownloadCsv: s.setDownloadCsv
  }))
  const businessId = params?.businessId
  const [currentSalesIndex, setCurrentSalesIndex] = useState(0)

  const { pageNumber } = usePaginationStore((s) => ({
    pageNumber: s.pageNumber,
  }))

  const { isLoading } = useGetallSalesByGet({
    businessId: businessId || "",
    pageNumber: pageNumber.toString(),
    from: timeStampStart.toString(),
    to: timeStampEnd.toString(),
    appliedFilters: selectedFilters,
  })

  const closeModel = useCallback(() => {
    setOpen(false)
  }, [])

  const openModel = useCallback(
    (data: IExistingPayments) => {
      setOpen(true)
      setSalesData(data)
      const index = historyData.findIndex((item) => item._id === data._id)
      setCurrentSalesIndex(index >= 0 ? index : 0)
    },
    [historyData],
  )

  const handleNavigate = useCallback(
    (newIndex: number) => {
      setCurrentSalesIndex(newIndex)
      setSalesData(historyData[newIndex])
    },
    [historyData],
  )

  const removeSingleFilter = useCallback(
    (key: string, value: string) => {
      setSelectedFilters(
        selectedFilters
          .map((filter) => {
            if (filter.key === key) {
              return {
                ...filter,
                value: filter.value.filter((v) => v !== value),
              }
            }
            return filter
          })
          .filter((filter) => filter.value.length > 0),
      )
    },
    [selectedFilters],
  )

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
            <div className="absolute capitalize opacity-50 left-6 top-6">{selectedRange} Sales</div>
            <h1 className="absolute text-3xl left-6 top-12">₹ {totalSales?.toLocaleString("en-IN")}</h1>
            <p className="absolute bottom-6 left-6">
              <span className="opacity-50">Last Synced</span> recently
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
              variant="outline"
              size="icon"
              onClick={() => setDownloadCsv(true)}
              className="px-4 shrink-2 w-[5rem]"
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
                  <div key={filter.key} className="flex items-center space-x-2 flex-nowrap">
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
                    <SalesCards key={data?._id} data={data} openModel={openModel} />
                  ))}
                </div>
              ) : (
                <TableView data={historyData} onRowClick={openModel} />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] mt-8">
                <img src={NoData || "/placeholder.svg"} alt="No Data Found" className="w-1/2 h-auto max-w-xs" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">No Data Found</p>
              </div>
            )}
          </section>
        </>
      )}
      <Pagination />
      {open && (
        <PopUp height="h-[100dvh] lg:h-[80dvh]" hide width="w-[30rem]" onClose={closeModel} show={open}>
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
      {
        downloadCsv && (
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
        )
      }
    </main>
  )
}

const PaymentSales = memo(MemoPaymentSales)
export default PaymentSales

