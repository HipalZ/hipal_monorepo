import { memo, useCallback, Suspense, lazy, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { SocialMediaLink } from "@/components/types/businessData";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import { FaArrowLeft } from "react-icons/fa";
import MemoizedHeader from "@/components/molecules/header";
import { BannerPage } from "@/components/utils/bannerLayouts";
import { useBannerStore } from "@/components/store/useBannerStore";
import { BsInstagram } from "react-icons/bs";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandTelegram } from "react-icons/tb";
import { RiDiscordLine } from "react-icons/ri";
import {
  useAllCategoryData,
  useBanners,
  useOutletInfo,
  useUniquelyYours,
} from "@/hooks/useExplore";
import { useExploreNavigation } from "@/components/helpers/explorePageHelpers";

// Lazy loading components
const CreateBanner = lazy(
  () => import("@/components/templates/explorePage/createBanner"),
);
const BannerLayouts = lazy(
  () => import("@/components/templates/staticBannerLayouts"),
);
const Banners = lazy(() => import("@/components/templates/banners"));
const MainForm = lazy(
  () => import("@/components/templates/explorePage/mainForm"),
);
const BizInformation = lazy(
  () => import("@/components/templates/explorePage/businessInformation"),
);
const LoadingSpinner = lazy(() => import("@/components/atom/loadingSpinner"));
const HisiteHeader = lazy(() => import("@/components/molecules/hisiteHeader"));

const MemoExplorePage = () => {
  const businessId = useParams()?.businessId;
  const {
    isLoading,
    showUniquePopUp,
    toggleExplorePages,
    setToggleExplorePages,
  } = useExploreStore((state) => ({
    isLoading: state.isLoading,
    showUniquePopUp: state.showUniquePopUp,
    toggleExplorePages: state.toggleExplorePages,
    setToggleExplorePages: state.setToggleExplorePages,
  }));

  const { bannerPage, setBannerPage } = useBannerStore((s) => ({
    bannerPage: s.bannerPage,
    setBannerPage: s.setBannerPage,
  }));

  // Fetch business info data
  const { fetchBizInfo } = useOutletInfo();
  // Fetch uniquely yours data
  const { fetchUniquelyYours, getUniquelyDishes } = useUniquelyYours();
  // Fetch banners data
  const { fetchBanners } = useBanners();

  // explore navigation
  const { handleNavigate } = useExploreNavigation();

  // social media links state
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([
    { _id: 1, icon: "instagram", logo: <BsInstagram size={30} />, link: "" },
    { _id: 2, icon: "facebook", logo: <CiFacebook size={36} />, link: "" },
    { _id: 3, icon: "twitter", logo: <FaXTwitter size={30} />, link: "" },
    { _id: 4, icon: "telegram", logo: <TbBrandTelegram size={30} />, link: "" },
    { _id: 5, icon: "discord", logo: <RiDiscordLine size={36} />, link: "" },
  ]);

  // => Fetch business info
  const { isLoading: isBizLoading, refetch } = useQuery({
    queryKey: ["bizInfo", businessId],
    queryFn: () => fetchBizInfo(socialMediaLinks, setSocialMediaLinks),
    enabled: !!businessId,
  });

  // => Fetch banners
  const { isLoading: bannersLoading } = useQuery({
    queryKey: ["banners", businessId],
    queryFn: fetchBanners,
    enabled: !!businessId,
  });

  // => fetch uniquely yours
  const { isLoading: uniquelyLoading } = useQuery({
    queryKey: ["categories", businessId],
    queryFn: fetchUniquelyYours,
    enabled: !!businessId,
  });

  // => fetch categories
  const { isLoading: dishesLoading } = useQuery({
    queryKey: ["categoriez", businessId, showUniquePopUp],
    queryFn: getUniquelyDishes,
    enabled: !!businessId && showUniquePopUp,
  });

  const handleBack = useCallback(() => {
    setToggleExplorePages(ExplorePages.BANNERS);
    setBannerPage(BannerPage.VIEW);
  }, [bannerPage, toggleExplorePages]);

  if (isBizLoading || bannersLoading || uniquelyLoading || dishesLoading)
    return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main>
        {toggleExplorePages === ExplorePages.MAINFORM ||
        toggleExplorePages === ExplorePages.BIZINFO ? (
          <HisiteHeader
            onBack={handleNavigate}
            title={`${
              toggleExplorePages === ExplorePages.BIZINFO
                ? "Business Info"
                : "Explore Page"
            } `}
            isIconBusinessShow={false}
          />
        ) : null}
        {toggleExplorePages === ExplorePages.MAINFORM && (
          <MainForm
            setSocialMediaLinks={setSocialMediaLinks}
            socialMediaLinks={socialMediaLinks}
          />
        )}
        {toggleExplorePages === ExplorePages.BIZINFO && (
          <BizInformation refetch={refetch} />
        )}
        {toggleExplorePages === ExplorePages.BANNERLAYOUTS && (
          <section className="max-w-[69rem] m-auto">
            <header className="sticky top-0 z-10 bg-white rounded-t-2xl h-[5rem] w-full shadow-lg">
              <MemoizedHeader
                title="Choose Layout"
                onBack={handleBack}
                leftIcon={<FaArrowLeft />}
              />
            </header>
            <BannerLayouts />
          </section>
        )}
        {toggleExplorePages === ExplorePages.BANNERS && <Banners />}
        {toggleExplorePages === ExplorePages.NEWBANNER && <CreateBanner />}
        {toggleExplorePages === ExplorePages.EDITBANNER && <CreateBanner />}
        {isLoading && <LoadingSpinner />}
      </main>
    </Suspense>
  );
};

const ExplorePage = memo(MemoExplorePage);
export default ExplorePage;
