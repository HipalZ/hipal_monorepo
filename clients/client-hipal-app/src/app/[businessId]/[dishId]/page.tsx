"use client";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { isEmpty } from "lodash-es";
import ItemWallpaperCarousel from "@/components/atoms/backgroundCarousel/itemBackgroundCarousal";
import CommonBottomButton from "@/components/atoms/bottomButton";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import MemoNotAvailable from "@/components/atoms/notAvailable";
import MemoPlaceholderImg from "@/components/atoms/placeholder";
import IndividualItemDescription from "@/components/organisms/dishDescription/foodDiscription/itemDescription";
import type { IDish } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { updateTheme } from "@/components/utils/themes";
import { BUSINESS_KEYID } from "@/configs";
import { useCallback } from "react";

const Page = () => {
  const { businessId, dishId } = useParams();
  const router = useRouter();

  // Fetch dish data
  const fetchDishData = async (): Promise<IDish> => {
    const response = await apiRpc.dishes[":id"].$get({
      param: { id: dishId },
    });
    const res = await response.json();
    return res.data;
  };

  // Fetch business settings
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

  // Query for dish data
  const {
    data: dishData,
    isLoading: dishLoading,
    isError: dishError,
  } = useQuery({
    queryKey: ["dishDataInfo", dishId],
    queryFn: fetchDishData,
    enabled: !!dishId,
  });

  // Query for business settings
  const {
    data: settings,
    isLoading: settingsLoading,
    isError: settingsError,
  } = useQuery({
    queryKey: ["businessSettings", businessId],
    queryFn: fetchSettings,
    enabled: !!businessId,
  });

  if (dishLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[90dvh]">
        <LoadingSpinnerCircle />
      </div>
    );
  }

  if (dishError || !dishData) {
    return (
      <div className="flex items-center justify-center min-h-[90dvh]">
        <p className="text-red-500">
          Failed to load dish data. Please try again.
        </p>
      </div>
    );
  }

  if (settingsError) {
    console.warn("Failed to load business settings.");
  }

  const isAvailable = dishData.availability;

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi, I am interested in this item. Can I know more details?\n\n*Product Name:* ${dishData.name}\n*Dish ID:* ${dishData._id}\n*See the product:* ${BUSINESS_KEYID}/${businessId}/${dishId}\n*Image Preview:* ${dishData.images[0]}`,
    );

    // WhatsApp URL for a specific number
    const whatsappUrl = `https://wa.me/8668229890?text=${message}`;

    window.open(whatsappUrl, "_blank");
  };

  const goToExplore = () => {
    router.push(`/${businessId}/explore`);
  };

  return (
    <>
      {/* Dynamic Meta Tags */}
      <Head>
        <meta property="og:title" content={dishData.name} />
        <meta property="og:description" content={dishData.description} />
        <meta property="og:image" content={dishData.images[0]} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:url"
          content={`${BUSINESS_KEYID}/${businessId}/${dishId}`}
        />
        <meta property="og:type" content="website" />
        <title>{dishData.name}</title>
      </Head>

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
    </>
  );
};

export default Page;
