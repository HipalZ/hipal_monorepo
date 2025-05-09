import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { apiRpc } from "@hi/common";
import { cn } from "@/components/utils/helpers";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";
import { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PiArrowBendUpLeftBold } from "react-icons/pi";
import { toast } from "react-toastify";
import { useCallTheCaptain } from "@/components/hooks/useCartHook";
import { useCart } from "@/components/store/useCart";
import { useCartStore } from "@/components/store/useCartStore";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useUserToken } from "@hi/common/src/useUserToken";
import dynamic from "next/dynamic";
import glassTable from "@/assets/cart/glassTable.png";
import Image from "next/image";
import LoadingSpinner from "@/components/atoms/progressBar/loadingSpinner";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useTableData, {
  resetTableData,
  type HiCodeUser,
} from "@/components/store/useTableData";
import { BsHandIndexThumb } from "react-icons/bs";

const ConfirmPayment = dynamic(() => import("./confirmPayment"), {
  ssr: false,
});
const EmptyCart = dynamic(() => import("./emptyCart"), { ssr: false });
const PaymentAlert = dynamic(() => import("./paymentAlert"), { ssr: false });
const CartPayment = dynamic(() => import("./cartPayment"), { ssr: false });
const SwipeToPlaceOrder = dynamic(() => import("./swipeToPlaceOrder"));
const CartItem = dynamic(() => import("./cartItem"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const CommonBottomButton = dynamic(
  () => import("@/components/atoms/bottomButton"),
  { ssr: false },
);
const CartWarning = dynamic(() => import("./cartWarning"), { ssr: false });
const ShareCartButtons = dynamic(() => import("./shareCartButtons"), {
  ssr: false,
});
// const HistoryCartItems = dynamic(() => import("./historyItem"), { ssr: false });
const ItemDescriptionPopup = dynamic(
  () => import("@/components/atoms/dishDescription/itemDescription"),
  { ssr: false },
);
const HiCodeValidate = dynamic(() => import("./hicodeValidate"), {
  ssr: false,
});
const Orders = dynamic(() => import("./orders"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const Cart = () => {
  const { cart, cartHistory } = useCartStore();
  const { mutate, isPending } = useCallTheCaptain();
  const outLetInfo = _useAllBusiness((state) => state.data.outletInfo);
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId);
  const {
    setShowCart,
    cartPage,
    setCartPage,
    setInputModal,
    setOrderPlaced,
    setHiCodePopupBeforeBill,
    hiCodePopupBeforeBill,
  } = useCart();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const [showPayAlert, setShowPayAlert] = useState<boolean>(false);
  const {
    tableName,
    setHiCode,
    hiCode,
    setHiCodePopup,
    hiCodePopup,
    setHiCodeUser,
    setTableName,
  } = useTableData();
  const { setCheckLogin } = usePaymentStore();
  const accessToken = useUserToken.getState().accessToken;
  const userDetails = useLogin((state) => state.userDetails);
  const router = useRouter();
  const setDirection = useLogin((s) => s.setDirection);
  const customLink = useParams()?.businessId as string;
  // const { placeOrder } = usePlaceOrder();

  const sanitizedCart = useMemo(() => {
    return cart.map(({ dish, ...item }) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = dish;
      return { ...item, dish: sanitizedDish };
    });
  }, [cart]);

  const payPopCorn = useCallback(() => {
    setInputModal(true);
  }, [setInputModal]);

  const triggerCallWaiter = useCallback(() => {
    setDirection("category");
    if (!tableName) {
      return router.push(`/${customLink}/scan`);
    }
    if (!accessToken) {
      setCheckLogin(true);
      return;
    }
    const payload = {
      businessId: businessId,
      tableName: tableName,
      message: "I need help",
      alertType: "WAITER",
      status: "WAITER",
      name: userDetails?.name || "user",
      userId: userDetails._id,
    };

    mutate(payload);
  }, [setDirection, accessToken, router, customLink, tableName]);

  const triggerModal = useCallback(() => {
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
      setShowCart(false);
      useCartStore.setState({ cart: [] });
    }, 5000);
  }, [setOrderPlaced, setShowCart]);

  const placeOrder = useCallback(async () => {
    if (!accessToken) {
      setCheckLogin(true);
      return;
    }
    const handleUnauthenticatedUser = () => {
      setDirection("category");
      setCheckLogin(true);
    };

    const handleMissingTableName = () => {
      setDirection("category");
      toast.error("Please scan QR");
      router.push(`/${customLink}/scan`);
    };

    const handleApiResponse = async (
      response,
      successMessage,
      errorMessage,
    ) => {
      try {
        const res = await response.json();
        if (response.status === 200 || response.status === 201) {
          if (successMessage?.length > 0) {
            toast.success(successMessage);
          }
          setShowCart(true);
          triggerModal();
          setHiCode(res?.data?.hiCode || null);
          return true;
        }
        if (response.status === 401) {
          resetTableData();
        }
        if (response.status === 409) {
          toast.error(res?.message);
          setTableName(res?.data?.data?.tableName);
          setHiCode(res?.data?.data?.hiCode);
        }
        if (response.status === 403) {
          setHiCodeUser(res?.data as HiCodeUser);
          setHiCodePopup(true);
        } else {
          toast.error(res?.message || errorMessage || "Order failed");
        }
      } catch (error) {
        console.error("Error processing response:", error);
        toast.error("An error occurred while processing the response");
      }
      return false;
    };

    if (!accessToken) {
      handleUnauthenticatedUser();
      return;
    }

    if (!tableName && outletInfo?.outLetType !== "OTHER") {
      handleMissingTableName();
      return;
    }

    if (outletInfo?.isPosEnabled) {
      try {
        const response = await apiRpc.pos.save_kot.$post({
          json: {
            tableName,
            businessId: outletInfo?.businessId,
            internalCart: sanitizedCart,
            customerName: userDetails?.name || "Guest",
            customerPhone: userDetails?.phone,
            hiCode: hiCode || "",
          },
        });
        await handleApiResponse(response, "", "Failed to place order");
      } catch (error) {
        console.error("Error placing POS order:", error);
      }
    } else {
      try {
        const response = await apiRpc.cart.create.$post({
          json: {
            businessId: outletInfo?.businessId,
            userId: userDetails?._id,
            tableName,
            cart: sanitizedCart,
            name: userDetails?.name || "Guest",
            phone: userDetails?.phone,
          },
        });
        await handleApiResponse(
          response,
          "Cart shared successfully",
          "Failed to share cart",
        );
      } catch (error) {
        console.error("Error placing non-POS order:", error);
        toast.error("An error occurred while placing the non-POS order");
      }
    }
  }, [
    accessToken,
    setDirection,
    router,
    customLink,
    tableName,
    outletInfo,
    sanitizedCart,
    userDetails,
    setHiCode,
    setShowCart,
    setHiCodeUser,
    setHiCodePopup,
    triggerModal,
    setCheckLogin,
    hiCode,
  ]);

  const payBill = useCallback(() => {
    setShowPayAlert(true);
  }, [setShowPayAlert]);

  const getBottomButtons = useMemo(() => {
    if (!tableName || outletInfo?.outLetType === "OTHER") {
      return [];
    }

    if (cartPage === "cart") {
      if (cart.length > 0) {
        return [
          {
            text: "Place Order",
            onClick: placeOrder,
            type: "button" as const,
            highlight: true,
          },
        ];
      }
      return [
        {
          text: "Order more",
          onClick: () => setShowCart(false),
          type: "button" as const,
        },
      ];
    }

    if (cartPage === "order") {
      return cartHistory && cartHistory.length > 0
        ? [
            {
              text: "Pay Bill",
              onClick: payBill,
              type: "button" as const,
            },
          ]
        : [
            {
              text: "Order more",
              onClick: () => setShowCart(false),
              type: "button" as const,
            },
          ];
    }

    if (cartPage === "history") {
      return [
        {
          text: "Back",
          onClick: () => setCartPage("cart"),
          type: "button" as const,
        },
      ];
    }

    if (cartPage === "confirmPayment") {
      return [
        {
          text: "Pay Bill",
          onClick: payBill,
          type: "button" as const,
        },
      ];
    }

    return [];
  }, [
    tableName,
    outletInfo?.outLetType,
    cartPage,
    cart.length,
    placeOrder,
    payBill,
    setCartPage,
    setShowCart,
  ]);

  const getButtonForPopcorn = useMemo(() => {
    if (!tableName || outletInfo?.outLetType === "OTHER") {
      return [];
    }
    if (cartPage === "cart") {
      if (cart.length > 0) {
        return outLetInfo?.shareCart
          ? [
              {
                text: "Share Cart",
                onClick: placeOrder,
                type: "button" as const,
              },
            ]
          : [
              {
                text: "Back to Menu",
                onClick: () => setShowCart(false),
                type: "button" as const,
                isLoading: isPending,
              },
              {
                text: "Need Help?",
                onClick: triggerCallWaiter,
                type: "button" as const,
                isLoading: isPending,
              },
            ];
      }
      return [
        {
          text: "Order more",
          onClick: () => setShowCart(false),
          type: "button" as const,
          isLoading: isPending,
        },
        {
          text: "Need Help?",
          onClick: triggerCallWaiter,
          type: "button" as const,
          isLoading: isPending,
        },
      ];
    }
    if (cartPage === "order") {
      return [
        {
          text: "Pay Bill",
          onClick: payPopCorn,
          type: "button" as const,
        },
      ];
    }

    if (cartPage === "history") {
      return [
        {
          text: "Back",
          onClick: () => setCartPage("cart"),
          type: "button" as const,
        },
      ];
    }
  }, [
    tableName,
    outletInfo?.outLetType,
    cartPage,
    cart.length,
    payPopCorn,
    payBill,
    setCartPage,
    setShowCart,
  ]);

  const handleBack = useCallback(() => {
    if (cartPage === "cart") {
      setShowCart(false);
    } else {
      setCartPage("cart");
    }
  }, [cartPage, setShowCart, setCartPage]);

  return (
    <div
      className={cn(
        "overflow-y-auto h-[100dvh] hide-scrollbar text-[#000000] bg-[#ffffff] relative",
      )}
    >
      {cartPage === "cart" && (
        <section className="relative h-[calc(91dvh+5px)]">
          <div className="bg-white z-[500] sticky top-0 flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <article className="flex items-center gap-2">
              {outletInfo?.outLetType === "OTHER" || outletInfo?.shareCart ? (
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  className="px-2 rounded-xl bg-[#000000] text-[#ffffff] on_active_bounce"
                >
                  <FaArrowLeft
                    size={28}
                    className="p-2 rounded-full cursor-pointer text-[#ffffff]"
                  />
                </button>
              ) : null}
              <h2 className="text-2xl font-medium">Live cart</h2>
            </article>
            {hiCode && (
              <div className="!text-sm text-black inline-flex items-center gap-2">
                <Image src={glassTable} alt="Table" />
                <span>code {hiCode}</span>
              </div>
            )}
            <article className="flex items-center text-black">
              <MdOutlineShoppingCart size={24} />
              <span className="text-sm">{cart?.length} items</span>
            </article>
          </div>
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex-1 divide-y divide-gray-100">
              {cart?.length > 0 ? (
                cart?.map((cartItem) => (
                  <CartItem key={cartItem.id} cartItem={cartItem} />
                ))
              ) : (
                <EmptyCart />
              )}
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200">
              {outletInfo?.isPosEnabled && outletInfo?.noPlaceOrderButton ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full p-2 mt-auto mb-2 text-sm text-center text-rose-600 bg-rose-50"
                >
                  Orders once placed, cannot be cancelled!
                </motion.div>
              ) : null}
              {/* Cart Info */}
              {outletInfo?.isPosEnabled ? (
                <div className="flex items-center gap-3 px-2">
                  <button
                    onClick={handleBack}
                    type="button"
                    className="h-12 w-16 px-4 py-1 border border-[#CACACA] rounded-lg text-center"
                  >
                    <PiArrowBendUpLeftBold size={24} />
                  </button>

                  {!outletInfo?.noPlaceOrderButton ? (
                    <motion.button
                      type="button"
                      className={cn(
                        "w-full flex justify-center items-center gap-2 py-3 rounded-lg border border-gray-300", // ensure full width & good spacing
                        "text-sm font-medium text-white bg-black shadow-sm",
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={triggerCallWaiter}
                    >
                      <BsHandIndexThumb size={20} />
                      <span>Call Captain</span>
                    </motion.button>
                  ) : (
                    <SwipeToPlaceOrder
                      placeOrder={placeOrder}
                      disabled={cart?.length === 0}
                    />
                  )}
                </div>
              ) : (
                <CommonBottomButton
                  fixed
                  buttons={
                    outletInfo?.isPosEnabled
                      ? getBottomButtons ?? []
                      : getButtonForPopcorn ?? []
                  }
                />
              )}
            </div>
          </div>
        </section>
      )}
      {cartPage === "order" && <Orders />}

      {cartPage === "payment" && <CartPayment />}

      {cartPage === "confirmPayment" && <ConfirmPayment />}

      {outletInfo?.outLetType !== "OTHER" && <CartWarning />}

      {cart.length > 0 && outletInfo?.outLetType === "OTHER" && (
        <ShareCartButtons />
      )}
      {hiCodePopup && (
        <ItemDescriptionPopup
          show={hiCodePopup}
          onClose={() => setHiCodePopup(false)}
          bottomCross
        >
          <HiCodeValidate placeOrder={placeOrder} />
        </ItemDescriptionPopup>
      )}

      {showPayAlert && (
        <ItemDescriptionPopup
          show={showPayAlert}
          onClose={() => setShowPayAlert(false)}
        >
          <PaymentAlert onClick={() => setShowPayAlert(false)} />
        </ItemDescriptionPopup>
      )}

      {tableName &&
        outletInfo?.outLetType !== "OTHER" &&
        cartPage === "history" && (
          <CommonBottomButton
            fixed
            buttons={
              outletInfo?.isPosEnabled
                ? getBottomButtons ?? []
                : getButtonForPopcorn ?? []
            }
          />
        )}
    </div>
  );
};

const MemoCart = memo(Cart);
export default MemoCart;
