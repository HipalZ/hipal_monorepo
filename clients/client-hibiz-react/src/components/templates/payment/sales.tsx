import Online from '@/assets/online.png';
import axios from '@/axios';
import PopUp from '@/components/atom/popUp';
import useTimings from '@/components/store/useTimings';
import { Alert, HistoryData } from '@/components/types/businessData';
import { cn } from '@/components/utils/helper';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useMemo, useState } from 'react';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { useParams } from 'react-router-dom';
import PaymentModal from './paymentModal';
import { CiFilter } from 'react-icons/ci';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { RxCrossCircled } from 'react-icons/rx';

const MemoPaymentSales = () => {
  const [open, setOpen] = useState(false);
  const [salesData, setSalesData] = useState<HistoryData>({} as HistoryData);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const { timeStampStart, timeStampEnd, selectedRange } = useTimings();
  const params = useParams();
  const businessId = params?.businessId;
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline'>('all');

  const handleMode = useCallback((mode: 'all' | 'online' | 'offline') => {
    setFilterMode(mode);
  }, []);

  const filteredHistoryData = useMemo(() => {
    if (filterMode === 'all') {
      return historyData;
    }
    return historyData.filter(data => data.paymentMode === filterMode);
  }, [historyData, filterMode]);

  const handleClick = useCallback((newPage: number) => {
    if (newPage < 1) return;
    setPageNumber(newPage);
  }, []);

  const closeModel = useCallback(() => {
    setOpen(false);
  }, [setOpen, open]);

  const openModel = useCallback(
    (data: Alert) => {
      setOpen(true);
      setSalesData(data);
    },
    [setOpen, open],
  );

  // number privacy
  const hideMiddleNumbers = (phone: string) => {
    if (phone.length <= 4) return phone;
    const firstPart = phone.slice(0, 3);
    const lastPart = phone.slice(-3);
    return `${firstPart}****${lastPart}`;
  };

  const handleHistoryData = async () => {
    try {
      const config = {
        method: 'GET',
        url: `/v1/payments/:id/bills?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}&pageNumber=${pageNumber}`,
      };
      const response = await axios(config);
      setHistoryData(response.data.data.existingPayments);
      setTotalSales(response.data.data.totalSale);
      console.log(response.data.data.existingPayments);
      return response.data.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  const defaultClass = 'text-base w-10 h-10 flex justify-center items-center bg-[#dad1f8] text-black border rounded-full border-[#2B354D]';

  useQuery({
    queryKey: ['historyAlerts', businessId, timeStampStart, timeStampEnd, pageNumber],
    queryFn: handleHistoryData,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd && !!pageNumber,
  });

  return (
    <main className="relative">
      <article className="card_payment">
        <div className="sales_payment_background_effect1" />
        <div className="sales_payment_background_effect2" />
        <div className="sales_payment_background_effect3" />
        <div className="absolute left-6 top-6 opacity-50 capitalize">{selectedRange} Sales</div>
        <h1 className="absolute left-6 top-12 text-3xl">₹ {totalSales?.toLocaleString('en-IN')}</h1>
        <p className="absolute bottom-6 left-6">
          <span className="opacity-50">Last Synced</span> recently
        </p>
      </article>
      <section className="flex items-center justify-end pr-4">
        {filterMode !=='all' && <div className="flex">
          <span className={cn("text-white bg-indigo-500","px-4 py-2 my-2 rounded-md")}>{filterMode}</span>
          <RxCrossCircled onClick={() => handleMode('all')} />
        </div>}
        <Menu as="div" className="relative">
          <MenuButton className={cn(filterMode !=="all" ? "bg-black text-white":"text-black bg-white","z-1 space-x-2 flex items-center py-2 px-4 rounded-full")}>
            <span>Filters</span>
            <CiFilter className="ml-2" />
          </MenuButton>
          <MenuItems className="z-10 absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-black'} group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                    onClick={() => handleMode('all')}
                  >
                    All
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-black'} group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                    onClick={() => handleMode('offline')}
                  >
                    Offline
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-black'} group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                    onClick={() => handleMode('online')}
                  >
                    Online
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </section>
      <section className="grid pb-[5rem] md:grid-cols-2 lg:grid-cols-3">
        {filteredHistoryData && filteredHistoryData.length > 0 ? (
          filteredHistoryData.map((data) => (
            <section key={data?._id} className="payment_card_ui" onClick={() => openModel(data)}>
              <section className="flex justify-between">
                <section>
                  <figure className="flex items-center space-x-4">
                    <img src={Online} alt="online" />
                    <figcaption className="text-[0.825rem] opacity-50">
                      <h6>order id : {data?._id?.slice(-6)}</h6>
                    </figcaption>
                  </figure>
                </section>
                <section>
                  <h3 className="text-2xl text-[#23B371]">₹ {data?.order_id?.total}</h3>
                </section>
              </section>
              <section className="py-4">
                <b>{data?.order_id?.name}</b> <span className="opacity-50">{hideMiddleNumbers(data?.order_id?.phone)}</span>
                <br />
                <small>Bill value : {data?.order_id?.billValue}</small>
              </section>
              <section className="flex gap-4">
                <button
                  className={cn(
                    'flex items-center justify-center space-x-2 rounded-2xl px-2 py-1',
                    data?.mode === 'online' ? 'bg-green-200 text-green-700' : 'bg-orange-200 text-orange-500',
                  )}
                >
                  <small>{data?.mode} Payment</small>
                </button>
                <button className="flex items-center justify-center space-x-2 rounded-2xl bg-[#e7fedc] px-2 py-1 text-[#23B371]">
                  <small>{data?.order_id?.claimedCoins} Coinz used </small>
                </button>
              </section>
            </section>
          ))
        ) : (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-2xl">No Data Found</div>
        )}
      </section>
      {open && (
        <PopUp onClose={closeModel} show={true}>
          <PaymentModal salesData={salesData} />
        </PopUp>
      )}
      <div className="fixed bottom-[3rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {historyData && historyData.length >= 0 && (
          <button type="button" onClick={() => handleClick(pageNumber - 1)} className={defaultClass}>
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-black">{pageNumber}</p>
        {historyData && historyData.length > 0 && (
          <button type="button" onClick={() => handleClick(pageNumber + 1)} className={defaultClass}>
            <BiChevronsRight />
          </button>
        )}
      </div>
    </main>
  );
}

const PaymentSales = memo(MemoPaymentSales);
export default PaymentSales;