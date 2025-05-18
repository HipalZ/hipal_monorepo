import { memo, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { PiSealWarningFill } from "react-icons/pi";
import HiPeopleLogo from "@/assets/hibizNewLogo.png";
import Header from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { getButtons } from "@/components/types/businessId";
import { cn } from "@hi/common";

const Business = () => {
  const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const businessData = useBusinessData((s) => s.businessData);
  const outLetType = useBusinessData((s) => s?.outletInfo?.outLetType);
  const isPosEnabled = useBusinessData((s) => s?.outletInfo?.isPosEnabled);
  const headerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  const isMobileMemo = useMemo(() => window.innerWidth < 600, []);

  const transformHeaderHeight = useTransform(scrollY, [0, 100], [200, 70]);
  const transformHeaderOpacity = useTransform(scrollY, [0, 50], [1, 0]);
  const transformBusinessNameScale = useTransform(scrollY, [0, 100], [1, 0.9]);

  const headerHeight = useSpring(isMobileMemo ? transformHeaderHeight : 200, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  });

  const headerOpacity = useSpring(isMobileMemo ? transformHeaderOpacity : 1, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  });

  const businessNameScale = useSpring(
    isMobileMemo ? transformBusinessNameScale : 1,
    {
      stiffness: 300,
      damping: 30,
      mass: 0.5,
    },
  );

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

  const handleBack = useCallback(() => {
    navigate("/app/business");
  }, [navigate]);

  const buttons = getButtons(outLetType || "MENU", isPosEnabled);

  return (
    <main className="relative">
      {/* Header */}
      <motion.section
        ref={headerRef}
        className="fixed top-0 z-10 w-full pb-4 linear_gradient_background"
        style={{ height: headerHeight }}
      >
        <Header
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          centerImage={HiPeopleLogo}
        />
        <motion.div
          className="flex flex-col items-center justify-center pb-4 -mt-8 space-y-2"
          style={{ opacity: headerOpacity }}
        >
          {businessData?.logo && (
            <figure className="w-24 h-24 mt-[3vh] overflow-hidden rounded-full">
              <img
                width={100}
                height={100}
                src={businessData.logo}
                alt="Business Logo"
              />
            </figure>
          )}
        </motion.div>
        <motion.h1
          className="absolute text-xl font-bold text-center capitalize left-1/2"
          style={{ top: "1.5rem", x: "-50%", scale: businessNameScale }}
        >
          {businessData?.name}
        </motion.h1>
      </motion.section>

      {/* Services Section */}
      {!businessData?.withPopCorn && (
        <>
          {!businessData?.themeApplied && (
            <center className="px-4 py-2 mt-2 text-sm font-semibold text-[#da0606] bg-[#da060630] flex items-center justify-center">
              <PiSealWarningFill size={32} className="mr-2" />
              Unlock all services after setting the Theme
            </center>
          )}

          {/* Dynamically Render Service Categories */}
          {Object.keys(buttons).map((category) => (
            <section key={category} className="mb-6">
              <h6 className="px-4 mt-4 text-2xl capitalize">
                {category.replace(/_/g, " ")}
              </h6>
              <motion.section
                className="grid grid-cols-2 gap-2 p-2 mx-auto sm:p-4 md:p-6 sm:gap-4 md:gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
              >
                {buttons[category]?.map((item, index) => {
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
          ))}
        </>
      )}
    </main>
  );
};

const MemoBusiness = memo(Business);
export default MemoBusiness;
