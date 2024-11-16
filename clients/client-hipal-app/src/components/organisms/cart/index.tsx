import { memo, useState } from "react";
import { GiKnifeFork } from "react-icons/gi";
import { FiShare, FiUsers, FiBriefcase } from "react-icons/fi";
import CartItem from "./cartItem";
import MemoBottomPopUp from "@/components/atoms/bottomPopUp";
import useTableData from "@/components/store/useTableData";
import { useCartStore } from "@/components/store/useCartStore";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useCart } from "@/components/store/useCart";
import { BiArrowBack } from "react-icons/bi";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { apiRpc } from "@hi/common";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { BUSINESS_KEYID } from "@/configs";
import { MdOutlineRemoveShoppingCart } from "react-icons/md";
import { toast } from "react-toastify";

const Cart = () => {
  const { cart } = useCartStore();
  const { setShowCart } = useCart();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareURL, setShareURL] = useState("");
  const tableName = useTableData((s) => s.tableName);
  const accessToken = useUserToken.getState().accessToken;
  const userDetails = useLogin((s) => s.userDetails);
  const router = useRouter();
  const customLink = useParams()?.businessId as string;

  const shareWithFriends = async (shareURL: string) => {
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
  };

  const shareWithUs = async (shareURL: string) => {
    const message = encodeURIComponent(
      `Hi, I am interested in this item. Can I know more details?\n*See the cart:* ${shareURL}`,
    );
    const whatsappUrl = `https://wa.me/8668229890?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const generateCartLink = async () => {
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
      return;
    }

    const sanitizedCart = cart.map((item) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = item.dish;
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
        const newShareURL = `${BUSINESS_KEYID}${customLink}/cart/${res?.data?.cartID}`;
        setShareURL(newShareURL);
        setShowShareOptions(true);
      } else {
        toast.error(res.message || "Failed to create cart link");
      }
    } catch (error) {
      console.error("Error creating cart link:", error);
      toast.error("An error occurred while creating the cart link");
    }
  };

  const placeOrder = async () => {
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
      return;
    }
    if (!tableName) {
      toast.error("Table name is required");
      router.push(`/${customLink}/scan`);
      return;
    }

    const sanitizedCart = cart.map((item) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = item.dish;
      return {
        ...item,
        dish: sanitizedDish,
      };
    });

    const response = await apiRpc.cart.create.$post({
      json: {
        businessId: outletInfo?.businessId,
        userId: userDetails?._id,
        tableName: tableName,
        cart: sanitizedCart,
      },
    });
    const res = await response.json();

    if (!res.err) {
      toast.success("Cart Share successfully");
      setShowCart(false);
      useCartStore.setState({ cart: [] });
    } else {
      toast.error(res.message || "Failed to place order");
    }
  };

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
            {outletInfo?.outLetType === "OTHER" ? (
              <MdOutlineRemoveShoppingCart className="text-4xl text-primary-100" />
            ) : (
              <GiKnifeFork className="text-4xl text-primary-100" />
            )}
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
      {cart.length > 0 && tableName && outletInfo?.outLetType === "OTHER" && (
        <>
          <button
            onClick={generateCartLink}
            type="button"
            className="fixed w-[92%] mx-4 py-3 rounded-full bg-primary bottom-4 text-base-100 flex items-center justify-center"
          >
            <FiShare className="mr-2 text-xl" />
            Share
          </button>
          {showShareOptions && (
            <MemoBottomPopUp
              show={showShareOptions}
              onClose={() => setShowShareOptions(false)}
            >
              <div className="p-4">
                <div className="mb-4 text-xl font-semibold text-center text-primary">
                  Share
                </div>
                <div className="flex justify-around">
                  <button
                    type="button"
                    onClick={() => {
                      shareWithFriends(shareURL);
                      setShowShareOptions(false);
                    }}
                    className="flex flex-col items-center space-y-2"
                  >
                    <FiUsers className="text-4xl text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Share with Friends
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      shareWithUs(shareURL);
                      setShowShareOptions(false);
                    }}
                    className="flex flex-col items-center space-y-2"
                  >
                    <FiBriefcase className="text-4xl text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Share with Business
                    </span>
                  </button>
                </div>
              </div>
            </MemoBottomPopUp>
          )}
        </>
      )}
      {accessToken &&
        cart.length > 0 &&
        tableName &&
        outletInfo?.outLetType !== "OTHER" && (
          <button
            onClick={placeOrder}
            type="button"
            className="fixed w-[92%] mx-4 py-3 rounded-full bg-primary bottom-4 text-base-100"
          >
            Share The Cart
          </button>
        )}
    </div>
  );
};

const MemoCart = memo(Cart);
export default MemoCart;
