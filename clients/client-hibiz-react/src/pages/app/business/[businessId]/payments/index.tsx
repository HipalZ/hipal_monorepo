import LoadingSpinner from '@/components/atom/loadingSpinner';
import useBusinessData from '@/components/store/useBusinessData';
import PaymentNavbar from '@/components/templates/menu/sideNavbaar/paymentNavBar';
import Npc from '@/components/templates/payment/Npc';
import Modes from '@/components/templates/payment/modes';
import { cn } from '@/components/utils/helper';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, memo, Suspense, useCallback, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DateRangePicker = lazy(() => import('@/components/molecules/dateRangePicker'));
const MemoizedHeader = lazy(() => import('@/components/molecules/header'));
const Overview = lazy(() => import('@/components/templates/payment/overview'));
const PaymentSales = lazy(() => import('@/components/templates/payment/sales'));
const Dues = lazy(() => import('@/components/templates/payment/dues'));
const UnifiedSales = lazy(() => import('@/components/templates/payment/UnifiedSales'));

enum PaymentTabs {
  Overview = 'Overview',
  UnifiedSales = 'Unified Sales',
  Sales = 'Sales',
  Dues = 'Dues',
  Npc = 'Npc',
  Modes = 'Modes',
}

const Payments = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<PaymentTabs>(PaymentTabs.Overview);
  const businessData = useBusinessData((s) => s.businessData);

  const sidebarItems = [
    { text: PaymentTabs.Overview, onClick: () => setSelectedTab(PaymentTabs.Overview) },
    { text: PaymentTabs.UnifiedSales, onClick: () => setSelectedTab(PaymentTabs.UnifiedSales) },
    { text: PaymentTabs.Sales, onClick: () => setSelectedTab(PaymentTabs.Sales) },
    { text: PaymentTabs.Dues, onClick: () => setSelectedTab(PaymentTabs.Dues) },
    { text: PaymentTabs.Npc, onClick: () => setSelectedTab(PaymentTabs.Npc) },
    { text: PaymentTabs.Modes, onClick: () => setSelectedTab(PaymentTabs.Modes) },
  ];

  const handleBack = useCallback(() => {
    navigate(`/app/business/${businessData?._id}`);
  }, [navigate, businessData?._id]);

  return (
    <main className="relative">
      <Suspense fallback={<LoadingSpinner />}>
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn('sticky top-0 z-50 w-full bg-[#f4f4f4]')}
        >
          <MemoizedHeader title="Payments" leftIcon={<FaArrowLeft />} onBack={handleBack} />
        </motion.section>

        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mobile-only sticky top-[4rem] z-50 flex w-full justify-between space-x-4 bg-white px-4 text-sm"
        >
          {sidebarItems.map((item) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'bg-white pb-3 pt-4',
                selectedTab?.toLowerCase() === item.text.toLowerCase() ? 'border-b-2 border-[#15BBB3] text-[#15BBB3] transition-all' : '',
              )}
              key={item.text}
              type="button"
              onClick={item.onClick}
            >
              {item.text}
            </motion.button>
          ))}
        </motion.nav>

        <PaymentNavbar items={sidebarItems} selectedNavItem={selectedTab} />

        {selectedTab === PaymentTabs.Overview || selectedTab === PaymentTabs.Sales || selectedTab === PaymentTabs.UnifiedSales ? (
          <DateRangePicker />
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedTab === PaymentTabs.Overview && <Overview />}
            {selectedTab === PaymentTabs.Sales && <PaymentSales />}
            {selectedTab === PaymentTabs.Dues && <Dues />}
            {selectedTab === PaymentTabs.Npc && <Npc />}
            {selectedTab === PaymentTabs.Modes && <Modes />}
            {selectedTab === PaymentTabs.UnifiedSales && <UnifiedSales />}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </main>
  );
};

const MemoPayments = memo(Payments);
export default MemoPayments;
