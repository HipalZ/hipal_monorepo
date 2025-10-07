import { memo } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import hipalLogo from "@/assets/img/liteLoginIcon4.png";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import ProfileHeader from "../profileHeader";
import NavItems from "@/components/atoms/navItems";
import { motion } from "framer-motion";
import { FaFilter } from "react-icons/fa";
import { useZonesAndTablesStore } from "@/components/store/useZonesAndTable";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { NavItemTypesEnum } from "@/components/types/hiClientzData";
import { useOnlineAlertsQuery, useCartsQuery } from "@/hooks/useHiClients";

const HeaderAlerts = ({
  hide,
  hideBack,
}: { hide?: boolean; hideBack?: boolean }) => {
  const { selectedBiz, captainData } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
    captainData: s.captainData,
  }));
  const navigate = useNavigate();
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const { setIsFilterOpen } = useZonesAndTablesStore();
  const isSlow = useLiteStore((s) => s.isSlow);
  const selectedNavItem = useLiteStore((s) => s.selectedNavItem);
  const loading = useLiteStore((s) => s.loading);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);

  const { refetch: onlineRefetch } = useOnlineAlertsQuery(businessId, isSlow);
  const { refetch: cartRefetch } = useCartsQuery(businessId, isSlow);

  const refetchData = () => {
    if (selectedNavItem === NavItemTypesEnum.ALERTS) {
      onlineRefetch?.();
    }
    if (selectedNavItem === NavItemTypesEnum.CART) {
      cartRefetch?.();
    }
  };

  const sessionStart = async () => {
    const response = await apiRpc.users.set_session.$post({
      json: {
        businessId: businessId,
        userId: captainData._id,
      },
    });
    return response;
  };

  useQuery({
    queryKey: ["session", businessId, captainData._id],
    queryFn: sessionStart,
    enabled: !!captainData._id,
  });

  const navigateToBiz = () => {
    navigate(`/${businessId}/navigate`);
  };
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between w-full h-16 px-6 py-4 bg-white shadow-md md:h-20">
      <div className="flex items-center space-x-3">
        {!hideBack && outletInfo?.isPosEnabled && (
          <button onClick={navigateToBiz} type="button" className="-ml-2">
            <IoArrowBack />
          </button>
        )}

        <figure className="w-12 h-12 overflow-hidden border border-black rounded-full">
          <img
            className="object-cover w-full h-full"
            src={selectedBiz?.businessId?.logo || hipalLogo}
            alt="logo"
          />
        </figure>
        <div>
          <h6 className="text-base font-semibold">
            {selectedBiz?.businessId?.businessName}
          </h6>
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
        {(selectedNavItem === NavItemTypesEnum.ALERTS ||
          selectedNavItem === NavItemTypesEnum.CART) &&
        !hide ? (
          <HiOutlineRefresh
            onClick={refetchData}
            size={24}
            className={`cursor-pointer text-green-500 transition-transform duration-300 ${
              loading ? "animate-spin" : "hover:rotate-180"
            }`}
          />
        ) : null}
        <motion.button
          className="p-3 text-white bg-black rounded-full shadow-lg "
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFilterOpen(true)}
        >
          <FaFilter />
        </motion.button>
        <ProfileHeader />
      </div>
    </header>
  );
};

const HeaderAlertsMemo = memo(HeaderAlerts);
export default HeaderAlertsMemo;
