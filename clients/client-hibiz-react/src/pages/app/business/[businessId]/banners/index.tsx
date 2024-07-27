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
import { FaArrowLeft } from "react-icons/fa";
import { cn } from "@/components/utils/helper";
import toast from "react-hot-toast";

enum ViewType {
  BANNERS = "Banners",
  DRAFTS = "Drafts",
}

// Lazy load components
const MemoizedHeader = lazy(() => import("@/components/molecules/header"));
const LoadingSpinner = lazy(() => import("@/components/atom/loadingSpinner"));
const CreatedBannersLayouts = lazy(
  () => import("@/components/templates/explorePage/createdBannerLayouts"),
);
const MiddlePopUp = lazy(() => import("@/components/atom/middlePopUp"));

const MemoBanners = () => {
  const navigate = useNavigate();
  const setBanners = useExploreStore((s) => s.setBanners);
  const businessId = useParams()?.businessId;
  const { setSelectedBanner, setBannerPage, bannerPage } = useBannerStore(
    (s) => ({
      setSelectedBanner: s.setSelectedBanner,
      setBannerPage: s.setBannerPage,
      bannerPage: s.bannerPage,
    }),
  );

  const [addSpotlight, setAddSpotlight] = useState(false);
  const [view, setView] = useState(ViewType.BANNERS);
  const [draggedBanner, setDraggedBanner] = useState<IBannerPayload | null>(
    null,
  );
  const [isArrangeMode, setIsArrangeMode] = useState(false);
  const [reorderedBanners, setReorderedBanners] = useState<IBannerPayload[]>(
    [],
  );

  const { setSelectedBannerType } = useBannerStore((s) => ({
    setSelectedBannerType: s.setSelectedBannerType,
  }));

  const handleNewBanner = useCallback(() => {
    setBannerPage(BannerPage.VIEW);
    startTransition(() => {
      navigate(`/app/business/${businessId}/banners/new`);
    });
  }, [businessId, bannerPage]);

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
      setReorderedBanners(response);
      return response;
    },
    enabled: !!businessId,
  });

  const filteredBanners = useMemo(() => {
    return reorderedBanners.filter((banner) => {
      return view === ViewType.BANNERS
        ? banner.isPublished
        : !banner.isPublished;
    });
  }, [reorderedBanners, view]);

  const onDragStart = useCallback((banner: IBannerPayload) => {
    setDraggedBanner(banner);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (
    e: React.DragEvent<HTMLDivElement>,
    droppedBanner: IBannerPayload,
  ) => {
    e.preventDefault();
    if (!draggedBanner) return;

    const draggedBannerIndex = reorderedBanners.findIndex(
      (banner) => banner._id === draggedBanner._id,
    );
    const droppedBannerIndex = reorderedBanners.findIndex(
      (banner) => banner._id === droppedBanner._id,
    );

    const updatedBanners = [...reorderedBanners];
    updatedBanners.splice(draggedBannerIndex, 1);
    updatedBanners.splice(droppedBannerIndex, 0, draggedBanner);

    setReorderedBanners(updatedBanners);
    setDraggedBanner(null);
  };

  const handleArrangeSequence = useCallback(() => {
    setIsArrangeMode(!isArrangeMode);
  }, [isArrangeMode]);

  const handleSaveSequence = async () => {
    const sequence = reorderedBanners.map((banner) => banner._id);
    setIsArrangeMode(false);
    const response = await apiRpc.settings.banners.sequence.$put({
      json: {
        sequenceOfBannerIds: sequence,
      },
    });
    if (response.status === 200) {
      toast.success("Sequence saved successfully");
      setBanners((prevBanners) =>
        prevBanners.map(
          (banner) =>
            reorderedBanners.find((b) => b._id === banner._id) || banner,
        ),
      );
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="relative h-screen mb-[2rem]">
        <header
          className={`sticky top-0 z-10 w-full bg-white rounded-t-2xl ${
            isArrangeMode ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <MemoizedHeader
            title="Banners"
            onBack={handleNavigate}
            leftIcon={<FaArrowLeft />}
            isIconBusinessShow={false}
          >
            <p className="mx-4 mb-2 text-xs text-gray-500 md:text-base lg:text-base">
              Size matters! Express limitless with your customers about all the
              happenings at your place.
            </p>
            <div className="flex justify-around mb-10 md:justify-start md:space-x-10 md:ml-10">
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
          </MemoizedHeader>
        </header>
        <article className="max-w-[69rem] flex justify-end">
          <button
            type="button"
            className="z-20 px-4 py-2 mb-4 mr-4 text-xs text-white bg-black rounded-full"
            onClick={isArrangeMode ? handleSaveSequence : handleArrangeSequence}
          >
            {isArrangeMode ? "Save Sequence" : "Arrange Sequence"}
          </button>
          {isArrangeMode && (
            <button
              type="button"
              className="z-20 px-4 py-2 mb-4 mr-4 text-xs text-white bg-red-500 rounded-full"
              onClick={handleArrangeSequence}
            >
              Cancel
            </button>
          )}
        </article>
        &nbsp;
        <section
          className={`mx-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5 pb-[5rem] ${
            isArrangeMode ? "pointer-events-auto opacity-100" : ""
          }`}
        >
          {filteredBanners && filteredBanners.length > 0 ? (
            filteredBanners.map((banner, index) => (
              <div
                key={banner._id}
                data-id={banner._id}
                draggable={isArrangeMode}
                onDragStart={
                  isArrangeMode ? () => onDragStart(banner) : undefined
                }
                onDragOver={isArrangeMode ? onDragOver : undefined}
                onDrop={isArrangeMode ? (e) => onDrop(e, banner) : undefined}
                className="relative overflow-hidden"
              >
                <CreatedBannersLayouts
                  selectedLayout={banner?.layout || ""}
                  heading={banner?.heading || ""}
                  paragraph={banner?.paragraph || ""}
                  callToAction={banner?.callToAction || ""}
                  img={{ logo: banner?.bannerImage || "" }}
                  selectedColor={{
                    bgColor: banner?.backgroundColor || "",
                    textColor: banner?.backgroundColor || "",
                  }}
                  paragraphStyle={{
                    color: banner?.paragraphColor || "",
                  }}
                  buttonStyle={{
                    color: banner?.buttonColor || "",
                    buttonColor: banner?.buttonTextColor || "",
                  }}
                  banner={banner}
                  handleEditBanner={handleEditBanner}
                />
                {isArrangeMode && (
                  <div className="absolute inset-0 rounded-2xl max-w-[12rem] flex items-center justify-center bg-gray-500 bg-opacity-50 text-white text-2xl font-bold">
                    {index + 1}
                  </div>
                )}
              </div>
            ))
          ) : (
            <center className="absolute -translate-x-1/2 top-1/2 left-1/2">
              No Banners
            </center>
          )}
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
      <button
        type="button"
        className={cn(
          "pointer-events-auto bottom_btn",
          isArrangeMode ? "opacity-50" : "",
        )}
        onClick={handleNewBanner}
        disabled={isArrangeMode}
      >
        Add New Spotlight
      </button>
    </Suspense>
  );
};

const Banners = memo(MemoBanners);
export default Banners;
