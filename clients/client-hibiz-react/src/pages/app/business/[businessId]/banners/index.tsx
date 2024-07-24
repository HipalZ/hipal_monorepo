import { lazy, memo, startTransition, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBannerStore } from "@/components/store/useBannerStore";
import { useExploreStore } from "@/components/store/useExploreStore";
import type { IBannerPayload } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { BannerType } from "@/components/utils/bannerLayouts";

// Lazy load components
const CreatedBannersLayouts = lazy(
  () => import("@/components/templates/explorePage/createdBannerLayouts"),
);
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));
const MiddlePopUp = lazy(() => import("@/components/atom/middlePopUp"));
const Paragraph = lazy(() => import("@/components/atom/paragraph"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const HisiteHeader = lazy(() => import("@/components/molecules/hisiteHeader"));

const MemoBanners = () => {
  const navigate = useNavigate();
  const banners = useExploreStore((s) => s.banners);
  const setBanners = useExploreStore((s) => s.setBanners);
  const businessId = useParams()?.businessId;
  const { setSelectedBanner } = useBannerStore((s) => ({
    setSelectedBanner: s.setSelectedBanner,
  }));
  const {
    addSpotlight,
    setAddSpotlight,
    setSelectedNewBanner,
    setSelectedBannerType,
  } = useBannerStore((s) => ({
    selectedNewBanner: s.selectedNewBanner,
    setSelectedNewBanner: s.setSelectedNewBanner,
    addSpotlight: s.addSpotlight,
    setAddSpotlight: s.setAddSpotlight,
    setSelectedBannerType: s.setSelectedBannerType,
  }));
  const handleNewSpotlight = () => {
    setAddSpotlight(true);
    setSelectedBannerType(BannerType.BANNER_TYPE_0);
  };

  const handleNewBanner = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners/new`);
    });
    setSelectedNewBanner(true);
    setAddSpotlight(false);
  };

  const handleEditBanner = (banner: IBannerPayload) => {
    setSelectedBanner(banner);
    setSelectedBannerType(banner?.layout);
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners/${banner?._id}`);
    });
  };

  const handleNavigate = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/explorePage`);
    });
  };

  useQuery({
    queryKey: ["banners", businessId],
    queryFn: async () => {
      const res = await apiRpc.settings.banners[":businessId"].$get({
        param: {
          businessId: businessId,
        },
      });
      const response = (await res.json()).data;
      setBanners(response);
      return response;
    },
    enabled: !!businessId,
  });

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="h-screen mb-[2rem]">
        <HisiteHeader
          title="Banners"
          isIconBusinessShow={false}
          onBack={handleNavigate}
        />
        &nbsp;
        <section className="mx-6">
          <SubHeader text="Spotlights" color="#000" />
          <Paragraph text="Size matters ! Express limitless with your customers about all the happenings at your place.  " />
          &nbsp;
          <h1 className="mb-2">Banners</h1>
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5 pb-[5rem]">
            {banners
              ? banners?.map((banner: IBannerPayload, index: number) => {
                  return (
                    <CreatedBannersLayouts
                      key={`banner?._id+${index.toString()}`}
                      selectedLayout={banner?.layout || ""}
                      heading={banner?.heading || ""}
                      paragraph={banner?.paragraph || ""}
                      callToAction={banner?.callToAction || ""}
                      img={{ logo: banner?.bannerImage || "" }}
                      selectedColor={{
                        bgColor: banner?.backgroundColor || "",
                        textColor: banner?.backgroundColor || "",
                      }}
                      paragraphStyle={{ color: banner?.paragraphColor || "" }}
                      buttonStyle={{
                        color: banner?.buttonColor || "",
                      }}
                      banner={banner}
                      handleEditBanner={handleEditBanner}
                    />
                  );
                })
              : null}
          </section>
          <BottomButton text="Add New Spotlight" onClick={handleNewSpotlight} />
        </section>
        {addSpotlight ? (
          <MiddlePopUp
            show={addSpotlight}
            onClose={() => {
              setAddSpotlight(false);
            }}
            onlyPopUp={false}
          >
            <section className="p-4">
              <h1 className="my-4 text-2xl font-semibold">Select One</h1>
              <p className="my-4 text-xl">
                Create New Banner or continue with drafts
              </p>
              <article className="flex gap-10 my-4">
                <button
                  onClick={handleNewBanner}
                  type="button"
                  className="on_active_bounce h-16 bg-[#F1EAFA] text-black rounded-2xl w-full p-2"
                >
                  New Banner
                </button>
                <button
                  type="button"
                  disabled={true}
                  className="bg-[#F1EAFA] opacity-50 text-black rounded-2xl w-full p-2"
                >
                  From Drafts
                </button>
              </article>
            </section>
          </MiddlePopUp>
        ) : null}
      </main>
    </Suspense>
  );
};

const Banners = memo(MemoBanners);
export default Banners;
