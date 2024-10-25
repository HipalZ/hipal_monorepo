import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import { combineAllDishes } from "@/components/templates/explorePage/explorePageStore";
import type {
  IBannerResponse,
  IBizInfo,
  IBizInfoResponse,
  SocialMediaLink,
} from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

export function useIsExplorePage() {
  const { toggleExplorePages } = useExploreStore((s) => ({
    toggleExplorePages: s.toggleExplorePages,
  }));
  const location = useLocation();

  const isExplorePage = useMemo(() => {
    return (
      (location?.pathname.includes("explorePage") &&
        toggleExplorePages === ExplorePages.MAINFORM) ||
      toggleExplorePages === ExplorePages.BIZINFO
    );
  }, [location.pathname, toggleExplorePages]);

  return isExplorePage;
}

export const useOutletInfo = () => {
  const businessId = useParams()?.businessId;
  const { setBizInfo, setToggleExplorePages, setImg } = useExploreStore(
    (state) => ({
      setBizInfo: state.setBizInfo,
      setToggleExplorePages: state.setToggleExplorePages,
      setImg: state.setImg,
    }),
  );
  const getAllBizInfo = async () => {
    return await apiRpc.businesses.outletInfo[":businessId"].$get({
      param: {
        businessId,
      },
    });
  };
  const fetchBizInfo = async (
    socialMediaLinks: SocialMediaLink[],
    setSocialMediaLinks: (data: SocialMediaLink[]) => void,
  ) => {
    const res = await getAllBizInfo();
    const response: IBizInfoResponse = await res.json();
    if (response?.data?.specialBannerUrl) {
      setImg((prevImg) => ({
        ...prevImg,
        banner: response?.data?.specialBannerUrl,
      }));
    }
    if (response?.data?.logoUrl) {
      setImg((prevImg) => ({
        ...prevImg,
        logo: response?.data?.logoUrl,
      }));
    }
    if (response?.data?.endBannerUrl) {
      setImg((prevImg) => ({
        ...prevImg,
        footer: response?.data?.endBannerUrl,
      }));
    }

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
  };
  return { fetchBizInfo };
};

export const useUniquelyYours = () => {
  const businessId = useParams()?.businessId;
  const { setUniquelyDishes, setDishes, setOriginalDishes } = useExploreStore(
    (s) => ({
      setUniquelyDishes: s.setUniquelyDishes,
      setDishes: s.setDishes,
      setOriginalDishes: s.setOriginalDishes,
    }),
  );
  const fetchUniquelyYours = async () => {
    const res = await apiRpc.dishes.uniquelyDishes[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response: IBannerResponse = await res.json();
    if (res.status === 200) {
      setUniquelyDishes(response?.data);
    }
    return response?.data;
  };

  const getUniquelyDishes = async () => {
    const res = await apiRpc.dishes.$get({
      query: {
        businessId,
        UniquelyYours: "true",
      },
    });
    const response = await res.json();
    if (res.status === 200) {
      setDishes(response?.data);
      setOriginalDishes(response?.data);
    }
    return response?.data;
  };

  return { fetchUniquelyYours, getUniquelyDishes };
};

export const useBanners = () => {
  const businessId = useParams()?.businessId;
  const { setBanners } = useExploreStore((s) => ({
    setBanners: s.setBanners,
  }));
  const fetchBanners = async () => {
    const res = await apiRpc.settings.banners[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const response = await res.json();
    if (res.status === 200) {
      setBanners(response?.data);
    }
    return response?.data;
  };

  return { fetchBanners };
};

export const useAllCategoryData = () => {
  const businessId = useParams()?.businessId;
  const { setDishes, originalDishes, setOriginalDishes } = useExploreStore(
    (s) => ({
      setDishes: s.setDishes,
      originalDishes: s.originalDishes,
      setOriginalDishes: s.setOriginalDishes,
    }),
  );
  const getAllCategoryData = async () => {
    if (originalDishes.length > 0) {
      setDishes(originalDishes);
      return originalDishes;
    }
    const categoryResponse = await apiRpc.categories.$get({
      query: {
        businessId,
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

  return { getAllCategoryData };
};
