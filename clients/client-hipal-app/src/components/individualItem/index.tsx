"use client";
import { isEmpty } from "lodash-es";
import IndividualItemDescription from "../organisms/dishDescription/foodDiscription/itemDescription";
import CommonBottomButton from "../atoms/bottomButton";
import { useParams, useRouter } from "next/navigation";
import type { IDish } from "../types/businessData";
import ItemWallpaperCarousel from "../atoms/backgroundCarousel/itemBackgroundCarousal";
import MemoNotAvailable from "../atoms/notAvailable";
import MemoPlaceholderImg from "../atoms/placeholder";
import { updateTheme } from "../utils/themes";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import LoadingSpinnerCircle from "../atoms/loader";
import Head from "next/head";
import { BUSINESS_KEYID } from "@/configs";
import Script from "next/script";
import { _useAllBusiness } from "../store/useAllBusiness";

interface IndividualItemPageProps {
  dishData: IDish;
}

const IndividualItemPage = ({ dishData }: IndividualItemPageProps) => {
  const router = useRouter();
  const isAvailable = dishData.availability;
  const customLink = useParams()?.businessId as string;
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);

  // Fetch business settings and update theme
  const fetchSettings = async () => {
    const response = await apiRpc.businesses.business_theme[":customLink"].$get(
      {
        param: {
          customLink: customLink,
        },
      },
    );

    const res = await response.json();
    const themes = res.data?.theme;
    updateTheme(themes);
    return res.data || {};
  };

  const { isLoading: settingsLoading } = useQuery({
    queryKey: ["businessSettings", customLink],
    queryFn: fetchSettings,
    enabled: !!customLink,
  });

  if (settingsLoading) {
    return <LoadingSpinnerCircle />;
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi, I am interested in this item. Can I know more details?\n\n*Product Name:* ${dishData.name}\n*Dish ID:* ${dishData._id}\n*See the product:* ${BUSINESS_KEYID}${customLink}/${dishData._id}`,
    );

    // WhatsApp URL for a specific number
    const whatsappUrl = `https://wa.me/${
      outletInfo?.phone || "8668229890"
    }?text=${message}`;

    window.open(whatsappUrl, "_blank");
  };

  const goToExplore = () => {
    router.push(`/${customLink}/explore`);
  };

  return (
    <>
      {/* Optionally include structured data */}
      <Head>
        <Script type="application/ld+json" id="structured-data">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: dishData.name,
            image: dishData.images,
            description: dishData.description,
            sku: dishData._id,
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: dishData.price,
              availability: dishData.availability ? "InStock" : "OutOfStock",
              url: `${BUSINESS_KEYID}${customLink}/${dishData._id},`,
            },
          })}
        </Script>
      </Head>

      <div
        className="relative w-full h-screen max-w-[30rem] bg-base-100 mx-auto overflow-auto text-primary hide-scrollbar"
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

export default IndividualItemPage;
