"use client";

import CommonBottomButton from "@/components/atoms/bottomButton";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import MemoizedCartItem from "@/components/organisms/cart/cartItem";
import { updateTheme } from "@/components/utils/themes";
import { BUSINESS_KEYID } from "@/configs";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

const CartPage = () => {
  const { businessId: customLink, cartId } = useParams();
  const router = useRouter();
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

  const fetchCart = async () => {
    const response = await apiRpc.cart[":id"].$get({
      param: {
        id: cartId,
      },
    });

    const res = await response.json();
    return res.data || {};
  };

  const { isLoading: settingsLoading } = useQuery({
    queryKey: ["businessSettings", customLink],
    queryFn: fetchSettings,
    enabled: !!customLink,
  });

  const { isLoading: cartLoading, data } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: fetchCart,
    enabled: !!cartId,
  });

  const goToExplore = () => {
    router.push(`/${customLink}/explore`);
  };

  if (settingsLoading || cartLoading) {
    return <LoadingSpinnerCircle />;
  }

  return (
    <div className="w-full max-w-[30rem] mx-auto h-screen px-4 overflow-auto bg-base-100 text-base-content">
      <header className="w-full mt-4 text-2xl font-semibold text-center">
        Cart
      </header>
      {data?.cart.map((cartItem) => (
        <MemoizedCartItem hide key={cartItem.id} cartItem={cartItem} />
      ))}
      <CommonBottomButton
        fixed
        buttons={[
          {
            text: "Explore more",
            onClick: goToExplore,
          },
          {
            text: "Chat on WatsApp",
            onClick: () => {
              const message = encodeURIComponent(
                `Hi, I am interested in this item. Can I know more details?\n*See the product:* ${BUSINESS_KEYID}${customLink}/cart/${cartId}`,
              );

              const whatsappUrl = `https://wa.me/8668229890?text=${message}`;

              window.open(whatsappUrl, "_blank");
            },
          },
        ]}
      />
    </div>
  );
};

export default CartPage;
