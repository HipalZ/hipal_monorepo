"use client";

import CommonBottomButton from "@/components/atoms/bottomButton";
import type { CommonProps } from "../../organisms/cart/CartButtons";

const OtherButtons = ({
  cartPage,
  cart,
  onOtherShareCart,
  onTriggerWaiter,
  onPayPopcorn,
  setShowCart,
  setCartPage,
  shareCart,
  isPending,
}: CommonProps) => {
  if (cartPage === "cart") {
    if (cart.length > 0) {
      if (shareCart) {
        return (
          <CommonBottomButton
            buttons={[
              {
                text: "Share Cart",
                onClick: onOtherShareCart!,
                type: "button",
                isLoading: isPending,
              },
            ]}
          />
        );
      }
      return (
        <CommonBottomButton
          buttons={[
            {
              text: "Back",
              onClick: () => setShowCart(false),
              type: "button",
              isLoading: isPending,
            },
            {
              text: "Need Help?",
              onClick: onTriggerWaiter,
              type: "button",
              isLoading: isPending,
            },
          ]}
        />
      );
    }
    return (
      <CommonBottomButton
        buttons={[
          {
            text: "Continue",
            onClick: () => setShowCart(false),
            type: "button",
            isLoading: isPending,
          },
          {
            text: "Need Help?",
            onClick: onTriggerWaiter,
            type: "button",
            isLoading: isPending,
          },
        ]}
      />
    );
  }

  if (cartPage === "order") {
    return (
      <CommonBottomButton
        buttons={[{ text: "Pay", onClick: onPayPopcorn, type: "button" }]}
      />
    );
  }

  if (cartPage === "history") {
    return (
      <CommonBottomButton
        buttons={[
          { text: "Back", onClick: () => setCartPage("cart"), type: "button" },
        ]}
      />
    );
  }

  return null;
};

export default OtherButtons;
