import  { useState, lazy, Suspense, memo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import useTimings from '@/components/store/useTimings';
import Header from '@/components/molecules/header';
import Hi from '@/assets/svg/hi.svg';
import { cn } from '@/components/utils/helper';
import './payment.css';

// Lazy load the Overview and PaymentSales components
const Overview = lazy(() => import('@/components/templates/payment/overview'));
const PaymentSales = lazy(() => import('@/components/templates/payment/sales'));

const Payments = () => {
  const { inTime, outTime, selectedRange } = useTimings();
  console.log(inTime, outTime, selectedRange);

  const [selectedTab, setSelectedTab] = useState('Overview');

  return (
    <main>
      <article className="pb-4 linear_gradient_background">
        <Header
          title="Payments"
          leftIcon={<FaArrowLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
      </article>
      <section className="flex justify-around mt-6 mb-2 text-lg">
        <button
          className={cn({
            'border-b-2 border-black scale-125': selectedTab === 'Overview',
          })}
          onClick={() => setSelectedTab('Overview')}
        >
          Overview
        </button>
        <button
          className={cn({
            'border-b-2 border-black scale-125': selectedTab === 'Sales',
          })}
          onClick={() => setSelectedTab('Sales')}
        >
          Sales
        </button>
      </section>
      <DateRangePicker />
      <Suspense fallback={<div>Loading...</div>}>
        {selectedTab === 'Overview' && <Overview />}
        {selectedTab === 'Sales' && <PaymentSales />}
      </Suspense>
    </main>
  );
};

export default memo(Payments);
