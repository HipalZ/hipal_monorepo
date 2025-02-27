import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import { useExploreTemp } from "@/components/store/useExploreTemp";
import type {
  IBannerResponse,
  IBizInfo,
  IBizInfoResponse,
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
  const { socialMediaLinks, setSocialMediaLinks } = useExploreTemp((s) => ({
    socialMediaLinks: s.socialMediaLinks,
    setSocialMediaLinks: s.setSocialMediaLinks,
  }));
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
  const fetchBizInfo = async () => {
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
  const { setUniquelyDishes } = useExploreStore((s) => ({
    setUniquelyDishes: s.setUniquelyDishes,
  }));
  const { setDishes, setOriginalDishes } = useExploreTemp((s) => ({
    setDishes: s.setDishes,
    setOriginalDishes: s.setOriginalDishes,
  }));
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
      const filteredData = response?.data?.filter(
        (dish) => dish?.images?.length > 0,
      );
      setDishes(filteredData);
      setOriginalDishes(filteredData);
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
