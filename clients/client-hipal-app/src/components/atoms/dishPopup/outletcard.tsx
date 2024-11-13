import { isEmpty } from "lodash-es";
import PlaceholderImg from "../placeholder";
import type { IDish } from "@/components/types/businessData";
import { memo, useCallback } from "react";
import { cn } from "@hi/common";
import { useCart } from "@/components/store/useCart";
import MemoNotAvailable from "../notAvailable";
import ItemWallpaperCarousel from "../backgroundCarousel/itemBackgroundCarousal";
import IndividualItemDescription from "@/components/organisms/dishDescription/foodDiscription/itemDescription";
import CommonBottomButton from "../bottomButton";
import { BUSINESS_KEYID } from "@/configs";
import { useParams } from "next/navigation";
import { useCartStore } from "@/components/store/useCartStore";
import MemoBottomPopUp from "../bottomPopUp";
import MemoChoosePortions from "@/components/molecules/choosePortions";
import ExtraWithDishWithSelect from "@/components/organisms/dishDescription/extras";
import MemoAlertVariant from "../alertVariant";
import { useBottomPanel } from "@/components/store/useBottomPanel";
import Head from "next/head";

function generateCartItemId(dishId, portionId, extras) {
  const sortedExtras = [...extras]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => `${e.id}:${e.quantity}`)
    .join("|");
  return `${dishId}_${portionId || "no_portion"}_${
    sortedExtras || "no_extras"
  }`;
}

function MemoOutletItemInfo({ dishData }: { dishData: IDish }) {
  const isAvailable = dishData?.availability;
  const customLink = useParams()?.businessId as string;
  const { showCart } = useCart();
  const handleInsideClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
  };

  const {
    openBottomPanel,
    setOpenBottomPanel,
    cartPopup,
    removeFromCart,
    selectedDish,
    selectedPortion,
    selectedChoices,
    addToCart,
    cart,
    resetSelections,
  } = useCartStore();

  const { displayAlert } = useBottomPanel((s) => ({
    displayAlert: s.displayAlert,
  }));

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi, I am interested in this item. Can I know more details?\n\n*Product Name:* ${dishData.name}\n*Dish ID:* ${dishData._id}\n*See the product:* ${BUSINESS_KEYID}${customLink}/${dishData._id}\n*Image Preview:* ${dishData.images[0]}`,
    );

    const whatsappUrl = `https://wa.me/9177914130?text=${message}`;

    window.open(whatsappUrl, "_blank");
  };

  // const handleOpenModal = useCallback(() => {
  //   setOpenBottomPanel(true);
  // }, [setOpenBottomPanel]);

  const closeModal = useCallback(() => {
    setOpenBottomPanel(false);
    resetSelections();
  }, [setOpenBottomPanel]);

  const handleAddToCart = useCallback(() => {
    const item = {
      id: generateCartItemId(
        selectedDish._id,
        selectedPortion?._id || null,
        selectedChoices.map((choice) => ({
          id: choice.id,
          quantity: choice.quantity,
        })),
      ),
      dish: selectedDish,
      portion: selectedPortion,
      extras: selectedChoices,
      quantity: 1,
    };
    addToCart(item);
    closeModal();
  }, [selectedDish, selectedPortion, selectedChoices, addToCart, closeModal]);

  return (
    <>
      <Head>
        <meta property="og:title" content={dishData.name} />
        <meta property="og:description" content={dishData.description} />
        <meta property="og:image" content={dishData.images[0]} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:url"
          content={`${BUSINESS_KEYID}/${customLink}/${dishData._id}`}
        />
        <meta property="og:type" content="website" />
        <title>{dishData.name}</title>
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
          <IndividualItemDescription dishData={dishData} />
        </section>

        {openBottomPanel && selectedDish._id === dishData._id && (
          <MemoBottomPopUp show={openBottomPanel} onClose={closeModal}>
            {cartPopup === "BOTTOM_PANEL" && (
              <div className="relative flex flex-col pb-12 mt-4 overflow-auto z-[103]">
                <div className="flex flex-col h-[70vh] space-y-4 divide-y-2 divide-base-200 text-base-content">
                  <MemoChoosePortions dishData={selectedDish} />
                  <ExtraWithDishWithSelect dishData={selectedDish} />
                  {displayAlert && <MemoAlertVariant />}
                </div>
                <button
                  className="absolute on_active_bounce z-[103] bottom-4 rounded-full text-base-100 bg-primary w-[92%] mx-4 py-1.5"
                  type="button"
                  onClick={handleAddToCart}
                >
                  Add Dish To Cart
                </button>
              </div>
            )}
          </MemoBottomPopUp>
        )}

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
