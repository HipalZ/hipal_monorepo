import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import useTimings from '@/components/store/useTimings';
import type { ISalesLite } from '@/components/types/hiClientzData';
import { getDate } from '@/components/utils/helpers';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { CiGlobe } from 'react-icons/ci';
import DateRangePickerMemo from '../dateRangePicker';
import './index.css';
import { apiRpc } from '@hi/common';

const SalesLite = () => {
  const { selectedBiz } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
  }));
  const businessId = selectedBiz?.businessId?._id;
  const { salesData, setSalesData, setLoading } = useLiteStore((s) => ({
    salesData: s.salesData,
    setSalesData: s.setSalesData,
    setLoading: s.setLoading,
  }));
  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }));
  const handleSales = async () => {
    setLoading(true);
    const res = await apiRpc.payments[':id'].salesDashboard.$get({
      param: { id: businessId },
      query: {
        businessId: businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
      },
    });
    const response = (await res.json()).data as ISalesLite;
    if (res.status === 200) {
      setSalesData(response);
      setLoading(false);
      return response;
    }
    return {};
  };

  useQuery({
    queryKey: ['onlineAlerts', businessId, timeStampStart, timeStampEnd],
    queryFn: handleSales,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
  });

  return (
    <>
      <DateRangePickerMemo />
      <section className="payment_layout">
        <article className="card_payment_overview">
          <center className="absolute left-1/2 top-4 -translate-x-1/2">{getDate(timeStampStart)}</center>
          <div className="sales_payment_background_effect1" />
          <div className="sales_payment_background_effect2" />
          <div className="sales_payment_background_effect3" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mt-10 h-[50%] w-[0.125rem] bg-white"></div>
          </div>
          <section>
            <h3 className="absolute bottom-14 left-4 opacity-60">Sales</h3>
            <h1 className="absolute bottom-6 left-4 text-3xl">₹ {salesData?.totalSale}</h1>
          </section>
          <section>
            <h3 className="absolute bottom-14 right-4 opacity-60">Total Discounts</h3>
            <h1 className="absolute bottom-6 right-4 text-3xl">₹ {salesData?.totalDiscount}</h1>
          </section>
        </article>
        <section className="mx-4 flex gap-4">
          <article className="online_card1">
            <div className="sales_payment_background_effect4"></div>
            <p className="flex">
              <CiGlobe className="mr-2" />
              <small>Online</small>
            </p>
            <h1 className="mt-6 text-2xl">₹ {salesData?.totalOnlineSale}</h1>
          </article>

          <article className="online_card2">
            <div className="sales_payment_background_effect5"></div>
            <p className="flex">
              <CiGlobe className="mr-2" />
              <small>On floor</small>
            </p>
            <h1 className="mt-6 text-2xl">₹ {salesData?.totalOfflineSale}</h1>
          </article>
        </section>
      </section>
      <section className="mx-4 mt-6 flex justify-between gap-4">
        <article className="w-full rounded-xl border border-[#00000050] p-4">
          <b>Coinz issued</b>
          <h6>₹ {salesData?.coinzIssued}</h6>
        </article>
        <article className="w-full rounded-xl border border-[#00000050] p-4">
          <b>Coinz used</b>
          <h6>₹ {salesData?.coinzRedeemed}</h6>
        </article>
      </section>
    </>
  );
};

const SalesLiteMemo = memo(SalesLite);
export default SalesLiteMemo;
