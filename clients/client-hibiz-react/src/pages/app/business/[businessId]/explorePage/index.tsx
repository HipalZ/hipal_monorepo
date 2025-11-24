import { useExploreNavigation } from '@/components/helpers/explorePageHelpers';
import MemoizedHeader from '@/components/molecules/header';
import { useBannerStore } from '@/components/store/useBannerStore';
import { ExplorePages, useExploreStore } from '@/components/store/useExploreStore';
import { BannerPage } from '@/components/utils/bannerLayouts';
import { useOutletInfo } from '@/hooks/useExplore';
import { Suspense, lazy, memo, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

// Lazy loading components
const CreateBanner = lazy(() => import('@/components/templates/explorePage/createBanner'));
const BannerLayouts = lazy(() => import('@/components/templates/staticBannerLayouts'));
const Banners = lazy(() => import('@/components/templates/banners'));
const MainForm = lazy(() => import('@/components/templates/explorePage/mainForm'));
const BizInformation = lazy(() => import('@/components/templates/explorePage/businessInformation'));
const LoadingSpinner = lazy(() => import('@/components/atom/loadingSpinner'));
const HisiteHeader = lazy(() => import('@/components/molecules/hisiteHeader'));

const MemoExplorePage = () => {
  const toggleExplorePages = useExploreStore((s) => s.toggleExplorePages);
  const setToggleExplorePages = useExploreStore((s) => s.setToggleExplorePages);
  const setBannerPage = useBannerStore((s) => s.setBannerPage);

  // Fetch business info data
  const { isBizLoading } = useOutletInfo();

  // explore navigation
  const { handleNavigate } = useExploreNavigation();

  const handleBack = useCallback(() => {
    setToggleExplorePages(ExplorePages.BANNERS);
    setBannerPage(BannerPage.VIEW);
  }, [setToggleExplorePages, setBannerPage]);

  if (isBizLoading) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main>
        {toggleExplorePages === ExplorePages.MAINFORM || toggleExplorePages === ExplorePages.BIZINFO ? (
          <HisiteHeader
            onBack={handleNavigate}
            title={`${toggleExplorePages === ExplorePages.BIZINFO ? 'Business Info' : 'Explore Page'} `}
            isIconBusinessShow={false}
            classes="linear_gradient_background"
          />
        ) : null}
        {toggleExplorePages === ExplorePages.MAINFORM && <MainForm />}
        {toggleExplorePages === ExplorePages.BIZINFO && <BizInformation />}
        {toggleExplorePages === ExplorePages.BANNERLAYOUTS && (
          <section className="m-auto max-w-[69rem]">
            <header className="sticky top-0 z-10 h-[5rem] w-full rounded-t-2xl bg-white shadow-lg">
              <MemoizedHeader title="Choose Layout" onBack={handleBack} leftIcon={<FaArrowLeft />} />
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
