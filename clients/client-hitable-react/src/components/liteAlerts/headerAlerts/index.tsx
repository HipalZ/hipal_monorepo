import hipalLogo from '@/assets/img/liteLoginIcon4.png';
import NavItems from '@/components/atoms/navItems';
import useBusinessData from '@/components/store/useBusinessData';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import { useZonesAndTablesStore } from '@/components/store/useZonesAndTable';
import { NavItemTypesEnum } from '@/components/types/hiClientzData';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { memo, useCallback, useMemo, useState } from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useCartsPoll, useOfflineAlerts, useOnlineAlerts } from '../../../hooks/useF&BHook';
import ProfileHeader from '../profileHeader';

const minDelay = <T,>(p: Promise<T>, ms = 2000) => Promise.all([p, new Promise((res) => setTimeout(res, ms))]).then(([result]) => result);

const HeaderAlerts = ({ hide, hideBack }: { hide?: boolean; hideBack?: boolean }) => {
  const { selectedBiz, captainData } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
    captainData: s.captainData,
  }));
  const navigate = useNavigate();
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const { setIsFilterOpen } = useZonesAndTablesStore();
  const { selectedNavItem, loading } = useLiteStore((s) => ({
    selectedNavItem: s.selectedNavItem,
    loading: s.loading,
  }));

  // hooks provide live fetching status + refetch fns
  const { isFetching: onlineFetching, isLoading: onlineLoading, refetchOnlineAlerts } = useOnlineAlerts();
  const { isFetching: offlineFetching, isLoading: offlineLoading, refetchOfflineAlerts } = useOfflineAlerts();
  const { isFetching: cartsFetching, isLoading: cartsLoading, refetchCarts } = useCartsPoll();

  // local “forced spin” for exactly 2s
  const [spinForced, setSpinForced] = useState(false);
  const isSpinning = useMemo(
    () =>
      spinForced ||
      loading ||
      (selectedNavItem === NavItemTypesEnum.ALERTS && (onlineLoading || offlineLoading || onlineFetching || offlineFetching)) ||
      (selectedNavItem === NavItemTypesEnum.CART && (cartsLoading || cartsFetching)),
    [spinForced, loading, selectedNavItem, onlineLoading, offlineLoading, onlineFetching, offlineFetching, cartsLoading, cartsFetching],
  );

  const refetchData = useCallback(async () => {
    setSpinForced(true);
    try {
      if (selectedNavItem === NavItemTypesEnum.ALERTS) {
        await minDelay(Promise.all([refetchOnlineAlerts?.() ?? Promise.resolve(), refetchOfflineAlerts?.() ?? Promise.resolve()]));
      } else if (selectedNavItem === NavItemTypesEnum.CART) {
        await minDelay(refetchCarts?.() ?? Promise.resolve());
      }
    } finally {
      setSpinForced(false);
    }
  }, [selectedNavItem, refetchOnlineAlerts, refetchOfflineAlerts, refetchCarts]);

  const sessionStart = async () => {
    const response = await apiRpc.users.set_session.$post({
      json: {
        businessId: selectedBiz.businessId._id,
        userId: captainData._id,
      },
    });
    return response;
  };

  useQuery({
    queryKey: ['session', selectedBiz.businessId._id, captainData._id],
    queryFn: sessionStart,
    enabled: !!captainData._id,
  });

  const navigateToBiz = () => {
    navigate(`/${selectedBiz.businessId._id}/navigate`);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between bg-white px-6 py-4 shadow-md md:h-20">
      <div className="flex items-center space-x-3">
        {!hideBack && outletInfo?.isPosEnabled && (
          <button onClick={navigateToBiz} type="button" className="-ml-2">
            <IoArrowBack />
          </button>
        )}

        <figure className="h-12 w-12 overflow-hidden rounded-full border border-black">
          <img className="h-full w-full object-cover" src={selectedBiz?.businessId?.logo || hipalLogo} alt="logo" />
        </figure>
        <div>
          <h6 className="text-base font-semibold">{selectedBiz?.businessId?.businessName}</h6>
        </div>
      </div>

      {!hide && (
        <section className="nav">
          <section className="flex">
            <NavItems />
          </section>
        </section>
      )}

      <div className="flex items-center space-x-3">
        {selectedNavItem === NavItemTypesEnum.ALERTS && !hide ? (
          <motion.button
            className="rounded-full bg-black p-3 text-white shadow-lg"
            whileTap={{ scale: 0.9 }}
            onClick={refetchData}
            title="Refresh carts"
          >
            <HiOutlineRefresh className={isSpinning ? 'animate-spin' : ''} size={20} />
          </motion.button>
        ) : null}

        {selectedNavItem === NavItemTypesEnum.CART && !hide ? (
          <motion.button
            className="rounded-full bg-black p-3 text-white shadow-lg"
            whileTap={{ scale: 0.9 }}
            onClick={refetchData}
            title="Refresh carts"
          >
            <HiOutlineRefresh className={isSpinning ? 'animate-spin' : ''} size={20} />
          </motion.button>
        ) : null}

        {/* <motion.button
          className="rounded-full bg-black p-3 text-white shadow-lg"
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFilterOpen(true)}
          title="Filter"
        >
          <FaFilter />
        </motion.button> */}
        <ProfileHeader />
      </div>
    </header>
  );
};

const HeaderAlertsMemo = memo(HeaderAlerts);
export default HeaderAlertsMemo;
