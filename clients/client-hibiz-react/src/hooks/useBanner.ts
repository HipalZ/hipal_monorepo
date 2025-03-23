import { useBannerStore } from "@/components/store/useBannerStore";
import { useExploreStore } from "@/components/store/useExploreStore";
import { apiRpc } from "@hi/common";
import { useParams } from "react-router-dom";

export const useBannersApi = () => {
  const { businessId, hotelId } = useParams();
  const { setBanners } = useExploreStore((s) => ({
    setBanners: s.setBanners,
  }));
  const { setEditBanner } = useBannerStore((s) => ({
    setEditBanner: s.setEditBanner,
  }));
  const bannersApi = async () => {
    const res = await apiRpc.settings.banners[":businessId"].$get({
      param: {
        businessId: businessId || hotelId,
      },
    });
    const response = await res.json();

    setBanners(response?.data);
    setEditBanner("");
    return response;
  };
  return { bannersApi };
};
