import { memo, useCallback, useRef, Suspense, lazy, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { combineAllDishes } from "@/components/templates/explorePage/explorePageStore";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import type { IBizInfo } from "@/components/types/businessData";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import CreateBanner from "@/components/templates/explorePage/createBanner";
import BannerLayouts from "@/components/templates/explorePage/bannerLayouts";
import { FaArrowLeft } from "react-icons/fa";
import MemoizedHeader from "@/components/molecules/header";
import { BannerPage } from "@/components/utils/bannerLayouts";
import { useBannerStore } from "@/components/store/useBannerStore";
import { BsInstagram } from "react-icons/bs";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandTelegram } from "react-icons/tb";
import { RiDiscordLine } from "react-icons/ri";

// Lazy loading components
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
  const navigate = useNavigate();
  const businessId = useParams()?.businessId;
  const {
    setBizInfo,
    originalDishes,
    setBanners,
    setUniquelyDishes,
    setOriginalDishes,
    clearOriginalDishes,
    isLoading,
    showUniquePopUp,
    setDishes,
    toggleExplorePages,
    setToggleExplorePages,
    setImg,
  } = useExploreStore((state) => ({
    setBizInfo: state.setBizInfo,
    originalDishes: state.originalDishes,
    setOriginalDishes: state.setOriginalDishes,
    setUniquelyDishes: state.setUniquelyDishes,
    clearOriginalDishes: state.clearOriginalDishes,
    setBanners: state.setBanners,
    toggleBizInfo: state.toggleBizInfo,
    isLoading: state.isLoading,
    setIsLoading: state.setIsLoading,
    showUniquePopUp: state.showUniquePopUp,
    setDishes: state.setDishes,
    toggleExplorePages: state.toggleExplorePages,
    setToggleExplorePages: state.setToggleExplorePages,
    setImg: state.setImg,
  }));

  const { bannerPage, setBannerPage } = useBannerStore((s) => ({
    bannerPage: s.bannerPage,
    setBannerPage: s.setBannerPage,
  }));

  const bannersRef = useRef(false);
  const uniquelyYoursRef = useRef(false);

  const [socialMediaLinks, setSocialMediaLinks] = useState([
    { _id: 1, icon: "instagram", logo: <BsInstagram size={30} />, link: "" },
    { _id: 2, icon: "facebook", logo: <CiFacebook size={36} />, link: "" },
    { _id: 3, icon: "twitter", logo: <FaXTwitter size={30} />, link: "" },
    { _id: 4, icon: "telegram", logo: <TbBrandTelegram size={30} />, link: "" },
    { _id: 5, icon: "discord", logo: <RiDiscordLine size={36} />, link: "" },
  ]);

  const handleNavigate = useCallback(() => {
    if (toggleExplorePages === ExplorePages.BIZINFO) {
      setToggleExplorePages(ExplorePages.MAINFORM);
    }
    if (toggleExplorePages !== ExplorePages.BIZINFO) {
      clearOriginalDishes();
      navigate(`/app/business/${businessId}/hisite`);
    }
  }, [businessId, toggleExplorePages, clearOriginalDishes, originalDishes]);

  const getAllCategoryData = async (businessId: string) => {
    if (originalDishes.length > 0) return setDishes(originalDishes);
    const categoryResponse = await apiRpc.categories.$get({
      query: {
        businessId: businessId,
        dishes: "true",
      },
    });
    const data = await categoryResponse.json();
    const categories = data?.data;
    const allDishes = await combineAllDishes(categories);
    setDishes(allDishes);
    setOriginalDishes(allDishes);
    return allDishes;
  };

  const getAllBizInfo = async () => {
    return await apiRpc.businesses.outletInfo[":businessId"].$get({
      param: {
        businessId,
      },
    });
  };

  const fetchUniquelyYours = async () => {
    const res = await apiRpc.dishes.uniquelyDishes[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    if (res.status === 200) {
      uniquelyYoursRef.current = true;
      setUniquelyDishes(response?.data);
    }
    return response?.data;
  };

  const fetchBanners = async () => {
    const res = await apiRpc.settings.banners[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    if (res.status === 200) {
      bannersRef.current = true;
      setBanners(response?.data);
    }
    return response?.data;
  };

  const { refetch } = useQuery({
    queryKey: ["bizInfo", businessId],
    queryFn: async () => {
      const res = await getAllBizInfo();
      const response = await res.json();
      setImg({
        banner: response?.data?.specialBannerUrl,
        logo: response?.data?.logoUrl,
        footer: response?.data?.endBannerUrl,
      });
      setBizInfo(response?.data as IBizInfo);
      setToggleExplorePages(ExplorePages.MAINFORM);
      const updatedSocialMediaLinks = socialMediaLinks.map((link) => {
        const matchedLink = response?.data?.socialMediaLinks?.find(
          (item) => item.icon === link.icon,
        );
        return {
          ...link,
          link: matchedLink ? matchedLink.link : link.link,
        };
      });

      setSocialMediaLinks(updatedSocialMediaLinks);
      return response;
    },
    enabled: !!businessId,
  });

  useQuery({
    queryKey: ["banners", businessId, bannersRef.current],
    queryFn: fetchBanners,
    enabled: !!businessId && !bannersRef.current,
  });

  useQuery({
    queryKey: ["categories", businessId, uniquelyYoursRef.current],
    queryFn: fetchUniquelyYours,
    enabled: !!businessId && !uniquelyYoursRef.current,
  });

  useQuery({
    queryKey: ["categoriez", businessId, showUniquePopUp],
    queryFn: () => getAllCategoryData(businessId ?? ""),
    enabled: !!businessId && showUniquePopUp,
  });

  const handleBack = useCallback(() => {
    setToggleExplorePages(ExplorePages.BANNERS);
    setBannerPage(BannerPage.VIEW);
  }, [bannerPage, toggleExplorePages]);

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
                isIconBusinessShow={false}
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
