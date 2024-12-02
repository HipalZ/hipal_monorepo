import { memo, useMemo } from "react";
import CartItem from "./cartItem";
import useTableData from "@/components/store/useTableData";
import { useCartStore } from "@/components/store/useCartStore";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useCart } from "@/components/store/useCart";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { apiRpc } from "@hi/common";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import CommonBottomButton from "@/components/atoms/bottomButton";

import CartHeader from "./cartHeader";
import CartWarning from "./cartWarning";
import ShareCartButtons from "./shareCartButtons";
import EmptyCart from "./emptyCart";
import HistoryCartItems from "./historyItem";

const Cart = () => {
  const { cart } = useCartStore();
  const { setShowCart, showHistory, setShowHistory } = useCart();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const tableName = useTableData((state) => state.tableName);
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

  const placeOrder = async () => {
    if (!accessToken) {
      setDirection("category");
      router.push(`/${customLink}/user/signup`);
      return;
    }
    if (!tableName && outletInfo?.outLetType !== "OTHER") {
      setDirection("category");
      toast.error("Please scan qr");
      router.push(`/${customLink}/scan`);
      return;
    }

    try {
      const response = await apiRpc.cart.create.$post({
        json: {
          businessId: outletInfo?.businessId,
          userId: userDetails?._id,
          tableName,
          cart: sanitizedCart,
        },
      });
      const res = await response.json();

      if (!res.err) {
        toast.success("Cart shared successfully");
        setShowCart(false);
        useCartStore.setState({ cart: [] });
      } else {
        toast.error(res.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("An error occurred while placing the order");
    }
  };

  return (
    <div className="h-[100dvh] overflow-y-auto pb-[5rem] text-primary bg-base-100 relative">
      <CartHeader />
      {showHistory ? (
        <div className="w-full px-4">
          <HistoryCartItems />
        </div>
      ) : cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="w-full px-4">
          {cart.map((cartItem) => (
            <CartItem key={cartItem.id} cartItem={cartItem} />
          ))}
        </div>
      )}
      {outletInfo?.outLetType !== "OTHER" && <CartWarning />}
      {cart.length > 0 && outletInfo?.outLetType === "OTHER" && (
        <ShareCartButtons />
      )}

      {tableName && outletInfo?.outLetType !== "OTHER" && (
        <CommonBottomButton
          fixed
          buttons={
            cart.length > 0 && !showHistory
              ? [
                  {
                    text: "Order more",
                    onClick: () => setShowCart(false),
                    type: "button",
                  },
                  {
                    text: "Share The Cart",
                    onClick: placeOrder,
                    type: "button",
                  },
                ]
              : cart.length > 0 && showHistory
                ? [
                    {
                      text: "Back",
                      onClick: () => setShowHistory(false),
                      type: "button",
                    },
                  ]
                : [
                    {
                      text: "Order more",
                      onClick: () => setShowCart(false),
                      type: "button",
                    },
                  ]
          }
        />
      )}
    </div>
  );
};

const MemoCart = memo(Cart);
export default MemoCart;
