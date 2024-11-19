import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCart } from "@/components/store/useCart";
import {
  type ICartHistory,
  useCartStore,
} from "@/components/store/useCartStore";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import { memo } from "react";
import { BiArrowBack } from "react-icons/bi";

const MemoCartHeader = () => {
  const { setShowCart, showHistory, setShowHistory } = useCart();

  const { setCartHistory } = useCartStore();
  const userDetails = useLogin((state) => state.userDetails);
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const tableName = useTableData((state) => state.tableName);
  const handleBack = () => {
    if (showHistory) {
      setShowHistory(false);
    } else {
      setShowCart(false);
    }
  };

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

  const showHistoryFn = () => {
    if (showHistory) {
      return setShowHistory(false);
    }
    getOrderByTable();
    setShowHistory(true);
  };
  return (
    <section className="sticky top-0 z-50 pb-4 bg-base-100">
      <button
        type="button"
        onClick={handleBack}
        className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-base-100 bg-primary"
      >
        <BiArrowBack />
      </button>
      <center className="pt-4 text-2xl text-primary">
        {showHistory ? "History" : "Cart"}
      </center>
      {outletInfo?.outLetType !== "OTHER" && (
        <button
          type="button"
          onClick={showHistoryFn}
          className="top-4 right-4 py-2 rounded-full absolute z-[60] px-4 text-base-100 bg-primary text-xs"
        >
          {!showHistory ? "History" : "Cart"}
        </button>
      )}
    </section>
  );
};

const CartHeader = memo(MemoCartHeader);
export default CartHeader;
