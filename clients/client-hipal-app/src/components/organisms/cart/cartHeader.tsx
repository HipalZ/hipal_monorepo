import LoadingSpinnerCircle from "@/components/atoms/loader";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCart } from "@/components/store/useCart";
import {
  type ICartHistory,
  useCartStore,
} from "@/components/store/useCartStore";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback } from "react";
import { BiArrowBack } from "react-icons/bi";

const MemoCartHeader = () => {
  const { setShowCart, cartPage, setCartPage } = useCart();
  const { setCartHistory } = useCartStore();
  const userDetails = useLogin((state) => state.userDetails);
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const tableName = useTableData((state) => state.tableName);

  const handleBack = useCallback(() => {
    switch (cartPage) {
      case "cart":
        setShowCart(false);
        break;
      case "history":
        setCartPage("cart");
        break;
      case "order":
        setShowCart(false);
        break;
      case "payment":
        setCartPage("order");
        break;
      default:
        setShowCart(false);
    }
  }, [cartPage, setCartPage, setShowCart]);

  const getOrderByTable = async () => {
    const response = await apiRpc.cart.cartByUser[":userId"].$get({
      param: { userId: userDetails?._id },
      query: {
        businessId: outletInfo?.businessId || "",
        tableName,
      },
    });
    const res = await response.json();
    const cartData = res.data as ICartHistory[];
    setCartHistory(cartData);
    return res;
  };

  const getOrderFromPos = async () => {
    const response = await apiRpc.pos.fetch_kot_by_table.$get({
      query: {
        businessId: outletInfo?.businessId || "",
        tableName,
        userId: userDetails?._id
      },
    });
    const res = await response.json();
    const cartData = res.data as ICartHistory[];
    setCartHistory(cartData);
    return res;
  };

  const { isLoading } = useQuery({
    queryKey: ["cart", userDetails?._id, outletInfo?.businessId, tableName],
    queryFn: getOrderByTable,
    enabled: cartPage === "history",
    staleTime: 1000 * 30,
  });

  const { isLoading: isLoadingPos } = useQuery({
    queryKey: ["pos", userDetails?._id, outletInfo?.businessId, tableName],
    queryFn: getOrderFromPos,
    enabled: cartPage === "order",
    staleTime: 1000 * 30,
  });

  const cartHeading = useCallback(() => {
    switch (cartPage) {
      case "cart":
        return "Cart";
      case "history":
        return "History";
      case "order":
        return "Orders";
      case "payment":
        return "Payment";
      default:
        return "Cart";
    }
  }, [cartPage]);

  if (isLoading || isLoadingPos) {
    return <LoadingSpinnerCircle />;
  }

  return (
    <section className="sticky top-0 z-50 pb-4 bg-[#ffffff]">
      <button
        type="button"
        onClick={handleBack}
        className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-[#ffffff] bg-[#000000]"
      >
        <BiArrowBack />
      </button>
      <center className="pt-4 text-2xl text-[#000000]">{cartHeading()}</center>
    </section>
  );
};

const CartHeader = memo(MemoCartHeader);
export default CartHeader;
