import { memo, useCallback, Suspense, lazy } from "react";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import { FaArrowLeft } from "react-icons/fa";
import MemoizedHeader from "@/components/molecules/header";
import { BannerPage } from "@/components/utils/bannerLayouts";
import { useBannerStore } from "@/components/store/useBannerStore";
import {
  useOutletInfo,
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
  const {
    toggleExplorePages,
    setToggleExplorePages,
  } = useExploreStore((state) => ({
    toggleExplorePages: state.toggleExplorePages,
    setToggleExplorePages: state.setToggleExplorePages,
  }));

  const { setBannerPage } = useBannerStore((s) => ({
    setBannerPage: s.setBannerPage,
  }));

  // Fetch business info data
  const { isBizLoading } = useOutletInfo();

  // explore navigation
  const { handleNavigate } = useExploreNavigation();

  const handleBack = useCallback(() => {
    setToggleExplorePages(ExplorePages.BANNERS);
    setBannerPage(BannerPage.VIEW);
  }, [setToggleExplorePages, setBannerPage]);

  if (isBizLoading)
    return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main>
        {toggleExplorePages === ExplorePages.MAINFORM ||
          toggleExplorePages === ExplorePages.BIZINFO ? (
          <HisiteHeader
            onBack={handleNavigate}
            title={`${toggleExplorePages === ExplorePages.BIZINFO
              ? "Business Info"
              : "Explore Page"
              } `}
            isIconBusinessShow={false}
            classes="linear_gradient_background"
          />
        ) : null}
        {toggleExplorePages === ExplorePages.MAINFORM && (
          <MainForm />
        )}
        {toggleExplorePages === ExplorePages.BIZINFO && (
          <BizInformation />
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
      </main>
    </Suspense>
  );
};

const ExplorePage = memo(MemoExplorePage);
export default ExplorePage;
