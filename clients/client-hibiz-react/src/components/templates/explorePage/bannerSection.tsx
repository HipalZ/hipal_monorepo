import { lazy, memo, useCallback, useMemo } from "react";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import type { IBannerPayload } from "@/components/types/businessData";
import { useParams } from "react-router-dom";
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const PlusButton = lazy(() => import("@/components/atom/plusButton"));
const BannersExplorePage = lazy(() => import("../createdBannerLayouts"));

const MemoBannerSection = () => {
  const businessId = useParams()?.businessId;
  const { toggleExplorePages, setToggleExplorePages, banners } =
    useExploreStore((state) => ({
      toggleExplorePages: state.toggleExplorePages,
      setToggleExplorePages: state.setToggleExplorePages,
      banners: state.banners,
    }));
  const handleNavigation = useCallback(() => {
    setToggleExplorePages(ExplorePages.BANNERS);
  }, [businessId, toggleExplorePages]);

  const memoizedBanners = useMemo(() => banners, [banners]);

  return (
    <section className="mb-4">
      <SubHeader text="Banners" />
      <article
        onClick={handleNavigation}
        onKeyDown={handleNavigation}
        className="flex items-center gap-4 p-2 overflow-x-auto bg-white rounded-lg flex-nowrap"
      >
        {memoizedBanners?.map((banner: IBannerPayload) => (
          <BannersExplorePage key={banner?._id} banner={banner} />
        ))}
        <div className="ml-2 aspect-square shrink-0 relative rounded-xl h-[12rem] lg:h-[12rem] border-dashed border-2 border-[#8C63FF]">
          <label className="flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl">
            <PlusButton />
          </label>
        </div>
      </article>
    </section>
  );
};

const BannerSection = memo(MemoBannerSection);
export default BannerSection;
