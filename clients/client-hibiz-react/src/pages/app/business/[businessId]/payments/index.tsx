import Hi from '@/assets/svg/hi.svg';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import useTimings from '@/components/store/useTimings';
import { cn } from '@/components/utils/helper';
import { lazy, memo, Suspense, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import './payment.css';

// Lazy load the Overview and PaymentSales components
const Overview = lazy(() => import('@/components/templates/payment/overview'));
const PaymentSales = lazy(() => import('@/components/templates/payment/sales'));

const Payments = memo(() => {
  const { inTime, outTime, selectedRange } = useTimings();
  console.log(inTime, outTime, selectedRange);

  const [selectedTab, setSelectedTab] = useState('Overview');

  return (
    <main>
      <article className="linear_gradient_background pb-4">
        <Header title="Payments" leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} />
      </article>
      <section className="mb-2 mt-6 flex justify-around text-lg">
        <button
          className={cn({
            'scale-125 border-b-2 border-black': selectedTab === 'Overview',
          })}
          onClick={() => setSelectedTab('Overview')}
        >
          Overview
        </button>
        <button
          className={cn({
            'scale-125 border-b-2 border-black': selectedTab === 'Sales',
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
});

export default Payments;
