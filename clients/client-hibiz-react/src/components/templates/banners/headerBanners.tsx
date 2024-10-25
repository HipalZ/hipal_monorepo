import { lazy, memo } from "react";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import { FaArrowLeft } from "react-icons/fa";
import { useCardClickOperations } from "@/components/helpers/allBannersHelper";
import { ViewType } from "@/components/types/businessData";

const BannersHeader = lazy(
  () => import("@/components/templates/explorePage/bannersHeader"),
);

const MemoHeaderBannerSection = () => {
  const { isArrangeMode, view, setView } = useBannerTemp((s) => ({
    isArrangeMode: s.isArrangeMode,
    view: s.view,
    setView: s.setView,
  }));

  // filtering banners and card clicking functionalities
  const { handleNavigate } = useCardClickOperations();
  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white rounded-t-2xl boxShadowCard ${
        isArrangeMode ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <BannersHeader
        title="Banners"
        onBack={handleNavigate}
        leftIcon={<FaArrowLeft />}
        isIconBusinessShow={false}
      >
        <p className="mx-4 mb-4 ml-8 text-xs text-gray-500 md:text-base lg:text-base">
          Size matters! Express limitless with your customers about all the
          happenings at your place.
        </p>
        <div className="flex justify-around pb-2 mb-4 md:justify-start md:space-x-10 md:ml-10">
          <button
            type="button"
            onClick={() => setView(ViewType.BANNERS)}
            className={`mr-2 text-base ${
              view === ViewType.BANNERS
                ? "font-bold underline underline-offset-8"
                : ""
            }`}
          >
            Live Banners
          </button>
          <button
            type="button"
            onClick={() => setView(ViewType.DRAFTS)}
            className={`text-base ${
              view === ViewType.DRAFTS
                ? "font-bold underline underline-offset-8"
                : ""
            }`}
          >
            Drafts
          </button>
        </div>
      </BannersHeader>
    </header>
  );
};

const HeaderBannerSection = memo(MemoHeaderBannerSection);
export default HeaderBannerSection;
