import React, { memo, useCallback, useState } from "react";
import { GiKnifeFork } from "react-icons/gi";
import CartItem from "./cartItem";
import MemoBottomPopUp from "@/components/atoms/bottomPopUp";
import MemoCallTheWaiterComponent from "@/components/molecules/bottomButton/callTheWaiter";
import useTableData from "@/components/store/useTableData";
import { useLogin } from "@/components/store/useLogin";
import { useDishCart } from "@/components/store/useDishCart";

const Cart = () => {
  const { cartItems } = useDishCart();
  const [callWaiterModal, setCallWaiterModal] = useState(false);
  const tableName = useTableData((s) => s.tableName);
  const { isLogin } = useLogin();
  const openCallWaiterModal = useCallback(() => {
    setCallWaiterModal(true);
  }, [setCallWaiterModal]);

  const closeCallWaiterModal = useCallback(() => {
    setCallWaiterModal(false);
  }, [setCallWaiterModal]);

  return (
    <div className="h-[80vh] min-h-[80vh] overflow-y-auto pb-[5rem]">
        <center className="pt-4 text-2xl text-primary">Bookmark</center>
      &nbsp;
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-[20vh]">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-base-100">
            <GiKnifeFork className="text-4xl text-primary-100" />
          </div>
          <div className="mt-4 text-2xl font-bold">Your cart is empty</div>
        </div>
      ) : (
        <div className="w-full px-4">
          {cartItems.map((cart) => (
            <CartItem key={cart.id} cart={cart} />
          ))}
        </div>
      )}
      {isLogin && tableName && (
        <button
          onClick={openCallWaiterModal}
          type="button"
          className="absolute w-[92%] mx-4 py-3 rounded-full bg-primary bottom-4"
        >
          call waiter
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
