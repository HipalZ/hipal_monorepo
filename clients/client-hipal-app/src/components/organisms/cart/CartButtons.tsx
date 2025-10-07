import type { FC } from "react";
import MenuPosButtons from "../../molecules/bottomButton/MenuPosButtons";
import MenuShareButtons from "../../molecules/bottomButton/MenuShareButtons";
import OtherButtons from "../../molecules/bottomButton/OtherButtons";
import JewelleryButtons from "../../molecules/bottomButton/JewelleryButtons";

export type Page = "cart" | "order" | "history";
export type OutletType = "MENU" | "RESTAURANT" | "OTHER" | "JEWELLERY";

export type CommonProps = {
  cartPage: Page;
  cart: any[];
  cartHistory: any[];
  isPending?: boolean;
  // common handlers
  onBack: () => void;
  onTriggerWaiter: () => void;
  onPayPopcorn: () => void;
  setShowCart: (b: boolean) => void;
  setCartPage: (p: Page) => void;

  // flow-specific handlers
  onMenuPosPlaceOrder?: () => void; // MENU/RESTAURANT + POS
  onMenuShareCart?: () => void; // MENU/RESTAURANT non-POS
  onOtherShareCart?: () => void; // OTHER
  onJewelleryShareSelection?: () => void; // JEWELLERY

  // extra data
  shareCart?: boolean;
  placeOrderButton?: boolean; // swipe vs captain (POS-only)
};

const Buttons: FC<
  CommonProps & {
    outletType: OutletType;
    isPosEnabled?: boolean;
  }
> = ({ outletType, isPosEnabled, ...rest }) => {
  if (outletType === "MENU" || outletType === "RESTAURANT") {
    if (isPosEnabled) {
      return <MenuPosButtons {...rest} />;
    }
    return <MenuShareButtons {...rest} />;
  }

  if (outletType === "JEWELLERY") {
    return <JewelleryButtons {...rest} />;
  }

  // fallback: OTHER
  return <OtherButtons {...rest} />;
};

export default Buttons;
