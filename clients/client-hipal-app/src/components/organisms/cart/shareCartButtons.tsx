import BottomPopUp from "@/components/atoms/bottomPopUp";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCartStore } from "@/components/store/useCartStore";
import { useLogin } from "@/components/store/useLogin";
import { BUSINESS_KEYID } from "@/configs";
import { apiRpc } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useParams, useRouter } from "next/navigation";
import { memo, useMemo, useState } from "react";
import { FiBriefcase, FiShare, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";

const MemoShareCartButtons = () => {
  const { cart } = useCartStore();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const accessToken = useUserToken.getState().accessToken;
  const userDetails = useLogin((state) => state.userDetails);
  const router = useRouter();
  const customLink = useParams()?.businessId as string;

  const [shareState, setShareState] = useState({ showOptions: false, url: "" });

  const sanitizedCart = useMemo(() => {
    return cart.map(({ dish, ...item }) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = dish;
      return { ...item, dish: sanitizedDish };
    });
  }, [cart]);

  const generateCartLink = async () => {
    if (!accessToken) {
      router.push(`/${customLink}/user/signup`);
      return;
    }

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
        setShareState({ showOptions: true, url: newShareURL });
      } else {
        toast.error(res.message || "Failed to create cart link");
      }
    } catch (error) {
      console.error("Error creating cart link:", error);
      toast.error("An error occurred while creating the cart link");
    }
  };

  const shareCart = async (type: "friends" | "business") => {
    if (!shareState.url) return;

    if (type === "friends") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Check out my cart",
            text: "Here's the cart I want to share with you.",
            url: shareState.url,
          });
        } catch (error) {
          console.error("Error sharing:", error);
        }
      } else {
        navigator.clipboard.writeText(shareState.url);
        toast.success("Share URL copied to clipboard");
      }
    } else {
      const message = encodeURIComponent(
        `Hi, I am interested in this item. Can I know more details?\n*See the cart:* ${shareState.url}`,
      );
      const whatsappUrl = `https://wa.me/${outletInfo?.phone}?text=${message}`;
      window.open(whatsappUrl, "_blank");
    }

    setShareState({ ...shareState, showOptions: false });
  };
  return (
    <>
      <button
        onClick={generateCartLink}
        type="button"
        className="fixed w-[92%] mx-4 py-3 rounded-full bg-primary bottom-4 text-base-100 flex items-center justify-center"
      >
        <FiShare className="mr-2 text-xl" />
        Share
      </button>
      {shareState.showOptions && (
        <BottomPopUp
          show={shareState.showOptions}
          onClose={() => setShareState({ ...shareState, showOptions: false })}
        >
          <div className="p-4">
            <div className="mb-4 text-xl font-semibold text-center text-primary">
              Share
            </div>
            <div className="flex justify-around">
              <button
                type="button"
                onClick={() => shareCart("friends")}
                className="flex flex-col items-center space-y-2"
              >
                <FiUsers className="text-4xl text-primary" />
                <span className="text-sm font-medium text-primary">
                  Share with Friends
                </span>
              </button>
              <button
                type="button"
                onClick={() => shareCart("business")}
                className="flex flex-col items-center space-y-2"
              >
                <FiBriefcase className="text-4xl text-primary" />
                <span className="text-sm font-medium text-primary">
                  Share with Business
                </span>
              </button>
            </div>
          </div>
        </BottomPopUp>
      )}
    </>
  );
};

const ShareCartButtons = memo(MemoShareCartButtons);
export default ShareCartButtons;
