import NoData from '@/assets/nodata.jpg';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import Pagination from '@/components/atom/pagination';
import PopUp from '@/components/atom/popUp';
import useBusinessData from '@/components/store/useBusinessData.ts';
import usePaginationStore from '@/components/store/usePaginationStore';
import { useSalesStore } from '@/components/store/useSalesStore';
import useTimings from '@/components/store/useTimings';
import ConvertIntoCsv from '@/components/templates/payment/ConvertIntoCsv';
import MemoizedPaymentModal from '@/components/templates/payment/paymentModal';
import SalesCards from '@/components/templates/payment/SalesCards';
import SalesFilters from '@/components/templates/payment/SalesFiltes';
import { TableView } from '@/components/templates/payment/TableView';
import type { IExistingPayments } from '@/components/types/businessData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { useGetallSalesByGet } from '@/hooks/useSales';
import { apiRpc } from '@hi/common';
import { useMutation } from '@tanstack/react-query';
import { Download, LayoutGrid, RefreshCw, Search, Table } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { CiFilter } from 'react-icons/ci';
import { RxCrossCircled } from 'react-icons/rx';

const MemoPaymentSales = () => {
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);

  const open = useSalesStore((s) => s.open);
  const setOpen = useSalesStore((s) => s.setOpen);
  const historyData = useSalesStore((s) => s.historyData);
  const setHistoryData = useSalesStore((s) => s.setHistoryData);
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

  const { handleEnvelope } = useApiErrorHandler();

  // 🔍 Search modal UI state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchBillInvoice, setSearchBillInvoice] = useState('');
  const [searchUserName, setSearchUserName] = useState('');
  const [searchUserPhone, setSearchUserPhone] = useState('');
  const [searchTotal, setSearchTotal] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false); // ✅ track if search is applied

  const { isLoading, refetch } = useGetallSalesByGet({
    businessId: businessId || '',
    pageNumber: pageNumber.toString(),
    from: timeStampStart.toString(),
    to: timeStampEnd.toString(),
    appliedFilters: selectedFilters,
  });

  const closeModel = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const openModel = useCallback(
    (data: IExistingPayments) => {
      setOpen(true);
      setSalesData(data);
      const index = historyData.findIndex((item) => item._id === data._id);
      setCurrentSalesIndex(index >= 0 ? index : 0);
    },
    [historyData, setOpen, setSalesData],
  );

  const handleNavigate = useCallback(
    (newIndex: number) => {
      setCurrentSalesIndex(newIndex);
      setSalesData(historyData[newIndex]);
    },
    [historyData, setSalesData],
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
    [selectedFilters, setSelectedFilters],
  );

  const { mutate: searchBills, isPending: isSearching } = useMutation({
    mutationFn: async () => {
      if (!businessId) {
        throw new Error('Business ID missing');
      }

      const hasAnyField = searchBillInvoice.trim() || searchUserName.trim() || searchUserPhone.trim() || searchTotal.trim();

      if (!hasAnyField) {
        toast.error('Enter at least one search field');
        throw new Error('No search fields');
      }

      const payload: any = {
        businessId,
      };

      if (searchBillInvoice.trim()) {
        const num = Number(searchBillInvoice.trim());
        if (!Number.isNaN(num)) payload.billInvoice = num;
      }

      if (searchUserName.trim()) {
        payload.userName = searchUserName.trim();
      }

      if (searchUserPhone.trim()) {
        payload.userPhone = searchUserPhone.trim();
      }

      if (searchTotal.trim()) {
        const num = Number(searchTotal.trim());
        if (!Number.isNaN(num)) payload.total = num;
      }

      const response = await apiRpc.payments.filter_bills.$post({
        json: payload,
      });

      const data = await handleEnvelope(response);
      setHistoryData(data.existingPayments || []);
      setIsSearchActive(true);
      setIsSearchOpen(false);
      toast.success('Bills filtered successfully');
      return data as IExistingPayments[];
    },

    onError: (err) => {
      console.error(err);
      toast.error('Failed to search bills');
    },
  });

  const clearSearchFields = () => {
    setSearchBillInvoice('');
    setSearchUserName('');
    setSearchUserPhone('');
    setSearchTotal('');
  };

  const handleRefresh = async () => {
    clearSearchFields();
    setIsSearchActive(false);
    await refetch();
    toast.success('Listing refreshed');
  };

  return (
    <main className="relative overflow-auto">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Top controls row */}
          <section className="mt-4 flex w-full max-w-[30rem] gap-2 overflow-x-auto px-4 md:max-w-full">
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

            {/* 🔍 Search Bill button */}
            <Button variant="outline" onClick={() => setIsSearchOpen(true)} className="shrink-0">
              <Search className="h-4 w-4" />
              Bill
            </Button>

            {/* 🔄 Refresh button — only when search is active */}
            {isSearchActive && (
              <Button variant="outline" size="icon" onClick={handleRefresh} className="shrink-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}

            <Button variant="outline" onClick={() => setOpenFilterModal(true)}>
              <CiFilter className="" /> Filters
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

          {/* Grid / Table view */}
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

      {/* Payment details modal */}
      {open && (
        <PopUp height="h-[100dvh] lg:h-[80dvh]" hide width="w-full max-w-[48rem]" onClose={closeModel} show={open} rightTopBack>
          <MemoizedPaymentModal
            salesData={salesData}
            onClose={closeModel}
            allSalesData={historyData}
            currentIndex={currentSalesIndex}
            onNavigate={handleNavigate}
          />
        </PopUp>
      )}

      {/* Filters modal */}
      {openFilterModal && (
        <PopUp height="h-[100dvh] md:h-[75dvh]" width="w-[42rem]" onClose={() => setOpenFilterModal(false)} show={openFilterModal} rightTopBack hide>
          <SalesFilters />
        </PopUp>
      )}

      {/* CSV Download modal */}
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

      {/* 🔍 Search Bill modal */}
      {isSearchOpen && (
        <PopUp
          height="h-[100dvh] md:h-[60dvh]"
          width="w-[28rem] md:w-[32rem]"
          onClose={() => setIsSearchOpen(false)}
          show={isSearchOpen}
          rightTopBack
          hide
        >
          <section className="space-y-5 p-2 md:p-4">
            <h2 className="text-lg font-semibold">Search Bill</h2>
            <p className="text-muted-foreground text-sm">Search by bill invoice number, customer name, phone number or total amount.</p>

            <div className="grid gap-4">
              <div className="space-y-1">
                <Label htmlFor="billInvoice">Bill invoice number</Label>
                <Input
                  id="billInvoice"
                  type="number"
                  value={searchBillInvoice}
                  onChange={(e) => setSearchBillInvoice(e.target.value)}
                  placeholder="e.g. 1024"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="userName">Customer name</Label>
                <Input id="userName" value={searchUserName} onChange={(e) => setSearchUserName(e.target.value)} placeholder="e.g. Akhil" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="userPhone">Customer phone</Label>
                <Input id="userPhone" value={searchUserPhone} onChange={(e) => setSearchUserPhone(e.target.value)} placeholder="e.g. 98765 43210" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="totalAmount">Total amount</Label>
                <Input id="totalAmount" type="number" value={searchTotal} onChange={(e) => setSearchTotal(e.target.value)} placeholder="e.g. 1249" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={clearSearchFields}>
                Clear
              </Button>
              <Button onClick={() => searchBills()} disabled={isSearching}>
                {isSearching ? 'Searching…' : 'Search'}
              </Button>
            </div>
          </section>
        </PopUp>
      )}
    </main>
  );
};

const PaymentSales = memo(MemoPaymentSales);
export default PaymentSales;
