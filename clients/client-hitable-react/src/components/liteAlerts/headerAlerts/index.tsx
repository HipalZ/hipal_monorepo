import { memo } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import hipalLogo from "@/assets/img/liteLoginIcon4.png";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import ProfileHeader from "../profileHeader";
import NavItems from "@/components/atoms/navItems";

const HeaderAlerts = () => {
  const { selectedBiz } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
  }));
  const {
    selectedNavItem,
    refetchOfflineAlerts,
    refetchOnlineAlerts,
    loading,
  } = useLiteStore((s) => ({
    selectedNavItem: s.selectedNavItem,
    refetchOfflineAlerts: s.refetchOfflineAlerts,
    refetchOnlineAlerts: s.refetchOnlineAlerts,
    loading: s.loading,
  }));

  const refetchData = () => {
    if (selectedNavItem === "online") {
      refetchOnlineAlerts();
    } else if (selectedNavItem === "on floor") {
      refetchOfflineAlerts();
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between w-full h-20 px-6 py-4 bg-white shadow-md">
      <div className="flex items-center space-x-3">
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
          <p
            title={selectedBiz?.businessId?.address}
            className="w-48 text-sm text-gray-600 truncate"
          >
            {selectedBiz?.businessId?.address}
          </p>
        </div>
      </div>
      <section className="nav">
        <section className="flex lg:mr-[13rem]">
          <NavItems />
        </section>
      </section>
      <div className="flex items-center space-x-3">
        {(selectedNavItem === "online" || selectedNavItem === "on floor") && (
          <HiOutlineRefresh
            onClick={refetchData}
            size={24}
            className={`cursor-pointer text-green-500 transition-transform duration-300 ${
              loading ? "animate-spin" : "hover:rotate-180"
            }`}
          />
        )}
        <ProfileHeader />
      </div>
    </header>
  );
};

const HeaderAlertsMemo = memo(HeaderAlerts);
export default HeaderAlertsMemo;
