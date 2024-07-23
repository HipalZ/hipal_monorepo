import { lazy, memo, startTransition, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBannerStore } from "@/components/store/useBannerStore";
import BannerLayouts from "@/components/templates/explorePage/bannerLayouts";

// Lazy load components
const HisiteHeader = lazy(() => import("@/components/molecules/hisiteHeader"));
const CreateBanner = lazy(
  () => import("@/components/templates/explorePage/createBanner"),
);

const MemoNewBanner = () => {
  const navigate = useNavigate();
  const businessId = useParams()?.businessId;
  const { createBannerPage } = useBannerStore((s) => ({
    createBannerPage: s.createBannerPage,
    setCreateBannerPage: s.setCreateBannerPage,
  }));

  const handleBack = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners`);
    });
  };
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      {createBannerPage ? (
        <section className="max-w-[69rem] m-auto">
          <article
            onClick={handleBack}
            className="absolute top-0 w-full bg-white shadow-sm lg:w-[69rem]"
          >
            <HisiteHeader
              onBack={handleBack}
              title="Choose Layout"
              isIconBusinessShow={false}
            />
          </article>
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
