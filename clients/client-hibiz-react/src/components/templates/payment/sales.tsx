import NoData from '@/assets/nodata.jpg';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import Pagination from '@/components/atom/pagination';
import PopUp from '@/components/atom/popUp';
import usePaginationStore from '@/components/store/usePaginationStore';
import { useSalesStore } from '@/components/store/useSalesStore';
import useTimings from '@/components/store/useTimings';
import type { IExistingPayments } from '@/components/types/businessData';
import { Button } from '@/components/ui/button';
import { useGetallSalesByGet } from '@/hooks/useSales';
import { Download, LayoutGrid, Table } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { CiFilter } from 'react-icons/ci';
import { RxCrossCircled } from 'react-icons/rx';
import { useParams } from 'react-router-dom';
import ConvertIntoCsv from './ConvertIntoCsv';
import PaymentModal from './paymentModal';
import SalesCards from './SalesCards';
import SalesFilters from './SalesFiltes';
import { TableView } from './TableView';

const MemoPaymentSales = () => {
  const params = useParams();
  const { timeStampStart, timeStampEnd, selectedRange } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
    selectedRange: s.selectedRange,
  }));
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
    setDownloadCsv,
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
    setDownloadCsv: s.setDownloadCsv,
  }));
  const businessId = params?.businessId;
  const [currentSalesIndex, setCurrentSalesIndex] = useState(0);

  const { pageNumber } = usePaginationStore((s) => ({
    pageNumber: s.pageNumber,
  }));

  const { isLoading } = useGetallSalesByGet({
    businessId: businessId || '',
    pageNumber: pageNumber.toString(),
    from: timeStampStart.toString(),
    to: timeStampEnd.toString(),
    appliedFilters: selectedFilters,
  });

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

  console.log('Payment Sales', historyData, totalSales, selectedFilters);

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
            <div className="absolute left-6 top-6 capitalize opacity-50">{selectedRange} Sales</div>
            <h1 className="absolute left-6 top-12 text-3xl">₹ {totalSales?.toLocaleString('en-IN')}</h1>
            <p className="absolute bottom-6 left-6">
              <span className="opacity-50">Last Synced</span> recently
            </p>
          </article>
          <section className="flex w-full max-w-[30rem] gap-2 overflow-x-auto px-4 md:max-w-full">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'outline'} size="icon" onClick={() => setViewMode('grid')} className="shrink-0">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'table' ? 'secondary' : 'outline'} size="icon" onClick={() => setViewMode('table')} className="shrink-0">
              <Table className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDownloadCsv(true)} className="shrink-2 w-[5rem] px-4">
              <Download />
              Sales
            </Button>
            <Button variant="outline" onClick={() => setOpenFilterModal(true)}>
              <CiFilter className="mr-2" /> Filters
            </Button>
            {selectedFilters && selectedFilters.length > 0 && (
              <>
                {selectedFilters.map((filter) => (
                  <div key={filter.key} className="flex flex-nowrap items-center space-x-2">
                    {filter?.value?.map((value) => (
                      <Button onClick={() => removeSingleFilter(filter.key, value)} key={value} className="whitespace-nowrap capitalize">
                        {value}
                        <RxCrossCircled className="ml-2" />
                      </Button>
                    ))}
                  </div>
                ))}
              </>
            )}
          </section>
          <section className="mx-4 mt-4 pb-[5rem]">
            {historyData.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {historyData.map((data) => (
                    <SalesCards key={data?._id} data={data} openModel={openModel} />
                  ))}
                </div>
              ) : (
                <TableView data={historyData} onRowClick={openModel} />
              )
            ) : (
              <div className="mt-8 flex h-[50vh] flex-col items-center justify-center">
                <img src={NoData || '/placeholder.svg'} alt="No Data Found" className="h-auto w-1/2 max-w-xs" />
                <p className="text-muted-foreground mt-4 text-lg font-medium">No Data Found</p>
              </div>
            )}
          </section>
        </>
      )}
      <Pagination dataLength={historyData?.length || 1} />
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
        <PopUp height="h-[100dvh] md:h-[75dvh]" width="w-[42rem]" onClose={() => setOpenFilterModal(false)} show={openFilterModal} rightTopBack hide>
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
