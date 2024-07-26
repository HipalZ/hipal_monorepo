import {
  lazy,
  memo,
  startTransition,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBannerStore } from "@/components/store/useBannerStore";
import { useExploreStore } from "@/components/store/useExploreStore";
import type { IBannerPayload } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { BannerPage } from "@/components/utils/bannerLayouts";

enum ViewType {
  BANNERS = "Banners",
  DRAFTS = "Drafts",
}

// Lazy load components
const LoadingSpinner = lazy(() => import("@/components/atom/loadingSpinner"));
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
  const { setSelectedBanner, setBannerPage, bannerPage } = useBannerStore(
    (s) => ({
      setSelectedBanner: s.setSelectedBanner,
      bannerPage: s.bannerPage,
      setBannerPage: s.setBannerPage,
    }),
  );

  const [addSpotlight, setAddSpotlight] = useState(false);
  const [view, setView] = useState(ViewType.BANNERS);

  const { setSelectedBannerType } = useBannerStore((s) => ({
    setSelectedBannerType: s.setSelectedBannerType,
  }));

  const handleNewSpotlight = useCallback(() => {
    setAddSpotlight(true);
    setBannerPage(BannerPage.VIEW);
  }, [bannerPage, addSpotlight]);

  const handleNewBanner = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners/new`);
    });
    setAddSpotlight(false);
  };

  const handleEditBanner = useCallback((banner: IBannerPayload) => {
    setSelectedBanner(banner);
    setSelectedBannerType(banner?.layout || "");
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners/${banner?._id}`);
    });
  }, []);

  const handleNavigate = useCallback(() => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/explorePage`);
    });
  }, [businessId]);

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

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => {
      return view === ViewType.BANNERS
        ? banner.isPublished
        : !banner.isPublished;
    });
  }, [banners, view]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="relative h-screen mb-[2rem]">
        <HisiteHeader
          title="Banners"
          isIconBusinessShow={false}
          onBack={handleNavigate}
        />
        &nbsp;
        <section className="mx-6">
          <SubHeader text="Spotlights" color="#000" />
          <Paragraph text="Size matters! Express limitless with your customers about all the happenings at your place." />
          &nbsp;
          <div className="flex justify-between mb-2">
            <button
              type="button"
              onClick={() => setView(ViewType.BANNERS)}
              className={`mr-2 ${
                view === ViewType.BANNERS ? "font-bold underline" : ""
              }`}
            >
              Banners
            </button>
            <button
              type="button"
              onClick={() => setView(ViewType.DRAFTS)}
              className={`${
                view === ViewType.DRAFTS ? "font-bold underline" : ""
              }`}
            >
              Drafts
            </button>
          </div>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5 pb-[5rem]">
            {filteredBanners && filteredBanners?.length > 0 ? (
              filteredBanners.map((banner: IBannerPayload, index: number) => (
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
                    buttonColor: banner?.buttonTextColor || "",
                  }}
                  banner={banner}
                  handleEditBanner={handleEditBanner}
                />
              ))
            ) : (
              <center className="absolute -translate-x-1/2 top-1/2 left-1/2">
                No Banners
              </center>
            )}
          </section>
        </section>
        {addSpotlight && (
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
              </article>
            </section>
          </MiddlePopUp>
        )}
      </main>
      <footer className="fixed bottom-4 flex lg:justify-center lg:-left-6 w-[92%] lg:w-[96%] gap-4 mx-4">
        <BottomButton
          buttons={[
            { text: "Add New Spotlight", onClick: handleNewSpotlight, type: "button" },
          ]}
        />
      </footer>
    </Suspense>
  );
};

const Banners = memo(MemoBanners);
export default Banners;
