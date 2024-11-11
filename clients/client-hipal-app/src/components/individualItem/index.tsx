"use client";
import { isEmpty } from "lodash-es";
import IndividualItemDescription from "../organisms/dishDescription/foodDiscription/itemDescription";
import CommonBottomButton from "../atoms/bottomButton";
import type { IDish } from "../types/businessData";
import { useParams, useRouter } from "next/navigation";
import ItemWallpaperCarousel from "../atoms/backgroundCarousel/itemBackgroundCarousal";
import MemoNotAvailable from "../atoms/notAvailable";
import MemoPlaceholderImg from "../atoms/placeholder";
import { BUSINESS_KEYID } from "@/configs";
import { updateTheme } from "../utils/themes";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import LoadingSpinnerCircle from "../atoms/loader";

const IndividualItemPage = ({ dishData }: { dishData: IDish }) => {
  const router = useRouter();
  const { businessId, dishId } = useParams();
  const isAvailable = dishData.availability;

  const fetchSettings = async () => {
    const response = await apiRpc.businesses.business_theme[":customLink"].$get(
      {
        param: {
          customLink: businessId,
        },
      },
    );

    const res = await response.json();
    const themes = res.data?.theme;
    updateTheme(themes);
    return res.data || {};
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi, I am interested in this item. Can I know more details?\n\n*Product Name:* ${dishData.name}\n*Dish ID:* ${dishData._id}\n*See the product:* ${BUSINESS_KEYID}/${businessId}/${dishId}\n*Image Preview:* ${dishData.images[0]}`,
    );

    // WhatsApp URL for a specific number
    const whatsappUrl = `https://wa.me/8668229890?text=${message}`;

    window.open(whatsappUrl, "_blank");
  };

  const goToExplore = () => {
    router.push(`/${dishData.businessId}/explore`);
  };

  const { isLoading: settingsLoading } = useQuery({
    queryKey: ["businessSettings", businessId],
    queryFn: fetchSettings,
    enabled: !!businessId,
  });

  if (settingsLoading) {
    return <LoadingSpinnerCircle />;
  }

  return (
    <div
      className="relative w-full max-w-[30rem] bg-base-100 mx-auto overflow-auto text-primary hide-scrollbar"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Carousel or Placeholder */}
      {!isEmpty(dishData.images) ? (
        <div className="overflow-hidden rounded-2xl">
          <ItemWallpaperCarousel
            wallpapers={dishData.images}
            isAvailable={isAvailable}
          />
        </div>
      ) : !isAvailable ? (
        <div className="pb-2 text-center">
          <MemoNotAvailable className="w-full h-32 overflow-hidden rounded-xl" />
        </div>
      ) : (
        <div className="pb-4">
          <MemoPlaceholderImg className="w-full h-[10rem] bg-base-200" />
        </div>
      )}

      {/* Item Description */}
      <section className="px-4 mt-4">
        <IndividualItemDescription dishData={dishData} />
      </section>

      {/* Bottom Buttons */}
      <CommonBottomButton
        fixed
        buttons={[
          {
            text: "Explore More",
            onClick: goToExplore,
          },
          {
            text: "Chat on Whatsapp",
            onClick: handleWhatsAppClick,
          },
        ]}
      />
    </div>
  );
};

export default IndividualItemPage;
