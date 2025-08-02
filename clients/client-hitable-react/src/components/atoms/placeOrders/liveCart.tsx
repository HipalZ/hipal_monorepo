import { memo, useCallback } from "react";
import CommonBottomButton from "../bottomButton";
import { useOrderStore } from "@/components/store/useOrderData";
import { useCartStore } from "@/components/store/useCartStore";
import { useHomeNavigation } from "@/components/hooks/useNavigateHome.ts";
import { HomeIcon } from "lucide-react";

const MemoLiveCart = () => {
  const { setOpenOrderModal, setModalType } = useOrderStore();
  const { goHome } = useHomeNavigation();
  const { cart } = useCartStore();

  const showCart = useCallback(() => {
    setModalType("liveCart");
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CommonBottomButton
      maxWidth="48rem"
      position="mid"
      fixed
      shadow
      buttons={[
        {
          text: " ",
          onClick: goHome,
          icon: <HomeIcon />,
          className: "rounded-md !w-[4rem] pl-2",
        },
        {
          text: "",
          isBackButton: true,
          onClick: () => setOpenOrderModal(false),
          className: "rounded-md pl-2 md:pl-3 !w-[4rem] ml-4",
        },
        {
          text: cart.length > 0 ? `${totalItems} items added` : "View Cart",
          onClick: showCart,
          className: "rounded-md shadow-md",
          highlight: cart.length > 0,
          disable: cart.length === 0,
        },
      ]}
    />
  );
};

const LiveCart = memo(MemoLiveCart);
export default LiveCart;
