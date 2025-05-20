"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { BUSINESS_KEYID } from "@/configs";
import CommonBottomButton from "@/components/atoms/bottomButton";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import MemoizedCartItem from "@/components/organisms/cart/cartItem";
import CountdownTimer from "@/components/atoms/timer";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const CartPage = () => {
  const { businessId: customLink, cartId } = useParams();
  const router = useRouter();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);

  const fetchSettings = async () => {
    const response = await apiRpc.businesses.business_theme[":customLink"].$get(
      {
        param: { customLink },
      },
    );
    const res = await response.json();
    return res.data || {};
  };

  const fetchCart = async () => {
    const response = await apiRpc.cart[":id"].$get({
      param: { id: cartId },
    });
    const res = await response.json();
    if (res.err) {
      throw new Error(res.message || "Failed to fetch cart");
    }
    return res.data || {};
  };

  const { isLoading: settingsLoading } = useQuery({
    queryKey: ["businessSettings", customLink],
    queryFn: fetchSettings,
    enabled: !!customLink,
  });

  const {
    isLoading: cartLoading,
    data: cartData,
    isError: cartError,
    error: cartErrorMessage,
  } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: fetchCart,
    enabled: !!cartId,
  });

  const goToExplore = useCallback(() => {
    router.push(`/${customLink}/explore`);
  }, [router, customLink]);

  // Handle Loading State
  if (settingsLoading || cartLoading) {
    return <LoadingSpinnerCircle />;
  }

  if (cartError || !cartData) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen max-w-[30rem] px-4 mx-auto text-base-content bg-base-100">
        <div className="mt-8 text-lg text-center">Time limit exceeded</div>
        <CommonBottomButton
          fixed={false}
          buttons={[{ text: "Explore more", onClick: goToExplore }]}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen max-w-[30rem] pb-[5rem] px-4 mx-auto text-base-content bg-base-100">
      <header className="pt-4 text-2xl font-semibold text-center">Cart</header>

      <CountdownTimer startTime={cartData?.date} />

      {cartData?.cart?.length > 0 ? (
        cartData.cart.map((cartItem) => (
          <MemoizedCartItem hide key={cartItem.id} cartItem={cartItem} />
        ))
      ) : (
        <div className="mt-8 text-lg text-center">Your cart is empty</div>
      )}

      <CommonBottomButton
        fixed
        maxWidth="30rem"
        buttons={[
          { text: "Explore more", onClick: goToExplore },
          {
            text: "Chat on WhatsApp",
            onClick: () => {
              const message = encodeURIComponent(
                `Hi, I am interested in this item. Can I know more details?\n*See the cart:* ${BUSINESS_KEYID}/${customLink}/cart/${cartId}`,
              );
              const whatsappUrl = `https://wa.me/+91${outletInfo?.phone}?text=${message}`;
              window.open(whatsappUrl, "_blank");
            },
          },
        ]}
      />
    </div>
  );
};

export default CartPage;
