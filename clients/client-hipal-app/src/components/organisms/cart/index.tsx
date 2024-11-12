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
import { apiRpc } from "@hi/common";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BUSINESS_KEYID } from "@/configs";
import CommonBottomButton from "@/components/atoms/bottomButton";

const Cart = () => {
  const { cart, setCartEmpty } = useCartStore();
  const { setShowCart } = useCart();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const [callWaiterModal, setCallWaiterModal] = useState(false);
  const tableName = useTableData((s) => s.tableName);
  const accessToken = useUserToken.getState().accessToken;
  const userDetails = useLogin((s) => s.userDetails);
  const router = useRouter();
  const customLink = useParams()?.businessId as string;

  const openCallWaiterModal = useCallback(() => {
    setCallWaiterModal(true);
  }, []);

  const closeCallWaiterModal = useCallback(() => {
    setCallWaiterModal(false);
  }, []);

  const generateCartLink = useCallback(async () => {
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
      return null;
    }

    const sanitizedCart = cart.map((item) => {
      const { recommendationIds, ...sanitizedDish } = item.dish;
      return {
        ...item,
        dish: sanitizedDish,
      };
    });

    try {
      const response = await apiRpc.cart.create.$post({
        json: {
          businessId: outletInfo?.businessId,
          userId: userDetails?._id,
          cart: sanitizedCart,
        },
      });
      const res = await response.json();

      if (!res.err) {
        return `${BUSINESS_KEYID}${customLink}/cart/${res.data.cartID}`;
      } else {
        toast.error(res.message || "Failed to create cart link");
        return null;
      }
    } catch (error) {
      console.error("Error creating cart link:", error);
      toast.error("An error occurred while creating the cart link");
      return null;
    }
  }, [cart, userDetails?._id, outletInfo?.businessId, accessToken]);

  const shareWithFriends = useCallback(async () => {
    const shareURL = await generateCartLink();
    if (shareURL) {
      if (navigator.share) {
        navigator
          .share({
            title: "Check out my cart",
            text: "Here's the cart I want to share with you.",
            url: shareURL,
          })
          .catch((error) => console.error("Error sharing:", error));
      } else {
        navigator.clipboard.writeText(shareURL);
        toast.success("Share URL copied to clipboard");
      }
    }
  }, [generateCartLink]);

  const shareWithUs = useCallback(async () => {
    const shareURL = await generateCartLink();
    if (shareURL) {
      const whatsappLink = `https://wa.me/8668229890?text=Check out my cart: ${encodeURIComponent(
        shareURL,
      )}`;
      window.open(whatsappLink, "_blank");
    }
  }, [generateCartLink]);

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
          <div className="mt-4 text-2xl font-bold">
            Your {outletInfo?.outLetType !== "OTHER" ? "cart" : "cart"} is empty
          </div>
        </div>
      ) : (
        <div className="w-full px-4">
          {cart.map((cartItem) => (
            <CartItem key={cartItem.id} cartItem={cartItem} />
          ))}
        </div>
      )}
      {cart.length > 0 && outletInfo?.outLetType === "OTHER" && (
        <CommonBottomButton
          fixed
          buttons={[
            {
              text: "Share with Friends",
              onClick: shareWithFriends,
            },
            {
              text: "Share with Us",
              onClick: shareWithUs,
            },
          ]}
        />
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
