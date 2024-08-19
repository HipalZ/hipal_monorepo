import { memo, startTransition, useCallback } from "react";
import HiPeopleLogo from "@/assets/hibizNewLogo.png";
import Header from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import {
  type ILiteVersionCardButton,
  liteVersionCardButtons,
} from "@/components/types/businessId";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Stairs from "@/assets/Stairs.png";
import { cn } from "@hi/common";
import { PiSealWarningFill } from "react-icons/pi";

const Business = () => {
  const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
  const user = useOwnerLogin((s) => s.user);
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
    startTransition(() => {
      navigate("/app/business/");
    });
  }, [navigate]);

  const goToBusinessControl = useCallback(() => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/businessControl`);
    });
  }, [navigate]);

  return (
    <main className="relative">
      <section className=" linear_gradient_background">
        <Header
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          centerImage={HiPeopleLogo}
          isIconBusinessShow={user.role !== "RESTAURANT_MANAGER"}
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
          <section className="business_system_cards">
            {liteVersionCardButtons.map((item: ILiteVersionCardButton) => (
              <button
                type="button"
                onClick={() => handleClick(item?.navigateTo || "")}
                key={item.text}
                className={cn(
                  "relative overflow-hidden rounded-2xl text-left min-h-[10rem]",
                  {
                    "bg-gray-400 cursor-not-allowed":
                      item.navigateTo !== "businessControl" &&
                      !businessData?.themeApplied,
                  },
                )}
                disabled={
                  item.navigateTo !== "businessControl" &&
                  !businessData?.themeApplied
                }
              >
                <figure>
                  <img
                    width={200}
                    height={200}
                    src={item.image}
                    alt={item.text}
                    className={cn({
                      "opacity-50":
                        item.navigateTo !== "businessControl" &&
                        !businessData?.themeApplied,
                    })}
                  />
                </figure>
                <figcaption className="absolute bottom-0 left-0 p-2 w-full max-w-[12.5rem] bg-[#F6E9E2] h-[45%]">
                  <section className="flex items-center justify-between">
                    <h4
                      className={cn("font-semibold leading-6", {
                        "text-gray-500":
                          item.navigateTo !== "businessControl" &&
                          !businessData?.themeApplied,
                        "text-black":
                          businessData?.themeApplied ||
                          item.navigateTo === "businessControl",
                      })}
                    >
                      {item.text}
                    </h4>
                    <FaArrowRight
                      className={cn("-rotate-45", {
                        "text-gray-500":
                          item.navigateTo !== "businessControl" &&
                          !businessData?.themeApplied,
                        "text-black":
                          businessData?.themeApplied ||
                          item.navigateTo === "businessControl",
                      })}
                    />
                  </section>
                  <h4
                    className={cn("opacity-50 mt-1 text-xs", {
                      "text-gray-500":
                        item.navigateTo !== "businessControl" &&
                        !businessData?.themeApplied,
                      "text-black":
                        businessData?.themeApplied ||
                        item.navigateTo === "businessControl",
                    })}
                  >
                    {!businessData?.themeApplied
                      ? "Activate after Themes"
                      : item.description}
                  </h4>
                </figcaption>
              </button>
            ))}
          </section>
        </>
      )}
    </main>
  );
};

const MemoBusiness = memo(Business);

export default MemoBusiness;
