import NoData from '@/assets/nodata.jpg';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import Pagination from '@/components/atom/pagination';
import PopUp from '@/components/atom/popUp';
import useBusinessData from '@/components/store/useBusinessData.ts';
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
import ConvertIntoCsv from './ConvertIntoCsv';
import PaymentModal from './paymentModal';
import SalesCards from './SalesCards';
import SalesFilters from './SalesFiltes';
import { TableView } from './TableView';

const MemoPaymentSales = () => {
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const selectedRange = useTimings((s) => s.selectedRange);

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

  return (
    <main className="relative h-[100dvh] overflow-auto">
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
              <span className="opacity-50">Last {historyData?.length} transactions</span> recently
            </p>
          </article>
          <section className="flex w-full max-w-[30rem] gap-2 overflow-x-auto px-4 md:max-w-full">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'outline'} size="icon" onClick={() => setViewMode('grid')} className="shrink-0">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'table' ? 'secondary' : 'outline'} size="icon" onClick={() => setViewMode('table')} className="shrink-0">
              <Table className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" onClick={() => setDownloadCsv(true)} className="shrink-2 w-[5rem] bg-blue-500 px-4">
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
        <PopUp height="h-[100dvh] lg:h-[80dvh]" hide width="w-full max-w-[48rem]" onClose={closeModel} show={open} rightTopBack>
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
