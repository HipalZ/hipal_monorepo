import LoadingSpinner from '@/components/atom/loadingSpinner';
import HotelActions from '@/components/hotel/Actions';
import MemoizedHeader from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import UniversalNav from '@/components/templates/menu/sideNavbaar/universelSidenav';
import { cn } from '@hi/common';
import { lazy, memo, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import PaymentCards from "@/components/hotel/payments";
import { HotelInfoTabs, useHotelInfoTabs } from '@/components/store/hotel/useHotelDashboardPage.ts';

const AnalyticsCards = lazy(() => import('@/components/hotel/Analytics'));
const HotelCards = lazy(() => import('@/components/hotel/HotelCards'));
const Integrations = lazy(() => import('@/components/hotel/Integrations'));

const navItems = [
  { text: HotelInfoTabs.Essentials },
  { text: HotelInfoTabs.Actions },
  { text: HotelInfoTabs.Integrations },
  { text: HotelInfoTabs.Analytics },
  // { text: HotelInfoTabs.Payments },
];

const MemoHotelInfoMain = () => {
  const navigate = useNavigate();
  const businessData = useBusinessData((s) => s.businessData);

  // 🔒 Persisted tab state
  const selectedTab = useHotelInfoTabs((s) => s.selectedTab);
  const setSelectedTab = useHotelInfoTabs((s) => s.setSelectedTab);

  const changeLayout = (text: string) => {
    setSelectedTab(text as HotelInfoTabs);
  };

  const handleBack = useCallback(() => {
    navigate('/app/business');
  }, [navigate]);

  return (
    <main className="min-h-screen">
      <div className="sticky top-0 z-50 w-full">
        <header className="linear_gradient_background">
          <MemoizedHeader title={businessData?.name || 'Welcome'} onBack={handleBack} />
        </header>

        <nav className="hide-scrollbar mobile-only absolute flex w-full flex-nowrap space-x-4 overflow-auto text-nowrap px-4 text-sm">
          {navItems.map((item) => (
            <button
              key={item.text}
              type="button"
              onClick={() => changeLayout(item.text)}
              className={cn(
                'bg-white pb-3 pt-4 capitalize',
                selectedTab === item.text ? 'border-b-2 border-[#8162e6] text-lg font-semibold text-[#8162e6] transition-all' : '',
              )}
            >
              {item.text}
            </button>
          ))}
        </nav>
      </div>

      <UniversalNav items={navItems} selectedNavItem={selectedTab} changeNav={changeLayout} />

      <Suspense fallback={<LoadingSpinner />}>
        <section className="pb-[5rem] xl:px-0">
          {selectedTab === HotelInfoTabs.Essentials && <HotelCards />}
          {selectedTab === HotelInfoTabs.Integrations && <Integrations />}
          {selectedTab === HotelInfoTabs.Actions && <HotelActions />}
          {selectedTab === HotelInfoTabs.Analytics && <AnalyticsCards />}
          {/* {selectedTab === HotelInfoTabs.Payments && <PaymentCards />} */}
        </section>
      </Suspense>
    </main>
  );
};

const HotelInfoMain = memo(MemoHotelInfoMain);
export default HotelInfoMain;
