import { lazy, memo, startTransition, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBannerStore } from "@/components/store/useBannerStore";
import { BannerPage } from "@/components/utils/bannerLayouts";
import { FaArrowLeft } from "react-icons/fa";

// Lazy load components
const CreateBanner = lazy(
  () => import("@/components/templates/explorePage/createBanner"),
);
const MemoizedHeader = lazy(() => import("@/components/molecules/header"));
const BannerLayouts = lazy(
  () => import("@/components/templates/explorePage/bannerLayouts"),
);

const MemoNewBanner = () => {
  const navigate = useNavigate();
  const businessId = useParams()?.businessId;
  const { bannerPage, setBannerPage } = useBannerStore((s) => ({
    bannerPage: s.bannerPage,
    setBannerPage: s.setBannerPage,
  }));

  const handleBack = () => {
    console.log("handleBack");
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners`);
    });
    setBannerPage(BannerPage.VIEW);
  };
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      {bannerPage === BannerPage.VIEW ? (
        <section className="max-w-[69rem] m-auto">
          <header className="sticky top-0 z-10 bg-white rounded-t-2xl h-[5rem] w-full">
            <MemoizedHeader
              title="Choose Layout"
              onBack={handleBack}
              leftIcon={<FaArrowLeft />}
              isIconBusinessShow={false}
            />
          </header>
          <BannerLayouts />
        </section>
      ) : (
        <CreateBanner />
      )}
    </Suspense>
  );
};

const NewBanner = memo(MemoNewBanner);
export default NewBanner;
