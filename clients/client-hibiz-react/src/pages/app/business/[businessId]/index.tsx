import { memo, startTransition, useCallback, useState } from "react";
import HiPeopleLogo from "@/assets/hibizNewLogo.png";
import Header from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { motion } from "framer-motion";
import { liteVersionCardButtons } from "@/components/types/businessId";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Stairs from "@/assets/Stairs.png";
import { cn } from "@hi/common";
import { PiSealWarningFill } from "react-icons/pi";

const Business = () => {
  const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const businessData = useBusinessData((s) => s.businessData);

  const handleClick = useCallback(
    (text: string) => {
      setSelectedIcon(text);
      const urlFriendlyText = text?.toLowerCase().replace(/ /g, "");
      startTransition(() => {
        navigate(`/app/business/${businessId}/${urlFriendlyText}`, {
          replace: true,
        });
      });
    },
    [businessId],
  );

  const handleBack = useCallback(() => {
    navigate("/app/business/");
  }, [navigate]);

  const goToBusinessControl = useCallback(() => {
    navigate(`/app/business/${businessId}/businessControl`);
  }, [navigate]);

  return (
    <main className="relative">
      <section className=" linear_gradient_background">
        <Header
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          centerImage={HiPeopleLogo}
        />
        <center className="pb-4 -mt-8 space-y-2">
          {businessData?.logo && (
            <figure className="w-[4rem] h-[4rem] mt-[5vh] overflow-hidden rounded-full">
              <img
                width={64}
                height={64}
                src={businessData?.logo}
                alt="Business_Logo"
              />
            </figure>
          )}
          <figcaption className="mt-4 text-xl font-bold capitalize">
            {businessData?.name}
          </figcaption>
        </center>
      </section>
      <section className="mx-4">
        {!businessData?.withPopCorn && (
          <button
            type="button"
            onClick={goToBusinessControl}
            className="shadow-xl business_Control"
          >
            <article className="text-left business_Control_article">
              <h3 className="text-lg font-semibold">Business Control</h3>
              <p>All Controls in one panel</p>
              <button
                type="button"
                className="relative px-6 py-2 mt-4 overflow-hidden text-white bg-black rounded-3xl"
              >
                Settings
                <div className="shine" />
              </button>
            </article>
            <figure className="business_Control_figure">
              <img className="stair_img" src={Stairs} alt="Stairs" />
            </figure>
          </button>
        )}
      </section>
      {!businessData?.withPopCorn && (
        <>
          <h6 className="px-4 mt-4 text-2xl">Shortcuts</h6>
          {!businessData?.themeApplied && (
            <center className="px-4 py-2 mt-2 text-sm font-semibold text-[#da0606] bg-[#da060630] flex items-center justify-center">
              <PiSealWarningFill size={32} className="mr-2" />
              Unlock all services after setting the Theme
            </center>
          )}
          <section className="grid grid-cols-2 gap-2 p-2 mx-auto sm:p-4 md:p-6 sm:gap-4 md:gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl">
            {liteVersionCardButtons.map((item, index) => {
              const isDisabled =
                item.navigateTo !== "businessControl" &&
                !businessData?.themeApplied;

              return (
                <motion.button
                  type="button"
                  onClick={() => handleClick(item.navigateTo || "")}
                  key={item.text}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl text-left aspect-square w-full",
                    "transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    {
                      "bg-gray-400 cursor-not-allowed opacity-70": isDisabled,
                    },
                  )}
                  disabled={isDisabled}
                  whileHover={{ y: -8 }}
                  aria-label={`${item.text} - ${
                    isDisabled ? "Activate after Themes" : item.description
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FCD6CF80] via-[#F3D0F9] to-[#D9CCFF]">
                    <div className="absolute inset-0 bg-gradient-to-tl from-[#7F66FE70] via-transparent to-transparent">
                      <div className="relative w-full h-full">
                        <img
                          src={item.image}
                          alt=""
                          className="relative z-0 object-contain w-full h-full transition-transform duration-300 md:object-cover filter brightness-110 contrast-110"
                        />
                        <div className="absolute inset-0 transition-opacity duration-300" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#ffffff] to-transparent h-1/3" />
                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 text-[#000000] backdrop-blur-md bg-[#ffffff20]">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h4 className="mr-2 text-sm font-semibold leading-tight truncate sm:text-base md:text-lg">
                        {item.text}
                      </h4>
                      <FaArrowRight
                        className="text-xs transform -rotate-45 sm:text-sm"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-xs sm:text-sm opacity-90 line-clamp-2">
                      {isDisabled ? "Activate after Themes" : item.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
};

const MemoBusiness = memo(Business);

export default MemoBusiness;
