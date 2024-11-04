import React, { memo, useCallback, useState } from "react";
import { GiKnifeFork } from "react-icons/gi";
import CartItem from "./cartItem";
import MemoBottomPopUp from "@/components/atoms/bottomPopUp";
import MemoCallTheWaiterComponent from "@/components/molecules/bottomButton/callTheWaiter";
import useTableData from "@/components/store/useTableData";
import { useCartStore } from "@/components/store/useCartStore";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useCart } from "@/components/store/useCart";
import { BiArrowBack } from "react-icons/bi";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const Cart = () => {
  const { cart } = useCartStore();
  const { setShowCart } = useCart();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const [callWaiterModal, setCallWaiterModal] = useState(false);
  const tableName = useTableData((s) => s.tableName);
  const accessToken = useUserToken.getState().accessToken;

  const openCallWaiterModal = useCallback(() => {
    console.log("openCallWaiterModal");
    setCallWaiterModal(true);
  }, []);

  const closeCallWaiterModal = useCallback(() => {
    setCallWaiterModal(false);
  }, []);
  console.log(cart);

  return (
    <div className="h-[100dvh] overflow-y-auto pb-[5rem] text-primary bg-base-100 relative">
      <section className="sticky top-0 z-50 pb-4 bg-base-100">
        <button
          type="button"
          onClick={() => setShowCart(false)}
          className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-primary bg-base-300"
        >
          <BiArrowBack />
        </button>
        <center className="pt-4 text-2xl text-primary">Cart</center>
      </section>
      &nbsp;
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-[20vh]">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-base-100">
            <GiKnifeFork className="text-4xl text-primary-100" />
          </div>
          <div className="mt-4 text-2xl font-bold">Your cart is empty</div>
        </div>
      ) : (
        <div className="w-full px-4">
          {cart.map((cartItem) => (
            <CartItem key={cartItem.id} cartItem={cartItem} />
          ))}
        </div>
      )}
      {accessToken && tableName && outletInfo?.outLetType !== "OTHER" && (
        <button
          onClick={openCallWaiterModal}
          type="button"
          className="fixed w-[92%] mx-4 py-3 rounded-full bg-primary bottom-4 text-base-100"
        >
          Call Captain
        </button>
      )}
      {callWaiterModal && (
        <MemoBottomPopUp show={callWaiterModal} onClose={closeCallWaiterModal}>
          <MemoCallTheWaiterComponent onClose={closeCallWaiterModal} />
        </MemoBottomPopUp>
      )}
    </div>
  );
};

const MemoCart = memo(Cart);
export default MemoCart;
