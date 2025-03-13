import { isEmpty } from "lodash-es";
import PlaceholderImg from "../placeholder";
import { memo } from "react";
import { cn } from "@hi/common";
import { useCart } from "@/components/store/useCart";
import MemoNotAvailable from "../notAvailable";
import ItemWallpaperCarousel from "../backgroundCarousel/itemBackgroundCarousal";
import IndividualItemDescription from "@/components/organisms/dishDescription/foodDiscription/itemDescription";
import CommonBottomButton from "../bottomButton";
import { BUSINESS_KEYID } from "@/configs";
import { useParams } from "next/navigation";
import { useCartStore } from "@/components/store/useCartStore";
import Head from "next/head";
import { useActiveClass } from "@/components/store/useActiveClass";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

function generateCartItemId(dishId, portionId, extras) {
  const sortedExtras = [...extras]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => `${e.id}:${e.quantity}`)
    .join("|");
  return `${dishId}_${portionId || "no_portion"}_${sortedExtras || "no_extras"
    }`;
}

function MemoOutletItemInfo() {
  const { isSelectedDish: dishData } = useActiveClass();
  const isAvailable = dishData?.availability;
  const customLink = useParams()?.businessId as string;
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const { showCart } = useCart();
  const handleInsideClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
  };

  const {
    removeFromCart,
    addToCart,
    cart,
  } = useCartStore();


  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi, I am interested in this item. Can I know more details?\n\n*Product Name:* ${dishData.name}\n*Dish ID:* ${dishData._id}\n*See the product:* ${BUSINESS_KEYID}${customLink}/dish/${dishData._id}`,
    );

    const whatsappUrl = `https://wa.me/+91${outletInfo?.phone}?text=${message}`;

    window.open(whatsappUrl, "_blank");
  };


  return (
    <>
      <Head>
        <meta property="og:title" content={dishData?.name} />
        <meta property="og:description" content={dishData?.description} />
        <meta property="og:image" content={dishData?.images?.[0]} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:url"
          content={`${BUSINESS_KEYID}/${customLink}/${dishData?._id}`}
        />
        <meta property="og:type" content="website" />
        <title>{dishData?.name}</title>
      </Head>
      <div
        className="relative max-h-[90dvh] overflow-auto text-primary hide-scrollbar"
        onClick={(e) => handleInsideClick(e)}
      >
        {!isEmpty(dishData?.images) ? (
          <div className="overflow-hidden rounded-2xl">
            <ItemWallpaperCarousel
              wallpapers={dishData?.images}
              isAvailable={isAvailable}
            />
          </div>
        ) : !isAvailable ? (
          <div className="pb-2 text-center">
            <MemoNotAvailable className="w-full h-32 overflow-hidden rounded-xl" />
          </div>
        ) : (
          <div className="pb-4">
            <PlaceholderImg className="w-full h-[10rem] bg-base-200" />
          </div>
        )}
        <section className={cn("mx-4", !showCart ? "" : "mt-4")}>
          <IndividualItemDescription />
        </section>

        <CommonBottomButton
          fixed
          buttons={[
            cart.some(
              (item) =>
                item.id ===
                generateCartItemId(
                  dishData._id,
                  dishData.portions?.[0]?._id || null,
                  [],
                ),
            )
              ? {
                text: "Remove from Cart",
                onClick: () => {
                  const itemId = generateCartItemId(
                    dishData._id,
                    dishData.portions?.[0]?._id || null,
                    [],
                  );
                  removeFromCart(itemId);
                },
                type: "button",
              }
              : {
                text: "Add to Cart",
                onClick: () => {
                  const itemId = generateCartItemId(
                    dishData._id,
                    dishData.portions?.[0]?._id || null,
                    [],
                  );
                  const item = {
                    id: itemId,
                    dish: dishData,
                    portion: dishData.portions?.[0] || null,
                    extras: [],
                    quantity: 1,
                  };
                  addToCart(item);
                },
                type: "button",
              },
            {
              text: "Chat on Whatsapp",
              onClick: handleWhatsAppClick,
              type: "button",
            },
          ]}
        />
      </div>
    </>
  );
}

const OutletItemInfo = memo(MemoOutletItemInfo);
export default OutletItemInfo;
