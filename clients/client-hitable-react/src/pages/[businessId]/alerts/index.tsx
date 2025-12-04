import SpinnerMemo from '@/components/atoms/loadingSpinner';
import useBusinessData from '@/components/store/useBusinessData';
import { useFilters } from '@/components/store/useFilters';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { useZonesAndTablesStore } from '@/components/store/useZonesAndTable';
import { NavItemTypesEnum } from '@/components/types/hiClientzData';
import { useStaffPermissions } from '@/hooks/useCheckPermission';
import { useGetAllMenuByBusinessId } from '@/hooks/useGetAllMenuByBusinessId';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Suspense, lazy, memo, useCallback, useState } from 'react';

// Lazy loaded components
const HeaderAlerts = lazy(() => import('@/components/liteAlerts/headerAlerts'));
const OnlineAlerts = lazy(() => import('@/components/liteAlerts/onlineAlerts'));
const BillPopUpMemo = lazy(() => import('@/components/atoms/billPopUp'));
const CartItems = lazy(() => import('@/components/atoms/cartItem'));
const NavItems = lazy(() => import('@/components/atoms/navItems'));
const Zones = lazy(() => import('@/components/zones'));
const BottomPopUp = lazy(() => import('@/components/atoms/universalPopup'));
const ZoneFilters = lazy(() => import('@/components/zones/zoneFilters'));
const SalesLiteMemo = lazy(() => import('@/components/atoms/salesLite'));
const HistoryMemo = lazy(() => import('@/components/liteAlerts/history'));
const CommonBottomButton = lazy(() => import('@/components/atoms/bottomButton'));
const EmptyTableList = lazy(() => import('@/components/tables'));
const CallCaptanMainComp = lazy(() => import('@/components/liteAlerts/callWaiter'));
const AlertsMemo = () => {
  const { selectedNavItem } = useLiteStore();
  const businessId = useBusinessData((s) => s?.outletInfo?.businessId);
  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setIsFilterOpen = useZonesAndTablesStore((s) => s.setIsFilterOpen);
  const isFilterOpen = useZonesAndTablesStore((s) => s.isFilterOpen);
  useGetAllMenuByBusinessId(businessId || "" , selectedNavItem === NavItemTypesEnum.TABLES);

  const captainData = useHiClientZ((s) => s.captainData);
  const { isLoading: isStaffLoading } = useStaffPermissions(captainData?._id, businessId);
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  
  const [openTable, setOpenTable] = useState<boolean>(false);
  const payFilter = useFilters((s) => s.payFilter);
  const screenSize = useScreenSize();
  
  const toggleEmptyTableModal = useCallback(() => {
    setOpenTable(!openTable);
  }, [setOpenTable, openTable]);
  
  return (
    <main className="relative min-h-screen bg-gray-100 pb-[5rem]">
      <Suspense fallback={<SpinnerMemo />}>
        <HeaderAlerts />
      </Suspense>
      <section>
        {selectedNavItem === NavItemTypesEnum.ALERTS && (
          <>
            {payFilter === 'ALL' && (
              <Suspense fallback={<SpinnerMemo />}>
                <OnlineAlerts />
                <CallCaptanMainComp />
              </Suspense>
            )}
            {payFilter === 'ONLINE' && (
              <Suspense fallback={<SpinnerMemo />}>
                <OnlineAlerts />
              </Suspense>
            )}
            {payFilter === 'CALL_CAPTAIN' && (
              <Suspense fallback={<SpinnerMemo />}>
                <CallCaptanMainComp />
              </Suspense>
            )}
          </>
        )}
        {selectedNavItem === NavItemTypesEnum.TABLES && (
          <Suspense fallback={<SpinnerMemo />}>
            <Zones />
          </Suspense>
        )}
        {selectedNavItem === NavItemTypesEnum.HISTORY && (
          <Suspense fallback={<SpinnerMemo />}>
            <HistoryMemo />
          </Suspense>
        )}
        {selectedNavItem === NavItemTypesEnum.SALES && hasPermission('sale_summary') && (
          <Suspense fallback={<SpinnerMemo />}>
            <SalesLiteMemo />
          </Suspense>
        )}

        {selectedNavItem === NavItemTypesEnum.CART && (
          <Suspense fallback={<SpinnerMemo />}>
            <CartItems />
          </Suspense>
        )}
        <Suspense fallback={<SpinnerMemo />}>{clickViewMore && <BillPopUpMemo />}</Suspense>
        {isFilterOpen && (
          <Suspense fallback={<SpinnerMemo />}>
            <BottomPopUp onClose={() => setIsFilterOpen(false)} show={isFilterOpen} height="h-[90dvh] lg:h-[90dvh]">
              <ZoneFilters />
            </BottomPopUp>
          </Suspense>
        )}
        {openTable && (
          <Suspense fallback={<SpinnerMemo />}>
            <BottomPopUp
              width="w-full max-w-[64rem]"
              height="h-[100dvh] lg:h-[90dvh]"
              onClose={toggleEmptyTableModal}
              show={openTable}
              rightTopBack
              hide
            >
              <EmptyTableList onClose={toggleEmptyTableModal} />
            </BottomPopUp>
          </Suspense>
        )}
        <div className="fixed bottom-0 flex h-[4.5rem] w-full items-center justify-around bg-white shadow-2xl lg:hidden">
          <nav className="mx-4 flex w-full rounded-full bg-gray-100 p-2">
            <Suspense fallback={<SpinnerMemo />}>
              <NavItems />
            </Suspense>
          </nav>
        </div>
        {selectedNavItem === NavItemTypesEnum.TABLES && (
          <Suspense fallback={<SpinnerMemo />}>
            <CommonBottomButton
              fixed
              backgroundColor="transperant"
              offset={screenSize === 'xs' || screenSize === 'md' ? '4.5rem' : '0rem'}
              position={screenSize === 'xs' || screenSize === 'md' ? 'right' : 'mid'}
              maxWidth="max-w-[30rem]"
              buttons={[
                {
                  text: 'Start Table',
                  onClick: toggleEmptyTableModal,
                  type: 'button',
                  className: 'px-8 w-full max-w-[28rem]',
                },
              ]}
            />
          </Suspense>
        )}
      </section>
    </main>
  );
};

const Alerts = memo(AlertsMemo);
export default Alerts;
