import type { FC } from "react";
import CommonBottomButton from "@/components/atoms/bottomButton";
import type { CommonProps } from "../../organisms/cart/CartButtons";

const JewelleryButtons = ({
  cartPage,
  cart,
  onJewelleryShareSelection,
  onTriggerWaiter,
  onPayPopcorn,
  setShowCart,
  setCartPage,
  isPending,
}: CommonProps) => {
  if (cartPage === "cart") {
    if (cart.length > 0) {
      return (
        <CommonBottomButton
          buttons={[
            {
              text: "Share Selection",
              onClick: onJewelleryShareSelection!,
              type: "button",
              isLoading: isPending,
            },
            {
              text: "Need Assistance?",
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
            text: "Browse More",
            onClick: () => setShowCart(false),
            type: "button",
            isLoading: isPending,
          },
          {
            text: "Need Assistance?",
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
        buttons={[
          { text: "Proceed to Pay", onClick: onPayPopcorn, type: "button" },
        ]}
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

export default JewelleryButtons;
