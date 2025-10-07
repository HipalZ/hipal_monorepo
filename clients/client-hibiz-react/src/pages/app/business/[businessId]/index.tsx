import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {  FaArrowRight } from "react-icons/fa";
import { PiSealWarningFill } from "react-icons/pi";
import useBusinessData from "@/components/store/useBusinessData";
import {
  type DashBoardState,
  useSelectedIcon,
} from "@/components/store/useSelectedIcon";
import { getButtons } from "@/components/types/businessId";
import { cn } from "@hi/common";
import MemoizedHeader from "@/components/molecules/header";
import UniversalNav from "@/components/templates/menu/sideNavbaar/universelSidenav.tsx";

const Business = () => {
  const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
  const setSelectedDashboard = useSelectedIcon((s) => s.setSelectedDashboard);
  const selectedDashboard = useSelectedIcon((s) => s.selectedDashboard);
  const navigate = useNavigate();
  const businessData = useBusinessData((s) => s.businessData);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const outLetType = useBusinessData((s) => s?.outletInfo?.outLetType);
  const isPosEnabled = useBusinessData((s) => s?.outletInfo?.isPosEnabled);

  const handleClick = useCallback(
    (text: string) => {
      setSelectedIcon(text);
      const urlFriendlyText = text?.toLowerCase().replace(/ /g, "");
      navigate(`/app/business/${businessId}/${urlFriendlyText}`, {
        replace: true,
      });
    },
    [businessId, navigate, setSelectedIcon],
  );

  const selectIcon = useCallback(
    (text: string) => {
      const str = text as DashBoardState;
      setSelectedDashboard(str);
    },
    [setSelectedDashboard],
  );

  const handleBack = useCallback(() => {
    navigate("/app/business");
  }, [navigate]);

  const buttons = getButtons(outLetType || "MENU", isPosEnabled || false);
  const navItems = Object.keys(buttons).map((key) => ({
    text: key.replace(/_/g, " "),
  }));
  const activeKey = selectedDashboard.replace(/ /g, "_");

  return (
    <main className="min-h-screen">
      <div className="sticky top-0 z-50 w-full">
        <header className="linear_gradient_background">
          <MemoizedHeader
            title={businessData?.name}
            onBack={handleBack}
          />
        </header>
        {/* Mobile tab bar */}
        <nav className="absolute flex w-full px-4 space-x-4 overflow-auto text-sm text-nowrap flex-nowrap hide-scrollbar mobile-only">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.text}
              className={cn(
                "pb-3 pt-4 bg-white capitalize",
                selectedDashboard.toLowerCase().replace(/ /g, "_") ===
                  item.text.toLowerCase().replace(/ /g, "_")
                  ? "border-b-2 border-[#8162e6] text-[#8162e6] font-semibold"
                  : "",
              )}
              onClick={() => selectIcon(item.text)}
            >
              {item.text}
            </button>
          ))}
        </nav>
      </div>

      {/* Sidebar / desktop nav */}
      <UniversalNav
        items={navItems}
        selectedNavItem={selectedDashboard}
        changeNav={selectIcon}
      />
      {/* Services Section */}
      {!businessData?.withPopCorn && (
        <>
          {/* Theme lock warning */}
          {!businessData?.themeApplied && (
            <center className="px-4 py-2 mt-2 text-sm font-semibold text-[#da0606] bg-[#da060630] flex items-center justify-center">
              <PiSealWarningFill size={32} className="mr-2" />
              Unlock all services after setting the Theme
            </center>
          )}

          {/* Only render the selected category */}
          {buttons[activeKey] && (
            <section className="mb-6">
              <h6 className="px-4 mt-4 text-2xl capitalize">
                {activeKey.replace(/_/g, " ")}
              </h6>
              <motion.section
                className="grid grid-cols-2 gap-2 p-2 mx-auto sm:p-4 md:p-6 sm:gap-4 md:gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
              >
                {buttons[activeKey].map((item, index) => {
                  const isDisabled =
                    item.navigateTo !== "themes" && !businessData?.themeApplied;
                  return (
                    <motion.article
                      key={item.text}
                      className={cn(
                        "relative overflow-hidden rounded-2xl text-left aspect-square w-full",
                        "transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                        {
                          "bg-gray-400 cursor-not-allowed opacity-70":
                            isDisabled,
                        },
                      )}
                      onClick={() =>
                        !isDisabled && handleClick(item.navigateTo || "")
                      }
                      whileHover={{ y: -8 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      aria-label={`${item.text} - ${
                        isDisabled ? "Activate after Themes" : item.description
                      }`}
                    >
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-tl from-[#7F66FE50] via-transparent to-transparent">
                          <div className="relative w-full h-full">
                            <img
                              src={item.image}
                              alt=""
                              className="relative z-0 object-right-top object-contain w-full h-full transition-transform duration-300 filter brightness-110 saturate-[1.25] contrast-110"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#ffffff] to-transparent h-1/3" />
                      <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 text-[#000000] backdrop-blur-md bg-[#ffffff20]">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <h3 className="mr-2 text-sm font-semibold leading-tight truncate sm:text-base md:text-lg">
                            {item.text}
                          </h3>
                          <FaArrowRight
                            className="text-xs transform -rotate-45 sm:text-sm"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs sm:text-sm opacity-90 line-clamp-2">
                          {isDisabled
                            ? "Activate after Themes"
                            : item.description}
                        </p>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.section>
            </section>
          )}
        </>
      )}
    </main>
  );
};

const MemoBusiness = memo(Business);
export default MemoBusiness;
