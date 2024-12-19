import { memo, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import useTableData, { type HiCodeUser } from "@/components/store/useTableData";
import { useCartStore } from "@/components/store/useCartStore";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useCart } from "@/components/store/useCart";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { apiRpc } from "@hi/common";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import PaymentAlert from "./paymentAlert";
import CartPayment from "./cartPayment";

const CartItem = dynamic(() => import("./cartItem"), { ssr: false });
const CommonBottomButton = dynamic(
  () => import("@/components/atoms/bottomButton"),
  { ssr: false },
);
const CartHeader = dynamic(() => import("./cartHeader"), { ssr: false });
const CartWarning = dynamic(() => import("./cartWarning"), { ssr: false });
const ShareCartButtons = dynamic(() => import("./shareCartButtons"), {
  ssr: false,
});
const EmptyCart = dynamic(() => import("./emptyCart"), { ssr: false });
const HistoryCartItems = dynamic(() => import("./historyItem"), { ssr: false });
const ItemDescriptionPopup = dynamic(
  () => import("@/components/atoms/dishDescription/itemDescription"),
  { ssr: false },
);
const HiCodeValidate = dynamic(() => import("./hicodeValidate"), {
  ssr: false,
});
const Orders = dynamic(() => import("./orders"), { ssr: false });

const Cart = () => {
  const { cart, cartHistory } = useCartStore();
  const { setShowCart, cartPage, setCartPage, setInputModal } = useCart();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const [showPayAlert, setShowPayAlert] = useState<boolean>(false);
  const {
    tableName,
    setHiCode,
    hiCode,
    setHiCodePopup,
    hiCodePopup,
    setHiCodeUser,
  } = useTableData();
  const accessToken = useUserToken.getState().accessToken;
  const userDetails = useLogin((state) => state.userDetails);
  const router = useRouter();
  const setDirection = useLogin((s) => s.setDirection);
  const customLink = useParams()?.businessId as string;

  const sanitizedCart = useMemo(() => {
    return cart.map(({ dish, ...item }) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = dish;
      return { ...item, dish: sanitizedDish };
    });
  }, [cart]);

  const payPopCorn = useCallback(() => {
    setInputModal(true);
  }, [setInputModal]);

  const placeOrder = useCallback(async () => {
    const handleUnauthenticatedUser = () => {
      setDirection("category");
      router.push(`/${customLink}/user/signup`);
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
          toast.success(successMessage);
          setHiCode(res?.data?.hiCode || null);
          setShowCart(false);
          useCartStore.setState({ cart: [] });
          return true;
        } else if (response.status === 403) {
          setHiCodeUser(res?.data as HiCodeUser);
          setHiCodePopup(true);
        } else {
          toast.error(errorMessage || "Order failed");
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
        await handleApiResponse(
          response,
          "Order placed successfully",
          "Order failed",
        );
      } catch (error) {
        console.error("Error placing POS order:", error);
        toast.error("An error occurred while placing the POS order");
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
        return [
          {
            text: "Share Cart",
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
              onClick: payPopCorn,
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

  return (
    <div className="h-[100dvh] overflow-y-auto pb-[5rem] text-[#000000] bg-[#ffffff] relative">
      <CartHeader />
      {hiCode && (
        <div className="flex items-center justify-center h-12 text-white bg-[#ffffff]">
          <p>Code: {hiCode}</p>
        </div>
      )}

      {cartPage === "cart" &&
        (cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="w-full px-4">
            {cart.map((cartItem) => (
              <CartItem key={cartItem.id} cartItem={cartItem} />
            ))}
          </div>
        ))}

      {cartPage === "history" && (
        <div className="w-full px-4">
          <HistoryCartItems />
        </div>
      )}
      {cartPage === "order" && (
        <div className="w-full px-4">
          <Orders />
        </div>
      )}

      {cartPage === "payment" && <CartPayment />}

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
          bottomCross
        >
          <PaymentAlert onClick={() => setShowPayAlert(false)} />
        </ItemDescriptionPopup>
      )}

      {tableName && outletInfo?.outLetType !== "OTHER" && (
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
